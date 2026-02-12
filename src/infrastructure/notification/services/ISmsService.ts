import { IBaseNotificationService } from './IBaseNotificationService';
import { ISmsNotification } from '../models/ISmsNotification';

export interface ISmsService extends IBaseNotificationService<ISmsNotification> {
  // send(request: SmsNotification) metodu miras alındı.
}