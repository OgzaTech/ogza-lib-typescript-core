/**
 * Generic Service Tokens
 * Sadece CORE infrastructure servisleri
 * 
 * Domain-specific token'lar (UserRepository, ProductRepository vb.) 
 * projenin kendi ServiceTokens.ts dosyasında tanımlanmalı!
 */
export const ServiceTokens = {
  // ============================================
  // CORE INFRASTRUCTURE - Her projede ortak
  // ============================================
  
  // Logging
  LOGGER: Symbol('ILogger'),
  
  // Configuration
  CONFIG: Symbol('IAppConfig'),
  
  // Events
  EVENT_BUS: Symbol('IEventBus'),
  
  // HTTP
  HTTP_CLIENT: Symbol('IHttpClient'),
  SOAP_CLIENT: Symbol('ISoapClient'),
  
  // Database (Backend)
  UNIT_OF_WORK: Symbol('IUnitOfWork'),
  TRANSACTION_MANAGER: Symbol('ITransactionManager'),
  
  // Cache
  CACHE: Symbol('ICache'),
  
  // Storage (Frontend)
  LOCAL_STORAGE: Symbol('ILocalStorage'),
  SESSION_STORAGE: Symbol('ISessionStorage'),
  BROWSER_STORAGE: Symbol('IBrowserStorage'),
  
  // Security
  HASHING_SERVICE: Symbol('IHashingService'),
  ENCRYPTION_SERVICE: Symbol('IEncryptionService'),
  TOKEN_SERVICE: Symbol('ITokenService'),
  
  // Notifications
  NOTIFICATION_SERVICE: Symbol('INotificationService'),
  EMAIL_SERVICE: Symbol('IEmailService'),
  SMS_SERVICE: Symbol('ISmsService'),
  
  // Localization
  TRANSLATOR: Symbol('ITranslator'),
  LOCALIZATION_SERVICE: Symbol('LocalizationService'),
  
} as const;
