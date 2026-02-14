import { ValueObject } from "./ValueObject";

/**
 * Entity'ler için benzersiz kimlik (ID) sınıfı.
 * Eğer constructor'a bir değer verilmezse, otomatik olarak rastgele bir UUID benzeri ID oluşturur.
 */
export class UniqueEntityID extends ValueObject<{ value: string | number }> {
  
  constructor(id?: string | number) {
    super({
      value: id ? id : UniqueEntityID.generateId()
    });
  }

  public getValue(): string | number {
    return this.props.value;
  }

  // Basit bir ID üretici (Production'da uuid kütüphanesi kullanılabilir ama Core'u bağımlısız tutuyoruz)
  private static generateId(): string {
    // Tarayıcı ve Node.js uyumlu basit bir random ID
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // ID'yi string'e çevirme
  public toString(): string {
    return String(this.props.value);
  }
}