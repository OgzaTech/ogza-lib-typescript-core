import { Result } from "../logic/Result";
import { IPaginationRequest } from "../application/dto/IPaginationRequest";

/**
 * Base Repository Interface
 * Tüm repository'lerin uygulaması gereken temel CRUD operasyonları
 * 
 * @template T - Entity tipi
 */
export interface IRepository<T> {
  /**
   * Entity'yi kaydeder (create veya update)
   */
  save(entity: T): Promise<Result<void>>;
  
  /**
   * Entity'yi ID ile siler
   */
  delete(id: string | number): Promise<Result<void>>;
  
  /**
   * ID ile entity getirir
   */
  getById(id: string | number): Promise<Result<T>>;
  
  /**
   * Entity'nin var olup olmadığını kontrol eder
   */
  exists(id: string | number): Promise<Result<boolean>>;
  
  /**
   * Toplam entity sayısını döndürür
   */
  count(): Promise<Result<number>>;
  
  /**
   * Tüm entity'leri getirir (pagination destekli)
   * Mevcut IPaginationRequest interface'ini kullanır
   */
  findAll(options?: Partial<IPaginationRequest>): Promise<Result<T[]>>;
}