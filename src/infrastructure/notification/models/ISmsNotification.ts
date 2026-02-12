import { IBaseNotification } from './IBaseNotification';
import { NotificationChannel } from '../enums/NotificationChannel';

export interface ISmsNotification extends IBaseNotification {
  readonly channel: NotificationChannel.SMS;
  phoneNumber: string; // E.164 formatında (+90555...)
  content: string;     // Mesaj metni
}
