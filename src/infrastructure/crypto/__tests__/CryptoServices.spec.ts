import { IHashingService } from '../IHashingService';
import { IEncryptionService } from '../IEncryptionService';
import { Result } from '../../../logic/Result';

// 1. Mock Hashing (Bcrypt Simülasyonu)
class MockHashingService implements IHashingService {
  async hash(plainText: string): Promise<Result<string>> {
    // Gerçek hayatta burada bcrypt.hash çalışır.
    // Test için sonuna "_hashed" ekliyoruz.
    return Result.ok(`${plainText}_hashed`);
  }

  async compare(plainText: string, hashedValue: string): Promise<Result<boolean>> {
    // Basit mantık: plainText + "_hashed" eşit mi hashedValue'ya?
    const calculated = `${plainText}_hashed`;
    return Result.ok(calculated === hashedValue);
  }
}

// 2. Mock Encryption (AES Simülasyonu - Base64 encoding kullanacağız basitlik için)
class MockEncryptionService implements IEncryptionService {
  async encrypt(plainText: string): Promise<Result<string>> {
    // Basit bir base64 encode (Gerçek şifreleme DEĞİLDİR, test içindir)
    const encoded = Buffer.from(plainText).toString('base64');
    return Result.ok(encoded);
  }

  async decrypt(cipherText: string): Promise<Result<string>> {
    const decoded = Buffer.from(cipherText, 'base64').toString('utf-8');
    return Result.ok(decoded);
  }
}

// 3. Testler
describe('Crypto Contracts', () => {
  
  describe('IHashingService', () => {
    it('should hash and compare correctly', async () => {
      const service = new MockHashingService();
      const password = "mySecretPassword";
      
      // Hashle
      const hashResult = await service.hash(password);
      expect(hashResult.isSuccess).toBe(true);
      const hashedPassword = hashResult.getValue();
      expect(hashedPassword).toBe("mySecretPassword_hashed");

      // Doğru şifre ile karşılaştır
      const matchResult = await service.compare(password, hashedPassword);
      expect(matchResult.getValue()).toBe(true);

      // Yanlış şifre ile karşılaştır
      const failResult = await service.compare("wrongPassword", hashedPassword);
      expect(failResult.getValue()).toBe(false);
    });
  });

  describe('IEncryptionService', () => {
    it('should encrypt and decrypt back to original', async () => {
      const service = new MockEncryptionService();
      const sensitiveData = "TCKN:1234567890";

      // Şifrele
      const encryptResult = await service.encrypt(sensitiveData);
      expect(encryptResult.isSuccess).toBe(true);
      const cipherText = encryptResult.getValue();
      
      // Şifreli metin orjinalden farklı olmalı
      expect(cipherText).not.toBe(sensitiveData);

      // Çöz
      const decryptResult = await service.decrypt(cipherText);
      expect(decryptResult.isSuccess).toBe(true);
      expect(decryptResult.getValue()).toBe(sensitiveData);
    });
  });
});