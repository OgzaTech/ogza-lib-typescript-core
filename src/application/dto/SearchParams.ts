export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string; 
  filters?: Record<string, any>; 
  sort?: string; 
}