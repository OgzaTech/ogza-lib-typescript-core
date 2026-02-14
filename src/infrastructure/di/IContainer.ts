import { Result } from "../../logic/Result";

/**
 * Dependency Injection Container Interface
 * Service'leri kaydet ve çöz (Frontend & Backend)
 */

/**
 * Service Lifecycle
 */
export enum ServiceLifetime {
  /**
   * Her çağrıda yeni instance
   */
  Transient = 'TRANSIENT',
  
  /**
   * İlk çağrıda oluştur, sonra aynısını kullan (Singleton)
   */
  Singleton = 'SINGLETON',
  
  /**
   * Request/Scope bazlı (Backend için)
   */
  Scoped = 'SCOPED'
}

/**
 * Service Descriptor
 */
export interface ServiceDescriptor<T = any> {
  /**
   * Service identifier (class veya string token)
   */
  token: string | symbol;
  
  /**
   * Factory function veya Class constructor
   */
  factory: () => T | Promise<T>;
  
  /**
   * Lifecycle
   */
  lifetime: ServiceLifetime;
  
  /**
   * Dependencies (optional - auto-injection için)
   */
  dependencies?: (string | symbol)[];
}

/**
 * Container Interface
 */
export interface IContainer {
  /**
   * Transient service kaydet
   */
  registerTransient<T>(token: string | symbol, factory: () => T): void;
  
  /**
   * Singleton service kaydet
   */
  registerSingleton<T>(token: string | symbol, factory: () => T): void;
  
  /**
   * Scoped service kaydet
   */
  registerScoped<T>(token: string | symbol, factory: () => T): void;
  
  /**
   * Instance kaydet (singleton olarak)
   */
  registerInstance<T>(token: string | symbol, instance: T): void;
  
  /**
   * Service çöz (resolve)
   */
  resolve<T>(token: string | symbol): Result<T>;
  
  /**
   * Async service çöz
   */
  resolveAsync<T>(token: string | symbol): Promise<Result<T>>;
  
  /**
   * Service kayıtlı mı kontrol et
   */
  isRegistered(token: string | symbol): boolean;
  
  /**
   * Tüm servisleri temizle
   */
  clear(): void;
  
  /**
   * Child scope oluştur (scoped services için)
   */
  createScope(): IContainer;
}

/**
 * Injectable Decorator için metadata key
 */
export const INJECTABLE_METADATA_KEY = Symbol('injectable');

/**
 * Inject Decorator için metadata key
 */
export const INJECT_METADATA_KEY = Symbol('inject');