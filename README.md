# ogza-lib-typescript-core
TypeScript Core Projesi

@ogza-lib/core Klasör Yapısı

src/
├── logic/                 # Mantıksal akış kontrolü (Domain bağımsız)
│   ├── Result.ts          # Success/Failure yönetimi (Monad)
│   ├── Guard.ts           # Validasyon kontrolleri (Null, Empty check vs.)
│   ├── AppError.ts        # Base hata sınıfları
│   └── Either.ts          # (Opsiyonel) Fonksiyonel programlama için
|── errors/
    ├── ApplicationError.ts        <-- Base Class (Ataları)
    ├── ValidationError.ts
    ├── UnauthorizedError.ts
    ├── ForbiddenError.ts          <-- PermissionDenied yerine bunu sevdiysen
    ├── NotFoundError.ts
    ├── ConflictError.ts
    ├── ServiceUnavailableError.ts
    ├── NotImplementedError.ts
    └── index.ts                   <-- YENİ (Barrel File)
│
├── domain/                # DDD Yapı Taşları (Base Classes)
│   ├── Entity.ts          # Base Entity sınıfı (ID yönetimi ile)
│   ├── ValueObject.ts     # Base Value Object sınıfı (Equality check ile)
│   ├── AggregateRoot.ts   # Domain Event'leri tutan Entity
│   ├── Identifier.ts      # UUID veya Unique ID sarmalayıcısı
│   └── events/            # Domain Event altyapısı
│       ├── IDomainEvent.ts
│       └── DomainEvents.ts (Dispatcher)
│
├── application/           # Uygulama katmanı için kontratlar
│   ├── IUseCase.ts        # Tüm UseCase'lerin uyması gereken imza
│   ├── IMapper.ts         # Domain -> DTO dönüşüm arayüzü
    ├── AppError.ts       <-- Uygulama seviyesi hatalar (Beklenmeyen hatalar vb.)
│   └── dto/
│       └── Pagination.ts  # Pagination Request/Response tipleri
│
├── infrastructure/        # Altyapı için Kontratlar (Implementasyon YOK)
│   ├── IRepository.ts     # Base Repository Interface
│   ├── ILogger.ts         # Logger Interface
│   └── IAppConfig.ts      # Konfigürasyon Interface'i (Environment için)
│
├── constants/             # SADECE Evrensel Sabitler
│   ├── HttpStatus.ts      # 200, 400, 500 vb.
│   └── RegexPatterns.ts   # Email, UUID regexleri
|    └── CoreKeys.ts        <-- (Eski CoreMessages yerine Key'ler)
│
└── types/                 # Global Utility Tipleri
|    └── DeepPartial.ts     # Yardımcı TypeScript tipleri
│   
├── localization/
│   ├── ITranslator.ts     <-- Arayüz
│   ├── LocalizationService.ts <-- Yönetici Servis (Singleton)
│   └── locales/
│       ├── en.ts          <-- Varsayılan İngilizce
│       └── tr.ts          <-- Türkçe Desteği


/my-solution-template
├── packages/
│   ├── core/                 <-- %100 ORTAK (Pure TS, Domain Logic)
│   └── shared-infra/         <-- %100 ORTAK (Helper'lar, Base Class'lar, DTO bases)
├── apps/
│   ├── backend-strapi/       <-- Strapi implementasyonu
│   └── frontend-vue/         <-- Vue.js implementasyonu



Notification Klasör Yapısı

packages/core/src/infrastructure/notifications/
├── enums/
│   └── NotificationChannel.ts           <-- (Enum) EMAIL, TELEGRAM, WEBSOCKET
│
├── requests/                            <-- (DTO Interfaces)
│   ├── BaseNotification.ts              <-- Ortak Ataları (channel, metadata)
│   ├── EmailNotification.ts             <-- Email'e özel alanlar (subject, body)
│   ├── TelegramNotification.ts          <-- Telegram'a özel alanlar (chatId, text)
│   ├── WebSocketNotification.ts         <-- WS'e özel alanlar (eventName, payload)
│   └── index.ts                         <-- Barrel File & 'NotificationRequest' Union Type
│
├── services/                            <-- (Sub-Service Interfaces)
│   ├── IBaseNotificationService.ts      <-- GENERIC ATA (Tüm servislerin uyması gereken .send() imzası)
│   ├── IEmailService.ts                 <-- extends IBaseNotificationService<EmailNotification>
│   ├── ITelegramService.ts              <-- extends IBaseNotificationService<TelegramNotification>
│   ├── IWebSocketService.ts             <-- extends IBaseNotificationService<WebSocketNotification>
│   └── index.ts                         <-- Barrel File
│
└── INotificationService.ts              <-- FACADE / MANAGER (Ana Yönetici Servis)

