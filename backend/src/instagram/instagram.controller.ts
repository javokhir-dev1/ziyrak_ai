import { Controller, Get } from '@nestjs/common';
import { InstagramService } from './instagram.service';

@Controller('api/instagram')
export class InstagramController {
  constructor(private readonly instagram: InstagramService) {}

  @Get('status')
  async status() {
    try {
      const account = await this.instagram.getAccountInfo();
      return { success: true, connected: true, account };
    } catch (err) {
      return { success: false, connected: false, message: err.message };
    }
  }

  @Get('posts')
  async posts() {
    try {
      const posts = await this.instagram.getRecentPosts(20);
      return { success: true, posts };
    } catch (err) {
      return { success: false, posts: [], message: err.message };
    }
  }
}
