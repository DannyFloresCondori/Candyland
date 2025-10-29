import { Module } from '@nestjs/common';
import { MailService } from './email.service';
import { MailController } from './email.controller';

@Module({
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService], // 👈 exportamos para usarlo en otros módulos
})
export class MailModule {}
