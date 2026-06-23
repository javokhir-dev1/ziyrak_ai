import {
  Controller, Get, Post, Param, Body, Req, Sse,
  MessageEvent, HttpCode, UnauthorizedException, NotFoundException,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request } from 'express';
import { InboxService } from './inbox.service';
import { AuthService } from '../auth/auth.service';
import { InstagramAccountsService } from '../instagram-accounts/instagram-accounts.service';
import { IgCredentials } from '../instagram/instagram.service';

@Controller('api/inbox')
export class InboxController {
  constructor(
    private readonly inbox: InboxService,
    private readonly auth: AuthService,
    private readonly igAccounts: InstagramAccountsService,
  ) {}

  private getTelegramId(req: Request): string {
    const token = req.cookies?.['tg_access_token'];
    if (!token) throw new UnauthorizedException('Cookie topilmadi');
    const payload = this.auth.verifyJwt(token);
    if (!payload?.telegram_id) throw new UnauthorizedException('Token noto\'g\'ri');
    return String(payload.telegram_id);
  }

  private async getCredsFromReq(req: Request): Promise<{ creds: IgCredentials; telegram_id: string }> {
    const telegram_id = this.getTelegramId(req);
    const account = await this.igAccounts.findByTelegramId(telegram_id);
    if (!account || !account.access_token || !account.instagram_account_id) {
      throw new NotFoundException('Instagram hisobi ulanmagan');
    }
    return {
      creds: { token: account.access_token, accountId: account.instagram_account_id },
      telegram_id,
    };
  }

  @Sse('events')
  events(): Observable<MessageEvent> {
    return this.inbox.events$.pipe(
      map((payload) => ({
        type: payload.type || 'message',
        data: JSON.stringify(payload.data),
      })),
    );
  }

  @Get('conversations')
  async getConversations(@Req() req: Request) {
    const telegram_id = this.getTelegramId(req);
    // Tanlangan akkaunt bo'yicha filter
    const account = await this.igAccounts.findByTelegramId(telegram_id);
    const instagram_account_id = account?.instagram_account_id;
    return this.inbox.getConversations(telegram_id, instagram_account_id);
  }

  @Get('conversations/:igConversationId/messages')
  getMessages(@Param('igConversationId') igConversationId: string) {
    return this.inbox.getMessages(igConversationId);
  }

  @Post('conversations/:igsid/send')
  @HttpCode(200)
  async sendMessage(
    @Req() req: Request,
    @Param('igsid') igsid: string,
    @Body() body: { text: string },
  ) {
    const { creds, telegram_id } = await this.getCredsFromReq(req);
    return this.inbox.sendMessage(creds, igsid, body.text, telegram_id);
  }

  @Post('sync')
  @HttpCode(200)
  async sync(@Req() req: Request) {
    const { creds, telegram_id } = await this.getCredsFromReq(req);
    return this.inbox.syncFromInstagram(creds, telegram_id);
  }

  @Get('user/:igsid')
  async getUserInfo(@Req() req: Request, @Param('igsid') igsid: string) {
    const { creds } = await this.getCredsFromReq(req);
    return this.inbox.getUserInfo(creds, igsid);
  }

  @Post('reset')
  @HttpCode(200)
  async reset() {
    await this.inbox.resetAndSync();
    return { ok: true };
  }
}
