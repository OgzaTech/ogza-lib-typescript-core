import { Result } from "../../logic/Result";
import { IPaginationRequest } from "../../application/dto/IPaginationRequest";

/**
 * Query Builder Interface
 * Type-safe sorgu oluşturma (Frontend & Backend)
 * 
 * Fluent API ile SQL/NoSQL sorgularını güvenli şekilde oluştur
 */
export interface IQueryBuilder<T> {
  /**
   * WHERE koşulu ekle
   */
  where(field: keyof T, operator: Operator, value: any): this;
  
  /**
   * WHERE koşulu ekle (custom)
   */
  whereRaw(condition: string, params?: any[]): this;
  
  /**
   * AND koşulu
   */
  andWhere(field: keyof T, operator: Operator, value: any): this;
  
  /**
   * OR koşulu
   */
  orWhere(field: keyof T, operator: Operator, value: any): this;
  
  /**
   * WHERE IN
   */
  whereIn(field: keyof T, values: any[]): this;
  
  /**
   * WHERE NOT IN
   */
  whereNotIn(field: keyof T, values: any[]): this;
  
  /**
   * WHERE BETWEEN
   */
  whereBetween(field: keyof T, min: any, max: any): this;
  
  /**
   * WHERE NULL
   */
  whereNull(field: keyof T): this;
  
  /**
   * WHERE NOT NULL
   */
  whereNotNull(field: keyof T): this;
  
  /**
   * ORDER BY
   */
  orderBy(field: keyof T, direction?: 'ASC' | 'DESC'): this;
  
  /**
   * LIMIT
   */
  limit(count: number): this;
  
  /**
   * OFFSET
   */
  offset(count: number): this;
  
  /**
   * Pagination
   */
  paginate(options: Partial<IPaginationRequest>): this;
  
  /**
   * SELECT fields
   */
  select(...fields: (keyof T)[]): this;
  
  /**
   * JOIN
   */
  join<U>(
    table: string,
    leftField: keyof T,
    operator: Operator,
    rightField: string
  ): this;
  
  /**
   * GROUP BY
   */
  groupBy(...fields: (keyof T)[]): this;
  
  /**
   * HAVING
   */
  having(field: keyof T, operator: Operator, value: any): this;
  
  /**
   * Execute query - Birden fazla sonuç
   */
  getMany(): Promise<Result<T[]>>;
  
  /**
   * Execute query - Tek sonuç
   */
  getOne(): Promise<Result<T | null>>;
  
  /**
   * Execute query - Count
   */
  count(): Promise<Result<number>>;
  
  /**
   * Execute query - Exists
   */
  exists(): Promise<Result<boolean>>;
  
  /**
   * Raw SQL çalıştır
   */
  raw(sql: string, params?: any[]): Promise<Result<any>>;
  
  /**
   * Query'yi string'e çevir (debug için)
   */
  toSQL(): string;
  
  /**
   * Query'yi klonla
   */
  clone(): IQueryBuilder<T>;
}

/**
 * Query Operators
 */
export type Operator = 
  | '=' 
  | '!=' 
  | '>' 
  | '>=' 
  | '<' 
  | '<=' 
  | 'LIKE' 
  | 'NOT LIKE'
  | 'IN'
  | 'NOT IN'
  | 'BETWEEN'
  | 'IS NULL'
  | 'IS NOT NULL';

/**
 * Query Condition
 */
export interface QueryCondition<T> {
  field: keyof T;
  operator: Operator;
  value: any;
  conjunction?: 'AND' | 'OR';
}

/**
 * Query Order
 */
export interface QueryOrder<T> {
  field: keyof T;
  direction: 'ASC' | 'DESC';
}

/**
 * Query Options
 */
export interface QueryOptions {
  timeout?: number;
  readOnly?: boolean;
  cache?: boolean;
  cacheTTL?: number;
}