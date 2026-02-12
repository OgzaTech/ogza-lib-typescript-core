import { IBaseNotificationService } from './IBaseNotificationService';
import { ITelegramNotification } from '../models/ITelegramNotification';

export interface ITelegramService extends IBaseNotificationService<ITelegramNotification> {
  // Miras alınan: send(request: TelegramNotification): Promise<Result<void>>
}