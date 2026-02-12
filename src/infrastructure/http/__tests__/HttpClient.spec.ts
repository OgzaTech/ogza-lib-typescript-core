import { IHttpClient } from '../interfaces/IHttpClient'; 
import { IHttpRequest } from '../models/IHttpRequest';   
import { IHttpResponse } from '../models/IHttpResponse';
import { Result } from '../../../logic/Result';

// Mock Implementation (Test içinde kalabilir veya ayrı dosyaya alınabilir, şimdilik test içinde)
class MockHttpClient implements IHttpClient {
  public requests: IHttpRequest[] = [];
  
  async request<T>(options: IHttpRequest): Promise<Result<IHttpResponse<T>>> {
    this.requests.push(options);
    if (options.url.includes('error')) return Result.fail('Network Error');

    return Result.ok({
      data: { id: 1 } as any,
      status: 200,
      statusText: 'OK',
      headers: {}
    });
  }

  async get<T>(url: string, params?: any): Promise<Result<IHttpResponse<T>>> {
    return this.request<T>({ url, method: 'GET', params });
  }

  async post<T>(url: string, body: any): Promise<Result<IHttpResponse<T>>> {
    return this.request<T>({ url, method: 'POST', body });
  }

  async put<T>(url: string, body: any): Promise<Result<IHttpResponse<T>>> {
    return this.request<T>({ url, method: 'PUT', body });
  }

  async delete<T>(url: string): Promise<Result<IHttpResponse<T>>> {
    return this.request<T>({ url, method: 'DELETE' });
  }
}

describe('IHttpClient Contract', () => {
  it('should implement get request correctly', async () => {
    const client = new MockHttpClient();
    const result = await client.get('/test');
    expect(result.isSuccess).toBe(true);
    expect(client.requests[0].method).toBe('GET');
  });
});