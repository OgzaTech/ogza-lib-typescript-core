export type SortDirection = 'ASC' | 'DESC';

export interface IPaginationRequest {
  page: number;
  limit: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}