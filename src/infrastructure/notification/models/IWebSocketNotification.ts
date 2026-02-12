import { IBaseNotification } from './IBaseNotification';
import { NotificationChannel } from '../enums/NotificationChannel';

export interface IWebSocketNotification extends IBaseNotification {
  readonly channel: NotificationChannel.WEBSOCKET;
  userId: string;       // Kime?
  eventName: string;    // Olay ne? (örn: 'order:created')
  payload: unknown;     // Veri ne?
}