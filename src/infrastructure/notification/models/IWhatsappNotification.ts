import { IBaseNotification } from './IBaseNotification';
import { NotificationChannel } from '../enums/NotificationChannel';

export interface IWhatsappNotification extends IBaseNotification {
  readonly channel: NotificationChannel.WHATSAPP;
  phoneNumber: string;
  
  // WhatsApp Business API genelde ya serbest metin (24saat kuralı) 
  // ya da şablon (Template) ister. İkisini de destekleyelim:
  content?: string;           // Düz mesaj (Session varsa)
  templateId?: string;        // 'appointment_reminder' gibi şablon adı
  variables?: Record<string, string>; // Şablondaki {{1}}, {{2}} alanları için
  mediaUrl?: string;          // Resim/PDF göndermek istersen
}