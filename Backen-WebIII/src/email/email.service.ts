import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    const host = process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io';
    const port = parseInt(process.env.MAILTRAP_PORT || '2525', 10);
    const user = process.env.MAILTRAP_USER || process.env.MAIL_USER || 'f62d03b6cfbca2';
    const pass = process.env.MAILTRAP_PASS || process.env.MAIL_PASS || 'f4992e9146562e';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      auth: { user, pass },
    } as SMTPTransport.Options);

    // Intentar verificar el transporte (no bloqueante)
    this.transporter.verify().then(() => {
      this.logger.log('Mail transporter listo');
    }).catch((err) => {
      this.logger.warn('No se pudo verificar el transporter de correo. Revisa las variables de entorno. ' + err?.message);
    });
  }

  /**
   * Enviar correo genérico.
   * @param to dirección o direcciones (separadas por coma)
   * @param subject asunto
   * @param html contenido HTML (opcional)
   * @param text contenido en texto plano (opcional)
   */
  async sendMail(options: { to: string; subject: string; html?: string; text?: string; from?: string; replyTo?: string }) {
    const from = options.from || process.env.MAIL_FROM || 'Candyland <noreply@candyland.test>';

    const mailOptions: any = {
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    if (options.replyTo) {
      mailOptions.replyTo = options.replyTo;
    }

    const info = await this.transporter.sendMail(mailOptions);

    this.logger.log(`Correo enviado a ${options.to} - messageId=${info.messageId}`);
    return info;
  }

  /**
   * Método de conveniencia para pruebas rápidas desde controladores
   */
  async sendTestEmail(to: string) {
    const defaultTo = process.env.CONTACT_EMAIL || 'df2720298@gmail.com';
    return this.sendMail({
      to: defaultTo,
      subject: 'Correo de prueba desde Candyland',
      text: 'Hola! Este es un correo de prueba desde el backend NestJS.',
      html: `<h2>Hola 👋</h2><p>Este es un correo de prueba desde <b>Candyland</b>.</p>`,
    });
  }
}
