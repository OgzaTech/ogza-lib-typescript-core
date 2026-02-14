Backend - Express Style Handler:
import { 
  MiddlewarePipeline, 
  MiddlewareContext,
  LoggingMiddleware,
  AuthenticationMiddleware,
  AuthorizationMiddleware,
  RateLimitMiddleware,
  ValidationMiddleware
} from '@ogza/core';

// Pipeline oluştur
const pipeline = new MiddlewarePipeline();

// Middlewares ekle (sıralı)
pipeline
  .use(new LoggingMiddleware(logger))
  .use(new CorsMiddleware(['http://localhost:3000']))
  .use(new RateLimitMiddleware(100, 60000))
  .use(new AuthenticationMiddleware(validateJWT))
  .use(new AuthorizationMiddleware(['admin', 'user']))
  .use(new ValidationMiddleware(validateUserInput))
  .use(async (context, next) => {
    // Custom middleware - Business logic
    const validatedData = context.get('validatedData');
    const user = context.get('user');
    
    // Process request
    const result = await userService.createUser(validatedData, user);
    
    if (result.isFailure) {
      return Result.fail(result.error!);
    }
    
    // Set response
    context.response = { 
      success: true, 
      data: result.getValue() 
    };
    
    return next();
  });

// HTTP Handler
async function handleRequest(req: any, res: any) {
  const context = new MiddlewareContext(req, res);
  
  const result = await pipeline.execute(context);
  
  if (result.isSuccess) {
    res.status(200).json(context.response);
  } else {
    res.status(500).json({ error: result.error });
  }
}


------
Strapi Middleware:

// Strapi'de middleware olarak kullanım
export default (config: any, { strapi }: any) => {
  return async (ctx: any, next: any) => {
    const pipeline = new MiddlewarePipeline();
    
    pipeline
      .use(new LoggingMiddleware(strapi.log))
      .use(new RateLimitMiddleware(100, 60000))
      .use(async (context, next) => {
        // Strapi context'i kullan
        await next();
      });
    
    const context = new MiddlewareContext(ctx.request, ctx.response);
    await pipeline.execute(context);
    
    return next();
  };
};