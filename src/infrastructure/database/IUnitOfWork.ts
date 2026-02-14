import { Result } from "../../logic/Result";

/**
 * Unit of Work Pattern
 * Transaction yönetimi için
 * 
 * Backend'de kullanılır - Birden fazla repository operasyonunu
 * tek bir transaction'da toplar
 */
export interface IUnitOfWork {
  /**
   * Transaction başlat
   */
  begin(): Promise<Result<void>>;
  
  /**
   * Transaction'ı commit et (kaydet)
   */
  commit(): Promise<Result<void>>;
  
  /**
   * Transaction'ı rollback et (geri al)
   */
  rollback(): Promise<Result<void>>;
  
  /**
   * Transaction aktif mi?
   */
  isActive(): boolean;
  
  /**
   * Transaction içinde iş yap (auto commit/rollback)
   */
  execute<T>(work: () => Promise<Result<T>>): Promise<Result<T>>;
}

/**
 * Transaction Manager
 * Nested transaction desteği ile
 */
export interface ITransactionManager {
  /**
   * Transaction başlat ve callback çalıştır
   * Başarılı ise commit, hata varsa rollback
   */
  runInTransaction<T>(
    work: (transaction: ITransaction) => Promise<Result<T>>
  ): Promise<Result<T>>;
  
  /**
   * Savepoint oluştur (nested transaction için)
   */
  createSavepoint(name: string): Promise<Result<void>>;
  
  /**
   * Savepoint'e geri dön
   */
  rollbackToSavepoint(name: string): Promise<Result<void>>;
  
  /**
   * Savepoint'i sil
   */
  releaseSavepoint(name: string): Promise<Result<void>>;
}

/**
 * Transaction Interface
 * Aktif transaction'ı temsil eder
 */
export interface ITransaction {
  /**
   * Transaction ID
   */
  readonly id: string;
  
  /**
   * Commit
   */
  commit(): Promise<Result<void>>;
  
  /**
   * Rollback
   */
  rollback(): Promise<Result<void>>;
  
  /**
   * Isolation level
   */
  readonly isolationLevel?: TransactionIsolationLevel;
}

/**
 * Transaction Isolation Levels
 */
export enum TransactionIsolationLevel {
  ReadUncommitted = 'READ_UNCOMMITTED',
  ReadCommitted = 'READ_COMMITTED',
  RepeatableRead = 'REPEATABLE_READ',
  Serializable = 'SERIALIZABLE'
}

/**
 * Transaction Options
 */
export interface TransactionOptions {
  isolationLevel?: TransactionIsolationLevel;
  timeout?: number; // milliseconds
  readOnly?: boolean;
}