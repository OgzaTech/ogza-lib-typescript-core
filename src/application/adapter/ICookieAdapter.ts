export interface CookieOptions {
  expires?: number | Date; // Gün sayısı veya Tarih
  path?: string;
  domain?: string;
  secure?: boolean;
}

export interface ICookieAdapter {
  get(name: string): string | null;
  set(name: string, value: string, options?: CookieOptions): void;
  remove(name: string, options?: CookieOptions): void;
}