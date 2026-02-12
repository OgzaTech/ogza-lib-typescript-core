import { NotificationChannel } from "../enums/NotificationChannel";
import { IBaseNotification } from "./IBaseNotification";


export interface IEmailNotification extends IBaseNotification {
  channel: NotificationChannel.EMAIL;
  recipient: string; 
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  templateId?: string; // SendGrid/AWS SES şablon ID
  variables?: Record<string, any>; // Şablona gidecek veriler
  content?: string; // Şablon yoksa düz HTML
  attachments?: { filename: string; content: Buffer | string }[];
}