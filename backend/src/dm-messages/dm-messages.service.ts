import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DmMessage } from './entities/dm-message.entity';
import { DmCounter } from './entities/dm-counter.entity';

const DEFAULT_MESSAGES = [
  "Salom! Xabaringiz uchun rahmat 😊 Sizga qanday yordam bera olamiz?",
  "Assalomu alaykum! Bizga murojaat etganingiz uchun tashakkur 🙏 Tez orada javob beramiz!",
  "Salom! So'rovingizni qabul qildik ✅ Mutaxassisimiz siz bilan bog'lanadi.",
  "Xabaringiz uchun rahmat! 🌟 Qo'shimcha savollaringiz bo'lsa, bemalol yozing.",
  "Salom! Bizga ishonganingiz uchun minnatdormiz 💙 Sizga albatta yordam beramiz.",
  "Assalomu alaykum! So'rovingiz qabul qilindi 📩 Ko'p o'tmay javob beramiz.",
  "Salom! Murojaat etganingiz uchun rahmat 😊 Bugun siz bilan bog'lanamiz.",
  "Xabaringizni ko'rdik! ✨ Barcha savollaringizga javob berishga tayyormiz.",
  "Salom! Bizning jamoamiz doimo siz uchun 💪 Savol va takliflaringizni kutamiz.",
  "Assalomu alaykum! Xizmatimizdan foydalanganingiz uchun rahmat 🎯 Yaqin orada bog'lanamiz!",
];

@Injectable()
export class DmMessagesService {
  constructor(
    @InjectRepository(DmMessage)
    private messageRepo: Repository<DmMessage>,

    @InjectRepository(DmCounter)
    private counterRepo: Repository<DmCounter>,
  ) {}

  async findAll(): Promise<DmMessage[]> {
    const msgs = await this.messageRepo.find({ order: { sortOrder: 'ASC' } });
    if (msgs.length === 0) {
      return this.seedDefaults();
    }
    return msgs;
  }

  private async seedDefaults(): Promise<DmMessage[]> {
    const entities = DEFAULT_MESSAGES.map((text, i) =>
      this.messageRepo.create({ text, sortOrder: i }),
    );
    return this.messageRepo.save(entities);
  }

  async replaceAll(texts: string[]): Promise<DmMessage[]> {
    await this.messageRepo.delete({});
    const entities = texts.map((text, i) =>
      this.messageRepo.create({ text, sortOrder: i }),
    );
    await this.messageRepo.save(entities);
    // Reset counter
    await this.resetCounter();
    return this.findAll();
  }

  async getNextMessage(): Promise<string> {
    const messages = await this.findAll();
    const counter = await this.getCounter();
    const index = counter.currentIndex % messages.length;
    const message = messages[index].text;
    // Increment counter
    counter.currentIndex = (index + 1) % messages.length;
    await this.counterRepo.save(counter);
    return message;
  }

  async getCounter(): Promise<DmCounter> {
    let counter = await this.counterRepo.findOne({ where: { id: 1 } });
    if (!counter) {
      counter = this.counterRepo.create({ id: 1, currentIndex: 0 });
      await this.counterRepo.save(counter);
    }
    return counter;
  }

  private async resetCounter() {
    await this.counterRepo.update(1, { currentIndex: 0 });
  }
}
