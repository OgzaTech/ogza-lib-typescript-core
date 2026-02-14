import { IMiddlewareContext } from "./IMiddleware";

/**
 * Middleware Context Implementation
 */
export class MiddlewareContext<TRequest = any, TResponse = any> 
  implements IMiddlewareContext<TRequest, TResponse> {
  
  public readonly metadata: Map<string, any> = new Map();

  constructor(
    public request: TRequest,
    public response: TResponse
  ) {}

  set(key: string, value: any): void {
    this.metadata.set(key, value);
  }

  get<T = any>(key: string): T | undefined {
    return this.metadata.get(key);
  }

  has(key: string): boolean {
    return this.metadata.has(key);
  }
}