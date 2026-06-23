import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from 'rxjs';
import { Conversation } from './entities/conversation.entity';
import { InboxMessage } from './entities/inbox-message.entity';
import { InstagramService, IgCredentials } from '../instagram/instagram.service';

@Injectable()
export class InboxService {
  private readonly logger = new Logger(InboxService.name);

  readonly events$ = new Subject<{ data: any; type?: string }>();

  constructor(
    @InjectRepository(Conversation)
    private convRepo: Repository<Conversation>,
    @InjectRepository(InboxMessage)
    private msgRepo: Repository<InboxMessage>,
    private instagram: InstagramService,
  ) {}

  // ─── Conversations ───

  async getConversations(telegram_id: string, instagram_account_id?: string): Promise<Conversation[]> {
    const where: any = { telegram_id };
    if (instagram_account_id) where.instagram_account_id = instagram_account_id;
    return this.convRepo.find({
      where,
      order: { lastMessageAt: 'DESC', updatedAt: 'DESC' },
    });
  }

  async getMessages(igConversationId: string): Promise<InboxMessage[]> {
    await this.convRepo.update({ igConversationId }, { unreadCount: 0 });
    return this.msgRepo.find({
      where: { igConversationId },
      order: { igCreatedAt: 'ASC', createdAt: 'ASC' },
    });
  }

  // ─── Incoming DM (webhookdan chaqiriladi) ───

  async handleIncomingDM(creds: IgCredentials, event: any, telegram_id?: string): Promise<void> {
    const messageText: string = event.message?.text || '';
    const messageId: string   = event.message?.mid || '';
    const timestamp: number   = event.timestamp;
    const instagram_account_id = creds.accountId;

    if (!messageText) return;

    const senderId = event.sender?.id;
    const recipientId = event.recipient?.id;

    if (!senderId || !recipientId) return;

    let direction: 'in' | 'out';
    let participantIgsid: string;

    if (senderId === instagram_account_id) {
      // A Holat: Faol akkaunt xabar yuboruvchi bo'lsa
      direction = 'out';
      participantIgsid = recipientId;
    } else {
      // B Holat: Faol akkaunt xabar qabul qiluvchi bo'lsa
      direction = 'in';
      participantIgsid = senderId;
    }

    let participantUsername = participantIgsid;
    let participantName: string | null = null;
    let profilePic: string | null = null;
    try {
      const userInfo = await this.instagram.getUserInfo(creds, participantIgsid);
      participantUsername = userInfo.username || userInfo.name || participantIgsid;
      participantName = userInfo.name || null;
      profilePic = userInfo.profile_pic || null;
    } catch (e) {
      this.logger.warn(`getUserInfo xatosi ${participantIgsid}: ${e.message}`);
    }

    // igConversationId akkauntga xos bo'lsin
    const igConversationId = `wh_${instagram_account_id}_${participantIgsid}`;
    let conv = await this.convRepo.findOne({ where: { igConversationId, instagram_account_id } });
    if (!conv) {
      conv = this.convRepo.create({
        telegram_id,
        instagram_account_id,
        igConversationId,
        participantIgsid,
        participantUsername,
        participantName,
        participantProfilePic: profilePic,
        lastMessage: messageText,
        lastMessageAt: timestamp ? new Date(timestamp) : new Date(),
        unreadCount: direction === 'in' ? 1 : 0,
      });
    } else {
      if (telegram_id && !conv.telegram_id) conv.telegram_id = telegram_id;
      conv.participantUsername = participantUsername;
      if (participantName) conv.participantName = participantName;
      if (profilePic) conv.participantProfilePic = profilePic;
      conv.lastMessage = messageText;
      conv.lastMessageAt = timestamp ? new Date(timestamp) : new Date();
      if (direction === 'in') conv.unreadCount = (conv.unreadCount || 0) + 1;
    }
    await this.convRepo.save(conv);

    const exists = messageId ? await this.msgRepo.findOne({ where: { igMessageId: messageId, instagram_account_id } }) : null;
    if (!exists) {
      const msg = this.msgRepo.create({
        telegram_id,
        instagram_account_id,
        igMessageId: messageId || null,
        igConversationId: conv.igConversationId,
        participantIgsid,
        direction,
        messageText,
        fromUsername: direction === 'out' ? 'me' : participantIgsid,
        igCreatedAt: timestamp ? new Date(timestamp) : new Date(),
      });
      await this.msgRepo.save(msg);

      if (direction === 'in') {
        this.events$.next({ type: 'new_message', data: { conversation: conv, message: msg } });
      }
    }
  }

  // ─── Xabar yuborish ───

  async sendMessage(creds: IgCredentials, participantIgsid: string, text: string, telegram_id?: string): Promise<InboxMessage> {
    await this.instagram.sendDM(creds, participantIgsid, text);

    const instagram_account_id = creds.accountId;
    const igConversationId = `wh_${instagram_account_id}_${participantIgsid}`;
    let conv = await this.convRepo.findOne({ where: { igConversationId, instagram_account_id } });
    if (!conv) {
      conv = this.convRepo.create({
        telegram_id,
        instagram_account_id,
        igConversationId,
        participantIgsid,
        participantUsername: participantIgsid,
        lastMessage: text,
        lastMessageAt: new Date(),
        unreadCount: 0,
      });
    } else {
      if (telegram_id && !conv.telegram_id) conv.telegram_id = telegram_id;
      conv.lastMessage = text;
      conv.lastMessageAt = new Date();
    }
    await this.convRepo.save(conv);

    const msg = this.msgRepo.create({
      telegram_id,
      instagram_account_id,
      igConversationId: conv.igConversationId,
      participantIgsid,
      direction: 'out',
      messageText: text,
      fromUsername: 'me',
      igCreatedAt: new Date(),
    });
    await this.msgRepo.save(msg);

    return msg;
  }

