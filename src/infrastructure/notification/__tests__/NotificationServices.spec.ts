import { Result } from '../../../logic/Result';
import { NotificationChannel } from '../enums/NotificationChannel';

// 1. Yeni Interface'leri import ediyoruz
import { IEmailService } from '../services/IEmailService';
import { ISmsService } from '../services/ISmsService';
import { IWhatsappService } from '../services/IWhatsappService';

// 2. Yeni Request Modellerini import ediyoruz
import { IEmailNotification } from '../models/IEmailNotification';
import { ISmsNotification } from '../models/ISmsNotification';
import { IWhatsappNotification } from '../models/IWhatsappNotification';


// --- Mock Email Service ---
class MockEmailService implements IEmailService {
  public sentMails: IEmailNotification[] = [];

  async send(request: IEmailNotification): Promise<Result<void>> {
    // Validasyon Simülasyonu
    if (!request.recipient || !request.recipient.includes('@')) {
      return Result.fail('Invalid email address');
    }
    this.sentMails.push(request);
    return Result.ok<void>();
  }
}

// --- Mock SMS Service ---
class MockSmsService implements ISmsService {
  public sentSms: ISmsNotification[] = [];

  async send(request: ISmsNotification): Promise<Result<void>> {
    // Kanal kontrolü (Type Safety kontrolü)
    if (request.channel !== NotificationChannel.SMS) {
      return Result.fail('Invalid channel for SMS service');
    }
    this.sentSms.push(request);
    return Result.ok<void>();
  }
}

// --- Mock WhatsApp Service ---
class MockWhatsappService implements IWhatsappService {
  public sentMessages: IWhatsappNotification[] = [];

  async send(request: IWhatsappNotification): Promise<Result<void>> {
    // Template zorunluluğu kontrolü simülasyonu
    if (!request.content && !request.templateId) {
      return Result.fail('Either content or templateId is required');
    }
    this.sentMessages.push(request);
    return Result.ok<void>();
  }
}

/**
 * TEST SENARYOLARI
 */
describe('Notification Infrastructure Contracts (Core Layer)', () => {
  
  // 1. EMAIL TESTLERİ
  describe('IEmailService Contract', () => {
    it('should implement generic send method specifically for EmailNotification', async () => {
      const service = new MockEmailService();
      
      const emailPayload: IEmailNotification = {
        channel: NotificationChannel.EMAIL, // Enum kullanımı
        recipient: 'user@example.com',
        subject: 'Test Subject',
        content: '<p>Welcome</p>'
      };

      const result = await service.send(emailPayload);

      expect(result.isSuccess).toBe(true);
      expect(service.sentMails.length).toBe(1);
      expect(service.sentMails[0].channel).toBe(NotificationChannel.EMAIL);
    });

    it('should fail with invalid data', async () => {
      const service = new MockEmailService();
      const invalidPayload: IEmailNotification = {
        channel: NotificationChannel.EMAIL,
        recipient: 'invalid-email', // @ yok
        subject: 'Hi',
        content: '...'
      };

      const result = await service.send(invalidPayload);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Invalid email address');
    });
  });

  // 2. SMS TESTLERİ
  describe('ISmsService Contract', () => {
    it('should accept SmsNotification and process it', async () => {
      const service = new MockSmsService();
      const smsPayload: ISmsNotification = {
        channel: NotificationChannel.SMS,
        phoneNumber: '+905551234567',
        content: 'Your code is 1234'
      };

      const result = await service.send(smsPayload);

      expect(result.isSuccess).toBe(true);
      expect(service.sentSms[0].phoneNumber).toBe('+905551234567');
    });
  });

  // 3. WHATSAPP TESTLERİ (Yeni Eklendi)
  describe('IWhatsappService Contract', () => {
    it('should send whatsapp template message successfully', async () => {
      const service = new MockWhatsappService();
      const wpPayload: IWhatsappNotification = {
        channel: NotificationChannel.WHATSAPP,
        phoneNumber: '+905559876543',
        templateId: 'otp_verification',
        variables: { '1': '123456' } // Şablon değişkenleri
      };

      const result = await service.send(wpPayload);

      expect(result.isSuccess).toBe(true);
      expect(service.sentMessages[0].templateId).toBe('otp_verification');
    });

    it('should fail if both content and template are missing', async () => {
      const service = new MockWhatsappService();
      const invalidPayload: IWhatsappNotification = {
        channel: NotificationChannel.WHATSAPP,
        phoneNumber: '+905000000000'
        // content YOK, templateId YOK
      };

      const result = await service.send(invalidPayload);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('required');
    });
  });

});