import { Result } from '../../logic/Result';
import { INotificationRequest } from './models/index';
import { IBaseNotificationService } from './services/IBaseNotificationService';


// Ana servis, tüm request tiplerini kabul eden bir versiyondur.
export interface INotificationService extends IBaseNotificationService<INotificationRequest> {
  send(request: INotificationRequest): Promise<Result<void>>
  
  // İstersen toplu gönderimi de buraya ekleyebilirsin:
  sendBatch(requests: INotificationRequest[]): Promise<Result<void>>;
}