  // ─── Instagram API dan suhbatlarni sync qilish ───

  async syncFromInstagram(creds: IgCredentials, telegram_id?: string): Promise<{ synced: number; messages: number }> {
    let syncedConvs = 0;
    let syncedMsgs = 0;
    const botAccountId = creds.accountId;
    const instagram_account_id = creds.accountId;

    try {
      this.logger.log('=== SYNC BOSHLANDI ===');
      const conversations = await this.instagram.getConversations(creds);
      this.logger.log(`Jami suhbatlar soni: ${conversations.length}`);

      for (const igConv of conversations) {
        const convId: string = igConv.id;

        let participantIgsid = '';
        let participantUsername = '';
        try {
          const participants = await this.instagram.getConversationParticipants(creds, convId);
          const other = participants.find((p: any) => p.id !== botAccountId);
          if (other) {
            participantIgsid = other.id || '';
            participantUsername = other.username || other.id || '';
          }
        } catch (e) {
          this.logger.warn(`Participants xatosi ${convId}: ${e.message}`);
        }

        if (!participantIgsid) participantIgsid = `ig_${convId}`;

        // Akkauntga xos qidiruv
        let conv = await this.convRepo.findOne({ where: { igConversationId: convId, instagram_account_id } });
        if (!conv && participantIgsid) {
          const webhookConvId = `wh_${instagram_account_id}_${participantIgsid}`;
          conv = await this.convRepo.findOne({ where: { igConversationId: webhookConvId, instagram_account_id } });
        }
        if (!conv) {
          conv = this.convRepo.create({
            telegram_id,
            instagram_account_id,
            igConversationId: convId,
            participantIgsid,
            participantUsername,
            lastMessageAt: igConv.updated_time ? new Date(igConv.updated_time) : new Date(),
          });
          await this.convRepo.save(conv);
          syncedConvs++;
        } else {
          conv.participantIgsid = participantIgsid || conv.participantIgsid;
          conv.participantUsername = participantUsername || conv.participantUsername;
          if (telegram_id && !conv.telegram_id) conv.telegram_id = telegram_id;
          if (!conv.instagram_account_id) conv.instagram_account_id = instagram_account_id;
          await this.convRepo.save(conv);
        }

        try {
          const messages = await this.instagram.getConversationMessages(creds, convId);
          let lastMsg: { text: string; at: Date } | null = null;

          for (const igMsg of messages) {
            const exists = await this.msgRepo.findOne({ where: { igMessageId: igMsg.id } });
            if (exists) continue;

            try {
              const detail = await this.instagram.getMessageDetail(creds, igMsg.id);
              const msgText = detail.message?.trim() || '';
              if (!msgText) continue;

              const direction: 'in' | 'out' = detail.from?.id === participantIgsid ? 'in' : 'out';

              const msg = this.msgRepo.create({
                telegram_id,
                instagram_account_id,
                igMessageId: igMsg.id,
                igConversationId: conv.igConversationId,
                participantIgsid,
                direction,
                messageText: msgText,
                fromUsername: detail.from?.username || detail.from?.id || '',
                igCreatedAt: detail.created_time ? new Date(detail.created_time) : new Date(),
              });
              await this.msgRepo.save(msg);
              syncedMsgs++;

              const msgAt = detail.created_time ? new Date(detail.created_time) : new Date();
              if (!lastMsg || msgAt > lastMsg.at) lastMsg = { text: msgText, at: msgAt };
            } catch (e) {
              this.logger.warn(`Message detail xatosi ${igMsg.id}: ${e.message}`);
            }
          }

          if (lastMsg) {
            conv.lastMessage = lastMsg.text;
            conv.lastMessageAt = lastMsg.at;
            await this.convRepo.save(conv);
          }
        } catch (e) {
          this.logger.warn(`Messages xatosi ${convId}: ${e.message}`);
        }
      }
    } catch (e) {
      this.logger.error(`Sync xatosi: ${e.message}`);
      throw e;
    }

    this.logger.log(`=== SYNC TUGADI: ${syncedConvs} yangi suhbat, ${syncedMsgs} yangi xabar ===`);
    return { synced: syncedConvs, messages: syncedMsgs };
  }

  async getConversationBySender(igsid: string): Promise<Conversation | null> {
    return this.convRepo.findOne({ where: { participantIgsid: igsid } });
  }

  async getUserInfo(creds: IgCredentials, igsid: string) {
    return this.instagram.getUserInfo(creds, igsid);
  }

  async resetAndSync(): Promise<{ ok: boolean }> {
    this.logger.log('=== INBOX RESET ===');
    await this.msgRepo.clear();
    await this.convRepo.clear();
    return { ok: true };
  }

  async updateConversationUsername(igConversationId: string, username: string) {
    await this.convRepo.update({ igConversationId }, { participantUsername: username });
  }
}
