import { Result } from "../../logic/Result";

export interface IHashingService {
  /**
   * Metni hash'ler (Örn: Parola oluştururken)
   * @param plainText Şifresiz metin
   */
  hash(plainText: string): Promise<Result<string>>;

  /**
   * Düz metin ile hash'i karşılaştırır (Örn: Login olurken)
   * @param plainText Kullanıcının girdiği şifre
   * @param hashedValue Veritabanındaki hash
   */
  compare(plainText: string, hashedValue: string): Promise<Result<boolean>>;
}