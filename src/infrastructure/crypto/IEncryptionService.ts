import { Result } from "../../logic/Result";

export interface IEncryptionService {
  /**
   * Veriyi şifreler
   */
  encrypt(plainText: string): Promise<Result<string>>;

  /**
   * Şifreli veriyi çözer
   */
  decrypt(cipherText: string): Promise<Result<string>>;
}