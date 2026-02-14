// Logic
export * from './logic/Result';
export * from './logic/Guard';
export * from './logic/errors';

// Application
export * from './application/IUseCase';
export * from './application/Mapper';
export * from './application/AppError';
export * from './application/dto/index';
export * from './application/adapter/index';

// Domain
export * from './domain/ValueObject';
export * from './domain/Entity';         
export * from './domain/UniqueEntityID'; 
export * from './domain/AggregateRoot';
export * from './domain/TenantId'; 
export * from './domain/events/IDomainEvent'; 
export * from './domain/events/DomainEvents';
export * from './domain/common/Email'; 

//Infrastructure
export * from './infrastructure/IRepository';
export * from './infrastructure/ILogger'; 
export * from './infrastructure/IAppConfig'; 
export * from './infrastructure/http/models/HttpMethod'
export * from './infrastructure/http/models/IHttpRequest';
export * from './infrastructure/http/models/IHttpResponse';
export * from './infrastructure/crypto/IHashingService';
export * from './infrastructure/crypto/IEncryptionService';
export * from './infrastructure/auth/models/ITokenPayload';
export * from './infrastructure/auth/models/IAuthResponse';
export * from './infrastructure/auth/ITokenService';
export * from './infrastructure/notification/index';

// Infrastructure - HTTP Interfaces
export * from './infrastructure/http/interfaces/IHttpClient';
export * from './infrastructure/http/interfaces/ISoapClient';

// Constants
export * from './constants/CoreKeys';
export * from './constants/RegexPatterns'; 
export * from './constants/HttpStatus';

// Types
export * from './types/DeepPartial';

// Login
export * from './logic/CancellationToken';

// Localization
export * from './localization/LocalizationService';
export * from './localization/ITranslator';
export * from './localization/locales/en';
export * from './localization/locales/tr';

// Utils
export * from './utils/shallowEqual';