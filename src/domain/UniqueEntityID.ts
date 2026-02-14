import { ValueObject } from "./ValueObject";

/**
 * Entity'ler için benzersiz kimlik (ID) sınıfı.
 * Eğer constructor'a bir değer verilmezse, otomatik olarak UUID v4 oluşturur.
 */
export class UniqueEntityID extends ValueObject<{ value: string | number }> {
  
  constructor(id?: string | number) {
    super({
      // id !== undefined kontrolü yapıyoruz (0, '', false kabul edilir)
      value: id !== undefined ? id : UniqueEntityID.generateId()
    });
  }

  public getValue(): string | number {
    return this.props.value;
  }

  /**
   * Kriptografik olarak güvenli UUID v4 üretir.
   * Node.js 14.17+ ve tüm modern tarayıcıları destekler.
   */
  private static generateId(): string {
    // Node.js ve modern tarayıcılar için crypto.randomUUID()
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    
    // Fallback: crypto.getRandomValues() kullanarak manuel UUID v4
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      return UniqueEntityID.generateUUIDv4();
    }
    
    // Son çare: Node.js require (CommonJS ortamlar için)
    try {
      const nodeCrypto = require('crypto');
      return nodeCrypto.randomUUID();
    } catch {
      throw new Error(
        'crypto.randomUUID() is not available. Please upgrade to Node.js 14.17+ or use a modern browser.'
      );
    }
  }

  /**
   * Manuel UUID v4 üretimi (RFC 4122 uyumlu)
   * crypto.getRandomValues() kullanarak kriptografik güvenli
   */
  private static generateUUIDv4(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    
    // Version 4 (0100) ve variant (10xx) bitlerini ayarla
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
    
    const hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`;
  }

  public toString(): string {
    return String(this.props.value);
  }
}