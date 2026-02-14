import { IQueryBuilder } from "./IQueryBuilder";

/**
 * Advanced Query Builder Extensions
 */
export class QueryBuilderExtensions {
  
  /**
   * Full text search
   */
  static search<T>(
    query: IQueryBuilder<T>,
    fields: (keyof T)[],
    searchTerm: string
  ): IQueryBuilder<T> {
    const terms = searchTerm.split(' ').filter(Boolean);
    
    terms.forEach((term, index) => {
      fields.forEach((field, fieldIndex) => {
        if (index === 0 && fieldIndex === 0) {
          query.where(field, 'LIKE', `%${term}%`);
        } else {
          query.orWhere(field, 'LIKE', `%${term}%`);
        }
      });
    });
    
    return query;
  }

  /**
   * Filter by multiple values (OR)
   */
  static filterByAny<T>(
    query: IQueryBuilder<T>,
    field: keyof T,
    values: any[]
  ): IQueryBuilder<T> {
    if (values.length === 0) return query;
    return query.whereIn(field, values);
  }

  /**
   * Date range filter
   */
  static dateRange<T>(
    query: IQueryBuilder<T>,
    field: keyof T,
    start: Date,
    end: Date
  ): IQueryBuilder<T> {
    return query.whereBetween(field, start, end);
  }

  /**
   * Conditional filter
   */
  static when<T>(
    query: IQueryBuilder<T>,
    condition: boolean,
    callback: (q: IQueryBuilder<T>) => IQueryBuilder<T>
  ): IQueryBuilder<T> {
    return condition ? callback(query) : query;
  }

  /**
   * Select distinct
   */
  static distinct<T>(
    query: IQueryBuilder<T>,
    fields?: (keyof T)[]
  ): IQueryBuilder<T> {
    // Implementation depends on SQL builder
    return query;
  }

  /**
   * Random order
   */
  static random<T>(query: IQueryBuilder<T>): IQueryBuilder<T> {
    return query.orderBy('RANDOM()' as any);
  }

  /**
   * Chunk processing
   */
  static async chunk<T>(
    query: IQueryBuilder<T>,
    size: number,
    callback: (items: T[]) => Promise<void>
  ): Promise<void> {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const result = await query
        .clone()
        .limit(size)
        .offset(offset)
        .getMany();

      if (result.isSuccess) {
        const items = result.getValue();
        
        if (items.length === 0) {
          hasMore = false;
        } else {
          await callback(items);
          offset += size;
        }
      } else {
        hasMore = false;
      }
    }
  }
}