import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const BASE_URL = 'https://graph.instagram.com/v21.0';

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

  constructor(private config: ConfigService) {}

  private get token() {
    const t = this.config.get('INSTAGRAM_ACCESS_TOKEN');
    if (!t) throw new Error('INSTAGRAM_ACCESS_TOKEN topilmadi');
    return t;
  }

  private get accountId() {
    const id = this.config.get('INSTAGRAM_BUSINESS_ACCOUNT_ID');
    if (!id) throw new Error('INSTAGRAM_BUSINESS_ACCOUNT_ID topilmadi');
    return id;
  }

  async replyToComment(commentId: string, text: string) {
    const res = await axios.post(`${BASE_URL}/${commentId}/replies`, {
      message: text,
      access_token: this.token,
    });
    return res.data;
  }

  async sendDM(recipientId: string, text: string) {
    const res = await axios.post(`${BASE_URL}/${this.accountId}/messages`, {
      recipient: { id: recipientId },
      message: { text },
      access_token: this.token,
    });
    return res.data;
  }

  async getAccountInfo() {
    const res = await axios.get(`${BASE_URL}/${this.accountId}`, {
      params: {
        fields: 'id,username,followers_count,media_count',
        access_token: this.token,
      },
    });
    return res.data;
  }

  async getRecentPosts(limit = 20) {
    const res = await axios.get(`${BASE_URL}/${this.accountId}/media`, {
      params: {
        fields: 'id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count',
        limit,
        access_token: this.token,
      },
    });
    return res.data.data as any[];
  }
}
