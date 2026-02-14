# Dependency Injection

## Core Tokens

Core kütüphanedeki `ServiceTokens` sadece generic infrastructure servislerini içerir.

## Domain-Specific Tokens

Kendi projenizde domain-specific token'lar oluşturun:

### 📁 src/di/ServiceTokens.ts (Projenizde)
```typescript
import { ServiceTokens as CoreTokens } from '@ogza/core';

export const ServiceTokens = {
  // Core tokens'ı al
  ...CoreTokens,
  
  // Kendi domain token'larını ekle
  USER_REPOSITORY: Symbol('IUserRepository'),
  PRODUCT_REPOSITORY: Symbol('IProductRepository'),
  ORDER_REPOSITORY: Symbol('IOrderRepository'),
  CART_SERVICE: Symbol('ICartService'),
  PAYMENT_SERVICE: Symbol('IPaymentService'),
  INVENTORY_SERVICE: Symbol('IInventoryService'),
};
```

### Setup
```typescript
import { Container, ServiceTokens as CoreTokens } from '@ogza/core';
import { ServiceTokens } from './di/ServiceTokens'; // Kendi token'larınız

const container = new Container();

// Core services
container.registerSingleton(CoreTokens.LOGGER, () => new Logger());
container.registerSingleton(CoreTokens.EVENT_BUS, () => new EventBus());

// Domain services
container.registerScoped(ServiceTokens.USER_REPOSITORY, () => {
  return new UserRepository();
});

container.registerScoped(ServiceTokens.PAYMENT_SERVICE, () => {
  return new StripePaymentService();
});
```