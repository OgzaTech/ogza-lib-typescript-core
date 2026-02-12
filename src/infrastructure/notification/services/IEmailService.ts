import { IBaseNotificationService } from './IBaseNotificationService';
import { IEmailNotification } from '../models/IEmailNotification';

// IEmailService artık bir IBaseNotificationService'dir ama SADECE EmailNotification kabul eder.
export interface IEmailService extends IBaseNotificationService<IEmailNotification> {
  // Ekstra bir metot tanımlamana gerek yok, 'send(request: EmailNotification)' miras alındı.
}