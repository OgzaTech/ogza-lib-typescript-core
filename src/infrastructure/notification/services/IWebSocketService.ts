import { IBaseNotificationService } from './IBaseNotificationService';
import { IWebSocketNotification } from '../models/IWebSocketNotification';

export interface IWebSocketService extends IBaseNotificationService<IWebSocketNotification> {
  // Miras alınan: send(request: WebSocketNotification): Promise<Result<void>>
}