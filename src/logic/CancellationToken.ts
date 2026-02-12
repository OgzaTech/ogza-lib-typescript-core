export interface ICancellationToken {
  isCancellationRequested: boolean;
  throwIfCancellationRequested(): void;
  // Native AbortSignal desteği (Axios, Fetch gibi kütüphanelere paslamak için)
  signal?: AbortSignal; 
}

export class CancellationToken implements ICancellationToken {
  
  constructor(private readonly nativeSignal?: AbortSignal) {}

  // 1. İptal istendi mi diye kontrol eden property
  get isCancellationRequested(): boolean {
    return this.nativeSignal ? this.nativeSignal.aborted : false;
  }

  // 2. İptal istendiyse direkt hata fırlatan metod (En sık kullanılan)
  throwIfCancellationRequested(): void {
    if (this.isCancellationRequested) {
      throw new Error('OperationCanceled'); // Veya özel bir AppError sınıfı
    }
  }
  
  // 3. Statik: Hiçbir zaman iptal edilmeyecek boş token (Default parametreler için)
  static get None(): ICancellationToken {
    return new CancellationToken();
  }

  // 4. Controller'dan oluşturmak için yardımcı
  static fromAbortSignal(signal: AbortSignal): CancellationToken {
    return new CancellationToken(signal);
  }
}