import { Result } from "../../logic/Result";
import { 
  IContainer, 
  ServiceDescriptor, 
  ServiceLifetime 
} from "./IContainer";

/**
 * Simple Dependency Injection Container
 */
export class Container implements IContainer {
  private services: Map<string | symbol, ServiceDescriptor> = new Map();
  private singletons: Map<string | symbol, any> = new Map();
  private scopedInstances: Map<string | symbol, any> = new Map();
  private parent?: Container;

  constructor(parent?: Container) {
    this.parent = parent;
  }

  registerTransient<T>(token: string | symbol, factory: () => T): void {
    this.services.set(token, {
      token,
      factory,
      lifetime: ServiceLifetime.Transient
    });
  }

  registerSingleton<T>(token: string | symbol, factory: () => T): void {
    this.services.set(token, {
      token,
      factory,
      lifetime: ServiceLifetime.Singleton
    });
  }

  registerScoped<T>(token: string | symbol, factory: () => T): void {
    this.services.set(token, {
      token,
      factory,
      lifetime: ServiceLifetime.Scoped
    });
  }

  registerInstance<T>(token: string | symbol, instance: T): void {
    this.singletons.set(token, instance);
    this.services.set(token, {
      token,
      factory: () => instance,
      lifetime: ServiceLifetime.Singleton
    });
  }

  resolve<T>(token: string | symbol): Result<T> {
    try {
      const instance = this.resolveInternal<T>(token);
      return Result.ok(instance);
    } catch (error) {
      return Result.fail(`Failed to resolve '${String(token)}': ${error}`);
    }
  }

  async resolveAsync<T>(token: string | symbol): Promise<Result<T>> {
    try {
      const instance = await this.resolveInternalAsync<T>(token);
      return Result.ok(instance);
    } catch (error) {
      return Result.fail(`Failed to resolve '${String(token)}': ${error}`);
    }
  }

  isRegistered(token: string | symbol): boolean {
    return this.services.has(token) || (this.parent?.isRegistered(token) ?? false);
  }

  clear(): void {
    this.services.clear();
    this.singletons.clear();
    this.scopedInstances.clear();
  }

  createScope(): IContainer {
    return new Container(this);
  }

  private resolveInternal<T>(token: string | symbol): T {
    // Check service registration
    const descriptor = this.services.get(token);
    
    if (!descriptor) {
      // Try parent container
      if (this.parent) {
        return this.parent.resolveInternal<T>(token);
      }
      throw new Error(`Service '${String(token)}' not registered`);
    }

    // Handle different lifetimes
    switch (descriptor.lifetime) {
      case ServiceLifetime.Singleton:
        return this.resolveSingleton<T>(token, descriptor);
        
      case ServiceLifetime.Scoped:
        return this.resolveScoped<T>(token, descriptor);
        
      case ServiceLifetime.Transient:
      default:
        return descriptor.factory() as T;
    }
  }

  private async resolveInternalAsync<T>(token: string | symbol): Promise<T> {
    const descriptor = this.services.get(token);
    
    if (!descriptor) {
      if (this.parent) {
        return this.parent.resolveInternalAsync<T>(token);
      }
      throw new Error(`Service '${String(token)}' not registered`);
    }

    switch (descriptor.lifetime) {
      case ServiceLifetime.Singleton:
        return this.resolveSingletonAsync<T>(token, descriptor);
        
      case ServiceLifetime.Scoped:
        return this.resolveScopedAsync<T>(token, descriptor);
        
      case ServiceLifetime.Transient:
      default:
        const result = descriptor.factory();
        return result instanceof Promise ? await result : result as T;
    }
  }

  private resolveSingleton<T>(token: string | symbol, descriptor: ServiceDescriptor): T {
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }

    const instance = descriptor.factory() as T;
    this.singletons.set(token, instance);
    return instance;
  }

  private async resolveSingletonAsync<T>(
    token: string | symbol, 
    descriptor: ServiceDescriptor
  ): Promise<T> {
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }

    const result = descriptor.factory();
    const instance = result instanceof Promise ? await result : result as T;
    this.singletons.set(token, instance);
    return instance;
  }

  private resolveScoped<T>(token: string | symbol, descriptor: ServiceDescriptor): T {
    if (this.scopedInstances.has(token)) {
      return this.scopedInstances.get(token) as T;
    }

    const instance = descriptor.factory() as T;
    this.scopedInstances.set(token, instance);
    return instance;
  }

  private async resolveScopedAsync<T>(
    token: string | symbol, 
    descriptor: ServiceDescriptor
  ): Promise<T> {
    if (this.scopedInstances.has(token)) {
      return this.scopedInstances.get(token) as T;
    }

    const result = descriptor.factory();
    const instance = result instanceof Promise ? await result : result as T;
    this.scopedInstances.set(token, instance);
    return instance;
  }
}