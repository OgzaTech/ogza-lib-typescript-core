import { NotificationChannel } from "../enums/NotificationChannel";
import { IBaseNotification } from "./IBaseNotification";

// WebSocket/Push gibi "Event" ve "Data" odaklı kanallar
export interface IDataNotification extends IBaseNotification {
  channel: NotificationChannel.PUSH;
  recipient: string; // UserId (SocketID backend'de çözülür)
  eventName: string; // Örn: 'USER_UPDATED', 'ORDER_CREATED'
  payload: Record<string, any>; // JSON Verisi (Frontend bunu işler)
  displayMessage?: string; // (Opsiyonel) Kullanıcıya toast mesajı gösterilecekse
}
