import { Result } from "../../logic/Result";
import { IPaginationRequest } from "../../application/dto/IPaginationRequest";
import { IQueryBuilder, Operator, QueryCondition, QueryOrder } from "./IQueryBuilder";

/**
 * Base Query Builder
 * Abstract implementation - Her ORM extend edebilir
 */
export abstract class BaseQueryBuilder<T> implements IQueryBuilder<T> {
  protected conditions: QueryCondition<T>[] = [];
  protected orders: QueryOrder<T>[] = [];
  protected selectedFields: (keyof T)[] = [];
  protected limitValue?: number;
  protected offsetValue?: number;
  protected groupByFields: (keyof T)[] = [];

  where(field: keyof T, operator: Operator, value: any): this {
    this.conditions.push({ field, operator, value, conjunction: 'AND' });
    return this;
  }

  whereRaw(condition: string, params?: any[]): this {
    // Subclass implement eder
    return this;
  }

  andWhere(field: keyof T, operator: Operator, value: any): this {
    this.conditions.push({ field, operator, value, conjunction: 'AND' });
    return this;
  }

  orWhere(field: keyof T, operator: Operator, value: any): this {
    this.conditions.push({ field, operator, value, conjunction: 'OR' });
    return this;
  }

  whereIn(field: keyof T, values: any[]): this {
    this.conditions.push({ field, operator: 'IN', value: values, conjunction: 'AND' });
    return this;
  }

  whereNotIn(field: keyof T, values: any[]): this {
    this.conditions.push({ field, operator: 'NOT IN', value: values, conjunction: 'AND' });
    return this;
  }

  whereBetween(field: keyof T, min: any, max: any): this {
    this.conditions.push({ 
      field, 
      operator: 'BETWEEN', 
      value: [min, max], 
      conjunction: 'AND' 
    });
    return this;
  }

  whereNull(field: keyof T): this {
    this.conditions.push({ field, operator: 'IS NULL', value: null, conjunction: 'AND' });
    return this;
  }

  whereNotNull(field: keyof T): this {
    this.conditions.push({ field, operator: 'IS NOT NULL', value: null, conjunction: 'AND' });
    return this;
  }

  orderBy(field: keyof T, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orders.push({ field, direction });
    return this;
  }

  limit(count: number): this {
    this.limitValue = count;
    return this;
  }

  offset(count: number): this {
    this.offsetValue = count;
    return this;
  }

  paginate(options: Partial<IPaginationRequest>): this {
    if (options.limit) {
      this.limit(options.limit);
    }
    if (options.offset) {
      this.offset(options.offset);
    }
    if (options.page && options.limit) {
      this.offset((options.page - 1) * options.limit);
    }
    if (options.sortBy) {
      this.orderBy(options.sortBy as keyof T, options.sortDirection || 'ASC');
    }
    return this;
  }

  select(...fields: (keyof T)[]): this {
    this.selectedFields = fields;
    return this;
  }

  join<U>(table: string, leftField: keyof T, operator: Operator, rightField: string): this {
    // Subclass implement eder
    return this;
  }

  groupBy(...fields: (keyof T)[]): this {
    this.groupByFields = fields;
    return this;
  }

  having(field: keyof T, operator: Operator, value: any): this {
    // Subclass implement eder
    return this;
  }

  clone(): IQueryBuilder<T> {
    const cloned = Object.create(Object.getPrototypeOf(this));
    cloned.conditions = [...this.conditions];
    cloned.orders = [...this.orders];
    cloned.selectedFields = [...this.selectedFields];
    cloned.limitValue = this.limitValue;
    cloned.offsetValue = this.offsetValue;
    cloned.groupByFields = [...this.groupByFields];
    return cloned;
  }

  /**
   * Abstract methods - Subclass implement etmeli
   */
  abstract getMany(): Promise<Result<T[]>>;
  abstract getOne(): Promise<Result<T | null>>;
  abstract count(): Promise<Result<number>>;
  abstract exists(): Promise<Result<boolean>>;
  abstract raw(sql: string, params?: any[]): Promise<Result<any>>;
  abstract toSQL(): string;
}