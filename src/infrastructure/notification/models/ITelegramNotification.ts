import { IBaseNotification } from './IBaseNotification';
import { NotificationChannel } from '../enums/NotificationChannel';

export interface ITelegramNotification extends IBaseNotification {
  readonly channel: NotificationChannel.TELEGRAM; // Type Guard için sabitlendi
  chatId: string;
  message: string;
  parseMode?: 'Markdown' | 'HTML';
}