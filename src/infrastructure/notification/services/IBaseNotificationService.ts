import { Result } from "../../../logic/Result";
import { IBaseNotification } from "../models";

// T, mutlaka BaseNotification'dan türeyen bir tip olmalı (Constraint)
export interface IBaseNotificationService<T extends IBaseNotification> {
  // Metot adı standart: 'send'. Artık 'sendEmail', 'sendTelegram' yok.
  send(request: T): Promise<Result<void>>;
}