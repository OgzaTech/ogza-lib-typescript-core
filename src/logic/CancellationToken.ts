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

  // 2. Native signal'e public erişim (Fetch, Axios vb. için)
  get signal(): AbortSignal | undefined {
    return this.nativeSignal;
  }

  // 3. İptal istendiyse direkt hata fırlatan metod
  throwIfCancellationRequested(): void {
    if (this.isCancellationRequested) {
      throw new Error('OperationCanceled');
    }
  }
  
  // 4. Statik: Hiçbir zaman iptal edilmeyecek boş token
  static get None(): ICancellationToken {
    return new CancellationToken();
  }

  // 5. Controller'dan oluşturmak için yardımcı
  static fromAbortSignal(signal: AbortSignal): CancellationToken {
    return new CancellationToken(signal);
  }
}