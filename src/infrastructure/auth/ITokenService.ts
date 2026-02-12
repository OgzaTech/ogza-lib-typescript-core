import { Result } from "../../logic/Result";
// Import yolu güncellendi:
import { ITokenPayload } from "./models/ITokenPayload"; 

export interface ITokenService {
  /**
   * Payload'dan yeni bir token üretir (Sign)
   * Sadece Backend kullanır.
   */
  sign(payload: ITokenPayload, expiresIn?: string | number): Promise<Result<string>>;

  /**
   * Token'ın geçerliliğini ve imzasını doğrular (Verify)
   */
  verify(token: string): Promise<Result<ITokenPayload>>;

  /**
   * Token'ı doğrulamadan sadece içini okur (Decode)
   */
  decode(token: string): Result<ITokenPayload | null>;
}