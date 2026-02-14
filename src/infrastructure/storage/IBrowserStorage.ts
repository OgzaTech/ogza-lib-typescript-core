import { Result } from "../../logic/Result";

/**
 * Browser Storage Interface
 * localStorage, sessionStorage, IndexedDB için generic interface
 * 
 * Frontend'de kullanılır (Vue, React vb.)
 */
export interface IBrowserStorage {
  /**
   * Item'ı kaydet
   */
  setItem<T>(key: string, value: T): Result<void>;
  
  /**
   * Item'ı getir
   */
  getItem<T>(key: string): Result<T | null>;
  
  /**
   * Item'ı sil
   */
  removeItem(key: string): Result<void>;
  
  /**
   * Tüm storage'ı temizle
   */
  clear(): Result<void>;
  
  /**
   * Key var mı kontrol et
   */
  hasKey(key: string): boolean;
  
  /**
   * Tüm key'leri getir
   */
  keys(): string[];
  
  /**
   * Storage boyutunu getir (byte)
   */
  size(): number;
}

/**
 * Storage Options
 */
export interface StorageOptions {
  /**
   * Expire süresi (millisecond)
   */
  expiresIn?: number;
  
  /**
   * Encrypt edilsin mi?
   */
  encrypt?: boolean;
  
  /**
   * Prefix (namespace için)
   */
  prefix?: string;
}

/**
 * Stored Item Wrapper (metadata ile)
 */
export interface StoredItem<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
  version?: string;
}