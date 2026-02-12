import { IPaginatedResponse } from '../IPaginatedResponse';
import { IPaginationRequest } from '../IPaginationRequest';

describe('Pagination Interfaces', () => {
  
  it('should allow valid pagination request with sorting', () => {
    // Interface'i implemente eden bir obje oluşturuyoruz
    const request: IPaginationRequest = {
      page: 1,
      limit: 20,
      sortBy: 'created_at',
      sortDirection: 'DESC' // 'ASC' | 'DESC' tip güvenliği kontrolü
    };

    expect(request.page).toBe(1);
    expect(request.sortDirection).toBe('DESC');
  });

  it('should structure paginated response correctly', () => {
    // Mock bir response objesi
    const response: IPaginatedResponse<string> = {
      data: ['Item 1', 'Item 2'],
      meta: {
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: false
      }
    };

    expect(response.data.length).toBe(2);
    expect(response.meta.totalPages).toBe(10);
  });
});