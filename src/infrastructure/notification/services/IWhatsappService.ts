import { IBaseNotificationService } from './IBaseNotificationService';
import { IWhatsappNotification } from '../models/IWhatsappNotification';

export interface IWhatsappService extends IBaseNotificationService<IWhatsappNotification> {
  // send(request: WhatsappNotification) metodu miras alındı.
}