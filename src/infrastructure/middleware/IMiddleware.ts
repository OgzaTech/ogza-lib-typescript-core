import { Result } from "../../logic/Result";

/**
 * Middleware Interface
 * Backend için middleware pipeline (Express, Fastify, Koa benzeri)
 */

/**
 * Middleware Context
 * Request/Response wrapper
 */
export interface IMiddlewareContext<TRequest = any, TResponse = any> {
  /**
   * Request data
   */
  request: TRequest;
  
  /**
   * Response data
   */
  response: TResponse;
  
  /**
   * Context metadata (user, session vb.)
   */
  metadata: Map<string, any>;
  
  /**
   * Set metadata
   */
  set(key: string, value: any): void;
  
  /**
   * Get metadata
   */
  get<T = any>(key: string): T | undefined;
  
  /**
   * Has metadata
   */
  has(key: string): boolean;
}

/**
 * Next function
 */
export type NextFunction = () => Promise<Result<void>>;

/**
 * Middleware Handler
 */
export type MiddlewareHandler<TContext = IMiddlewareContext> = (
  context: TContext,
  next: NextFunction
) => Promise<Result<void>>;

/**
 * Middleware Interface
 */
export interface IMiddleware<TContext = IMiddlewareContext> {
  /**
   * Middleware adı (debug için)
   */
  name?: string;
  
  /**
   * Execute middleware
   */
  execute(context: TContext, next: NextFunction): Promise<Result<void>>;
}

/**
 * Middleware Pipeline Interface
 */
export interface IMiddlewarePipeline<TContext = IMiddlewareContext> {
  /**
   * Middleware ekle
   */
  use(middleware: IMiddleware<TContext> | MiddlewareHandler<TContext>): this;
  
  /**
   * Pipeline'ı çalıştır
   */
  execute(context: TContext): Promise<Result<void>>;
  
  /**
   * Middleware sayısı
   */
  count(): number;
  
  /**
   * Pipeline'ı temizle
   */
  clear(): void;
}

/**
 * Middleware Options
 */
export interface MiddlewareOptions {
  /**
   * Timeout (ms)
   */
  timeout?: number;
  
  /**
   * Skip on error (hata olsa bile devam et)
   */
  skipOnError?: boolean;
  
  /**
   * Order/Priority
   */
  priority?: number;
}