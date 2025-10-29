import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { MailService } from './email.service';
import { ContactEmailDto } from './dto/contact-email.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // Endpoint de prueba existente (GET)
  @Get('send')
  async sendEmail(@Query('to') to: string) {
    await this.mailService.sendTestEmail(to);
    return { message: `Correo enviado a ${to}` };
  }

  // Nuevo endpoint para contacto desde frontend
  @Post('contact')
  async contact(@Body() body: ContactEmailDto) {
  const to = process.env.CONTACT_EMAIL || 'df2720298@gmail.com';
    const subject = `Mensaje desde sitio web: ${body.name}`;

    const html = `
      <h3>Nuevo mensaje de contacto</h3>
      <p><strong>Nombre:</strong> ${body.name}</p>
      <p><strong>Email:</strong> ${body.email}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${body.message.replace(/\n/g, '<br/>')}</p>
    `;

    await this.mailService.sendMail({
      to,
      subject,
      html,
      text: `${body.name} (${body.email}) te ha enviado: \n\n${body.message}`,
      from: process.env.MAIL_FROM,
      replyTo: body.email, // responder irá al remitente
    });

    return { message: 'Mensaje enviado satisfactoriamente' };
  }
}
