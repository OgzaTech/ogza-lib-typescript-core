import { NotificationChannel } from "../enums/NotificationChannel";

export interface IBaseNotification {
  channel: NotificationChannel;
  metadata?: Record<string, any>; // TraceId, CorrelationId vb.
}