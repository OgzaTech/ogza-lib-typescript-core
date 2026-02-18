import { Result } from "../logic/Result";
import { IPaginationRequest } from "../application/dto/IPaginationRequest";

/**
 * Base Repository Interface
 * Tüm repository'lerin uygulaması gereken temel CRUD operasyonları
 * 
 * @template T - Entity tipi
 */
export interface IRepository<T, E = string> {
  save(entity: T): Promise<Result<void, E>>;
  delete(id: string | number): Promise<Result<void, E>>;
  getById(id: string | number): Promise<Result<T, E>>;
  exists(id: string | number): Promise<Result<boolean, E>>;
  count(): Promise<Result<number, E>>;
  findAll(options?: Partial<IPaginationRequest>): Promise<Result<T[], E>>;
}