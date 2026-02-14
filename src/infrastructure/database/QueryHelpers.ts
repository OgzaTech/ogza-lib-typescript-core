import { IQueryBuilder } from "./IQueryBuilder";

/**
 * Query Helper Functions
 * Sık kullanılan query pattern'leri
 */
export class QueryHelpers {
  /**
   * Pagination helper
   */
  static paginate<T>(
    query: IQueryBuilder<T>,
    page: number,
    pageSize: number = 10
  ): IQueryBuilder<T> {
    return query
      .limit(pageSize)
      .offset((page - 1) * pageSize);
  }

  /**
   * Search helper (LIKE query)
   */
  static search<T>(
    query: IQueryBuilder<T>,
    fields: (keyof T)[],
    searchTerm: string
  ): IQueryBuilder<T> {
    fields.forEach((field, index) => {
      if (index === 0) {
        query.where(field, 'LIKE', `%${searchTerm}%`);
      } else {
        query.orWhere(field, 'LIKE', `%${searchTerm}%`);
      }
    });
    return query;
  }

  /**
   * Date range helper
   */
  static dateRange<T>(
    query: IQueryBuilder<T>,
    field: keyof T,
    startDate: Date,
    endDate: Date
  ): IQueryBuilder<T> {
    return query.whereBetween(field, startDate, endDate);
  }

  /**
   * Active records helper
   */
  static active<T extends { isActive?: boolean }>(
    query: IQueryBuilder<T>
  ): IQueryBuilder<T> {
    return query.where('isActive' as keyof T, '=', true);
  }

  /**
   * Soft delete helper
   */
  static notDeleted<T extends { deletedAt?: Date | null }>(
    query: IQueryBuilder<T>
  ): IQueryBuilder<T> {
    return query.whereNull('deletedAt' as keyof T);
  }
}