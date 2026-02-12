
import { IDataNotification } from "./IDataNotification";
import { ITelegramNotification } from './ITelegramNotification';
import { IWebSocketNotification } from './IWebSocketNotification';
import { IEmailNotification } from "./IEmailNotification";
import { ISmsNotification } from "./ISmsNotification";
import { IWhatsappNotification } from "./IWhatsappNotification";

// Uygulamanın tanıdığı tüm bildirim tipleri
export type INotificationRequest = 
  | ITelegramNotification 
  | IWebSocketNotification
  | IDataNotification
  | ISmsNotification        
  | IWhatsappNotification  
  | IEmailNotification;

export * from './ITelegramNotification';
export * from './IDataNotification';
export * from './IWebSocketNotification';
export * from './IEmailNotification';
export * from './IBaseNotification';
export * from './ISmsNotification';        
export * from './IWhatsappNotification';   