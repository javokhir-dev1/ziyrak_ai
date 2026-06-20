import { Global, Module } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { InstagramController } from './instagram.controller';

@Global()
@Module({
  providers: [InstagramService],
  controllers: [InstagramController],
  exports: [InstagramService],
})
export class InstagramModule {}
