import { Result } from "../../logic/Result";
import { IBrowserStorage, StoredItem } from "./IBrowserStorage";

/**
 * LocalStorage Adapter
 * IBrowserStorage'ın localStorage implementasyonu
 */
export class LocalStorageAdapter implements IBrowserStorage {
  private readonly prefix: string;

  constructor(prefix: string = 'app_') {
    this.prefix = prefix;
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  setItem<T>(key: string, value: T): Result<void> {
    try {
      const fullKey = this.getFullKey(key);
      const item: StoredItem<T> = {
        value,
        timestamp: Date.now()
      };
      
      localStorage.setItem(fullKey, JSON.stringify(item));
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to set item: ${error}`);
    }
  }

  getItem<T>(key: string): Result<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const raw = localStorage.getItem(fullKey);
      
      if (!raw) {
        return Result.ok(null);
      }

      const item: StoredItem<T> = JSON.parse(raw);
      
      // Check expiration
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.removeItem(key);
        return Result.ok(null);
      }

      return Result.ok(item.value);
    } catch (error) {
      return Result.fail(`Failed to get item: ${error}`);
    }
  }

  removeItem(key: string): Result<void> {
    try {
      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to remove item: ${error}`);
    }
  }

  clear(): Result<void> {
    try {
      // Sadece kendi prefix'li key'leri sil
      const keysToRemove = this.keys();
      keysToRemove.forEach(key => {
        localStorage.removeItem(this.getFullKey(key));
      });
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to clear storage: ${error}`);
    }
  }

  hasKey(key: string): boolean {
    return localStorage.getItem(this.getFullKey(key)) !== null;
  }

  keys(): string[] {
    const allKeys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        allKeys.push(key.substring(this.prefix.length));
      }
    }
    
    return allKeys;
  }

  size(): number {
    let totalSize = 0;
    
    this.keys().forEach(key => {
      const fullKey = this.getFullKey(key);
      const value = localStorage.getItem(fullKey);
      if (value) {
        totalSize += value.length + fullKey.length;
      }
    });
    
    return totalSize;
  }

  /**
   * Set item with expiration
   */
  setItemWithExpiry<T>(key: string, value: T, expiresInMs: number): Result<void> {
    try {
      const fullKey = this.getFullKey(key);
      const item: StoredItem<T> = {
        value,
        timestamp: Date.now(),
        expiresAt: Date.now() + expiresInMs
      };
      
      localStorage.setItem(fullKey, JSON.stringify(item));
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to set item with expiry: ${error}`);
    }
  }
}