import { Result } from "../../logic/Result";
import { 
  IMiddlewarePipeline, 
  IMiddleware, 
  IMiddlewareContext,
  MiddlewareHandler,
  NextFunction 
} from "./IMiddleware";

/**
 * Middleware wrapper
 */
class MiddlewareWrapper<TContext = IMiddlewareContext> implements IMiddleware<TContext> {
  public name?: string;

  constructor(
    private handler: MiddlewareHandler<TContext>,
    name?: string
  ) {
    this.name = name;
  }

  async execute(context: TContext, next: NextFunction): Promise<Result<void>> {
    return this.handler(context, next);
  }
}

/**
 * Middleware Pipeline Implementation
 */
export class MiddlewarePipeline<TContext = IMiddlewareContext> 
  implements IMiddlewarePipeline<TContext> {
  
  private middlewares: IMiddleware<TContext>[] = [];

  use(middleware: IMiddleware<TContext> | MiddlewareHandler<TContext>): this {
    if (typeof middleware === 'function') {
      this.middlewares.push(new MiddlewareWrapper(middleware));
    } else {
      this.middlewares.push(middleware);
    }
    return this;
  }

  async execute(context: TContext): Promise<Result<void>> {
    let index = 0;

    const dispatch = async (): Promise<Result<void>> => {
      // Tüm middleware'ler çalıştı
      if (index >= this.middlewares.length) {
        return Result.ok();
      }

      const middleware = this.middlewares[index++];

      try {
        // Next function
        const next: NextFunction = async () => {
          return dispatch();
        };

        // Execute middleware
        return await middleware.execute(context, next);
      } catch (error) {
        return Result.fail(`Middleware error: ${error}`);
      }
    };

    return dispatch();
  }

  count(): number {
    return this.middlewares.length;
  }

  clear(): void {
    this.middlewares = [];
  }
}