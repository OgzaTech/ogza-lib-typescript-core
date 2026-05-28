/**
 * Result Monad Pattern
 * @template T - Başarılı durumda dönen değer tipi
 * @template E - Hata durumunda dönen hata tipi (varsayılan: string)
 */
declare class Result<T, E = string> {
    readonly isSuccess: boolean;
    readonly isFailure: boolean;
    readonly error: E | null;
    private readonly _value;
    private constructor();
    /**
     * Başarılı sonuç oluşturur
     */
    static ok<U>(value?: U): Result<U, never>;
    /**
     * Başarısız sonuç oluşturur
     */
    static fail<U, E = string>(error: E): Result<U, E>;
    /**
     * Değeri döner. Hata durumunda exception fırlatır.
     */
    getValue(): T;
    /**
     * Hatayı döner. Başarılı durumda null döner.
     */
    getError(): E | null;
    /**
     * Type-safe değer erişimi (Option pattern)
     */
    getValueOrDefault(defaultValue: T): T;
    /**
     * Functional map - Başarılı durumda değeri transform eder
     */
    map<U>(fn: (value: T) => U): Result<U, E>;
    /**
     * Functional flatMap/bind - Başarılı durumda Result dönen fonksiyon uygular
     */
    flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
}

interface IGuardArgument {
    argument: any;
    argumentName: string;
}
type GuardResponse = Result<void>;
/**
 * Validasyon guard'ları
 * Tüm metodlar Result<void> döner - başarılı validasyon için ok(), başarısız için fail()
 */
declare class Guard {
    /**
     * Custom kural kontrolü
     */
    static should(rule: boolean, message: string): GuardResponse;
    /**
     * Null veya undefined kontrolü
     */
    static againstNullOrUndefined(argument: any, argumentName: string): GuardResponse;
    /**
     * Çoklu null/undefined kontrolü
     */
    static againstNullOrUndefinedBulk(args: IGuardArgument[]): GuardResponse;
    /**
     * Boş string kontrolü
     */
    static againstEmptyString(argument: any, argumentName: string): GuardResponse;
    /**
     * Minimum karakter uzunluğu kontrolü
     */
    static againstAtLeast(numChars: number, text: string, argumentName?: string): GuardResponse;
    /**
     * Maksimum karakter uzunluğu kontrolü
     */
    static againstAtMost(numChars: number, text: string, argumentName?: string): GuardResponse;
    /**
     * Karakter uzunluğu aralığı kontrolü
     */
    static againstRange(minChars: number, maxChars: number, text: string, argumentName?: string): GuardResponse;
    /**
     * Birden fazla Result'ı birleştirir
     * Herhangi biri başarısız ise ilk hatayı döner
     */
    static combine(results: Result<any>[]): Result<void>;
    /**
     * Regex pattern kontrolü
     */
    static againstPattern(pattern: RegExp, text: string, argumentName?: string): GuardResponse;
}

declare abstract class ApplicationError extends Error {
    readonly code: string;
    readonly details?: any;
    constructor(message: string, code: string, details?: any);
}

declare class ValidationError extends ApplicationError {
    constructor(message?: string, details?: any);
}

declare class UnauthorizedError extends ApplicationError {
    constructor(message?: string);
}

declare class NotFoundError extends ApplicationError {
    constructor(resource: string);
}

declare class ConflictError extends ApplicationError {
    constructor(message?: string);
}

declare class ServiceUnavailableError extends ApplicationError {
    constructor(message?: string);
}

declare class NotImplementedError extends ApplicationError {
    constructor(methodName?: string);
}

declare class PermissionDeniedError extends ApplicationError {
    constructor(message?: string);
}

declare class UnexpectedError extends ApplicationError {
    constructor(message?: string, details?: any);
}

declare class ForbiddenError extends ApplicationError {
    constructor(message?: string);
}

/**
 * IRequest: UseCase'e giren veri tipi (Genelde bir DTO)
 * IResponse: UseCase'den çıkan veri tipi (Genelde Result<DTO>)
 */
interface IUseCase<IRequest, IResponse> {
    execute(request?: IRequest): Promise<IResponse> | IResponse;
}

/**
 * Base Mapper Class
 * Domain Entity ↔ DTO ↔ Persistence Model dönüşümleri
 *
 * @template DomainEntity - İş mantığını içeren Entity
 * @template DTO - Frontend/API için sade veri transfer objesi
 * @template PersistenceModel - Veritabanı satır modeli (ORM)
 */
declare abstract class Mapper<DomainEntity, DTO, PersistenceModel = unknown> {
    /**
     * Domain Entity'yi DTO'ya çevir (API Response için)
     */
    abstract toDTO(entity: DomainEntity): DTO;
    /**
     * Raw data'dan Domain Entity oluştur
     * @param raw - Persistence model veya DTO (any yerine union type)
     */
    abstract toDomain(raw: PersistenceModel | DTO): DomainEntity;
    /**
     * Domain Entity'yi Persistence formatına çevir (DB kayıt için)
     * Opsiyonel - Sadece DB kullanan projeler implement eder
     */
    toPersistence?(entity: DomainEntity): PersistenceModel;
    /**
     * Bulk transformation: Entity listesini DTO listesine çevir
     */
    toDTOList(entities: DomainEntity[]): DTO[];
    /**
     * Bulk transformation: Raw data listesini Domain Entity listesine çevir
     */
    toDomainList(raws: (PersistenceModel | DTO)[]): DomainEntity[];
    /**
     * Bulk transformation: Entity listesini Persistence listesine çevir
     * Sadece toPersistence implement edilmişse kullanılabilir
     */
    toPersistenceList(entities: DomainEntity[]): PersistenceModel[];
}

/**
 * Yapılandırılmış hata nesnesi
 */
interface StructuredError {
    message: string;
    code?: string;
    details?: any;
    originalError?: unknown;
}
declare namespace AppError {
    /**
     * Beklenmeyen hatalar için
     */
    class UnexpectedError implements StructuredError {
        readonly message: string;
        readonly code: string;
        readonly originalError: unknown;
        readonly details?: any;
        private constructor();
        static create(err: unknown, details?: any): Result<never, UnexpectedError>;
        toString(): string;
    }
    /**
     * Validasyon hataları için
     */
    class ValidationFailure implements StructuredError {
        readonly message: string;
        readonly code: string;
        readonly details?: any;
        private constructor();
        static create(message?: string, details?: any): Result<never, ValidationFailure>;
        toString(): string;
    }
    /**
     * Yetkilendirme hataları için
     */
    class Unauthorized implements StructuredError {
        readonly message: string;
        readonly code: string;
        private constructor();
        static create(message?: string): Result<never, Unauthorized>;
        toString(): string;
    }
    /**
     * Not found hataları için
     */
    class NotFound implements StructuredError {
        readonly message: string;
        readonly code: string;
        readonly resource: string;
        private constructor();
        static create(resource: string): Result<never, NotFound>;
        toString(): string;
    }
    class InvalidOperation implements StructuredError {
        readonly message: string;
        readonly code: string;
        readonly details?: any;
        private constructor();
        static create(message: string, details?: any): Result<never, InvalidOperation>;
        toString(): string;
    }
    class Forbidden implements StructuredError {
        readonly message: string;
        readonly code: string;
        readonly details?: any;
        private constructor();
        static create(message: string, details?: any): Result<never, Forbidden>;
        toString(): string;
    }
}

interface IPaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

type SortDirection = 'ASC' | 'DESC';
interface IPaginationRequest {
    page: number;
    limit: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: SortDirection;
}

interface SearchParams {
    page?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, any>;
    sort?: string;
}

/**
 * Standardized API Response Interface
 * Tüm API endpoint'leri bu formatı kullanmalı
 */
interface IApiResponse<T = any> {
    /**
     * Success flag
     */
    success: boolean;
    /**
     * Response code (business logic code)
     */
    code: string;
    /**
     * Human-readable message
     */
    message: string;
    /**
     * Response data (null if error)
     */
    data: T | null;
    /**
     * Error details (null if success)
     */
    errors: IApiError[] | null;
    /**
     * Response metadata
     */
    meta: IApiResponseMeta;
}
/**
 * API Error Detail
 */
interface IApiError {
    /**
     * Error code
     */
    code: string;
    /**
     * Error message
     */
    message: string;
    /**
     * Field name (for validation errors)
     */
    field?: string;
    /**
     * Additional context
     */
    details?: Record<string, any>;
}
/**
 * Response Metadata
 */
interface IApiResponseMeta {
    /**
     * Response timestamp (ISO 8601)
     */
    timestamp: string;
    /**
     * Unique request ID
     */
    requestId: string;
    /**
     * API version (optional)
     */
    version?: string;
    /**
     * Pagination info (optional)
     */
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * API Response Builder
 * Fluent API ile standardize response oluşturma
 */
declare class ApiResponse {
    /**
     * Create success response
     */
    static success<T>(data: T, message?: string, code?: string): IApiResponse<T>;
    /**
     * Create error response
     */
    static error(message: string, code?: string, errors?: IApiError[]): IApiResponse<null>;
    /**
     * Create validation error response
     */
    static validationError(errors: IApiError[], message?: string): IApiResponse<null>;
    /**
     * Create from Result monad
     */
    static fromResult<T>(result: Result<T>, successMessage?: string, successCode?: string, errorCode?: string): IApiResponse<T | null>;
    /**
     * Create paginated response
     */
    static paginated<T>(data: T[], page: number, limit: number, total: number, message?: string, code?: string): IApiResponse<T[]>;
    /**
     * Create not found response
     */
    static notFound(resource?: string): IApiResponse<null>;
    /**
     * Create unauthorized response
     */
    static unauthorized(message?: string): IApiResponse<null>;
    /**
     * Create forbidden response
     */
    static forbidden(message?: string): IApiResponse<null>;
    /**
     * Create created response (201)
     */
    static created<T>(data: T, message?: string, code?: string): IApiResponse<T>;
    /**
     * Create no content response (204)
     */
    static noContent(message?: string): IApiResponse<null>;
    /**
     * Create metadata
     */
    private static createMeta;
    /**
     * Generate unique request ID
     */
    private static generateRequestId;
    /**
     * Set request ID (from middleware)
     */
    static withRequestId<T>(response: IApiResponse<T>, requestId: string): IApiResponse<T>;
    /**
     * Set API version
     */
    static withVersion<T>(response: IApiResponse<T>, version: string): IApiResponse<T>;
}

interface IStorageAdapter {
    get<T>(key: string): T | null;
    set(key: string, value: any): void;
    remove(key: string): void;
    clear(): void;
}

interface CookieOptions {
    expires?: number | Date;
    path?: string;
    domain?: string;
    secure?: boolean;
}
interface ICookieAdapter {
    get(name: string): string | null;
    set(name: string, value: string, options?: CookieOptions): void;
    remove(name: string, options?: CookieOptions): void;
}

interface ISessionManager<UserType> {
    setSession(token: string, user: UserType): Promise<void>;
    getSession(): {
        token: string | null;
        user: UserType | null;
    };
    clearSession(): Promise<void>;
    getToken(): string | null;
    isAuthenticated(): boolean;
}

/**
 * Form Validator Interface
 * Frontend form validasyonu için (Vue, React, Angular)
 */
/**
 * Validation Rule Function
 */
type ValidationRuleFn<T = any> = (value: T, formData?: any) => boolean | string | Promise<boolean | string>;
/**
 * Field Validation Rule
 */
interface FieldRule<T = any> {
    /**
     * Rule adı (hata mesajlarında kullanılır)
     */
    name?: string;
    /**
     * Validation fonksiyonu
     * true = geçerli
     * false = geçersiz
     * string = geçersiz + hata mesajı
     */
    validator: ValidationRuleFn<T>;
    /**
     * Hata mesajı (validator false dönerse kullanılır)
     */
    message?: string;
    /**
     * Trigger (ne zaman validate edilsin)
     */
    trigger?: 'blur' | 'change' | 'submit';
}
/**
 * Field Schema
 */
interface FieldSchema<T = any> {
    /**
     * Field label (hata mesajlarında kullanılır)
     */
    label?: string;
    /**
     * Validation rules
     */
    rules: FieldRule<T>[];
    /**
     * Başlangıç değeri
     */
    initialValue?: T;
}
/**
 * Form Schema
 */
type FormSchema = Record<string, FieldSchema>;
/**
 * Field Error
 */
interface FieldError {
    field: string;
    message: string;
    rule?: string;
}
/**
 * Validation Result
 */
interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string[]>;
    firstError?: FieldError;
}
/**
 * Form Validator Interface
 */
interface IFormValidator {
    /**
     * Tüm formu validate et
     */
    validate(formData: Record<string, any>, schema: FormSchema): Promise<Result<boolean>>;
    /**
     * Tek bir field validate et
     */
    validateField(fieldName: string, value: any, rules: FieldRule[], formData?: Record<string, any>): Promise<Result<boolean>>;
    /**
     * Validation hatalarını al
     */
    getErrors(): Record<string, string[]>;
    /**
     * Tek bir field'in hatalarını al
     */
    getFieldErrors(fieldName: string): string[];
    /**
     * İlk hatayı al
     */
    getFirstError(): FieldError | null;
    /**
     * Hataları temizle
     */
    clearErrors(fieldName?: string): void;
    /**
     * Form valid mi?
     */
    isValid(): boolean;
}

/**
 * Form Validator Implementation
 */
declare class FormValidator implements IFormValidator {
    private errors;
    validate(formData: Record<string, any>, schema: FormSchema): Promise<Result<boolean>>;
    validateField(fieldName: string, value: any, rules: FieldRule[], formData?: Record<string, any>): Promise<Result<boolean>>;
    getErrors(): Record<string, string[]>;
    getFieldErrors(fieldName: string): string[];
    getFirstError(): FieldError | null;
    clearErrors(fieldName?: string): void;
    isValid(): boolean;
}

/**
 * Predefined Validation Rules
 * Sık kullanılan validation kuralları
 */
/**
 * Required field
 */
declare const required: (message?: string) => FieldRule;
/**
 * Email validation
 */
declare const email: (message?: string) => FieldRule;
/**
 * Min length
 */
declare const minLength: (min: number, message?: string) => FieldRule;
/**
 * Max length
 */
declare const maxLength: (max: number, message?: string) => FieldRule;
/**
 * Min value (number)
 */
declare const min: (minValue: number, message?: string) => FieldRule;
/**
 * Max value (number)
 */
declare const max: (maxValue: number, message?: string) => FieldRule;
/**
 * Pattern (regex)
 */
declare const pattern: (regex: RegExp, message?: string) => FieldRule;
/**
 * URL validation
 */
declare const url: (message?: string) => FieldRule;
/**
 * Phone number (basic)
 */
declare const phone: (message?: string) => FieldRule;
/**
 * Numeric
 */
declare const numeric: (message?: string) => FieldRule;
/**
 * Alpha (only letters)
 */
declare const alpha: (message?: string) => FieldRule;
/**
 * Alphanumeric
 */
declare const alphanumeric: (message?: string) => FieldRule;
/**
 * Confirmed (password confirmation)
 */
declare const confirmed: (fieldToMatch: string, message?: string) => FieldRule;
/**
 * Custom validator
 */
declare const custom: (fn: (value: any, formData?: any) => boolean | string | Promise<boolean | string>, message?: string) => FieldRule;
/**
 * Async validator (örnek: API'den kontrol)
 */
declare const asyncUnique: (checkFn: (value: any) => Promise<boolean>, message?: string) => FieldRule;

/**
 * Advanced Validation Rules
 */
/**
 * Credit card validation
 */
declare const creditCard: (message?: string) => FieldRule;
/**
 * IBAN validation
 */
declare const iban: (message?: string) => FieldRule;
/**
 * Strong password
 */
declare const strongPassword: (message?: string) => FieldRule;
/**
 * Date in future
 */
declare const futureDate: (message?: string) => FieldRule;
/**
 * Date in past
 */
declare const pastDate: (message?: string) => FieldRule;
/**
 * Age validation
 */
declare const minAge: (age: number, message?: string) => FieldRule;
/**
 * File size validation
 */
declare const maxFileSize: (maxSizeMB: number, message?: string) => FieldRule;
/**
 * File type validation
 */
declare const fileType: (allowedTypes: string[], message?: string) => FieldRule;
/**
 * JSON validation
 */
declare const jsonString: (message?: string) => FieldRule;
/**
 * IPv4 validation
 */
declare const ipv4: (message?: string) => FieldRule;
/**
 * MAC address validation
 */
declare const macAddress: (message?: string) => FieldRule;

interface ValueObjectProps {
    [index: string]: any;
}
/**
 * Value Object Base Class
 *
 * Value Object'ler kimlik yerine değer ile tanımlanır.
 * İki Value Object, tüm property'leri aynıysa eşittir (structural equality).
 *
 * Immutable'dır - props değiştirilemez.
 */
declare abstract class ValueObject<T extends ValueObjectProps> {
    readonly props: T;
    constructor(props: T);
    /**
     * Deep structural equality kontrolü
     * Nested object'leri de karşılaştırır
     *
     * ÖNEMLI: shallowEqual yerine deepEqual kullanıyoruz çünkü:
     * - Address gibi nested property'li ValueObject'ler için gerekli
     * - Money gibi complex ValueObject'ler için güvenli
     *
     * @param vo - Karşılaştırılacak Value Object
     * @returns true if structurally equal
     */
    equals(vo?: ValueObject<T>): boolean;
}

/**
 * Entity'ler için benzersiz kimlik (ID) sınıfı.
 * Eğer constructor'a bir değer verilmezse, otomatik olarak UUID v4 oluşturur.
 */
declare class UniqueEntityID extends ValueObject<{
    value: string | number;
}> {
    constructor(id?: string | number);
    getValue(): string | number;
    /**
     * Kriptografik olarak güvenli UUID v4 üretir.
     * Node.js 14.17+ ve tüm modern tarayıcıları destekler.
     */
    private static generateId;
    /**
     * Manuel UUID v4 üretimi (RFC 4122 uyumlu)
     * crypto.getRandomValues() kullanarak kriptografik güvenli
     */
    private static generateUUIDv4;
    toString(): string;
    equals(other?: UniqueEntityID): boolean;
}

/**
 * Base Entity sınıfı
 * Entity'ler kimlik (ID) ile tanımlanır, değer eşitliği yerine kimlik eşitliği kullanır
 */
declare abstract class Entity<T> {
    protected readonly _id: UniqueEntityID;
    readonly props: T;
    constructor(props: T, id?: UniqueEntityID);
    /**
     * Entity'nin ID'sine erişim (Public getter)
     */
    get id(): UniqueEntityID;
    /**
     * Entity eşitlik kontrolü (Kimlik bazlı, referans değil)
     */
    equals(object?: Entity<T>): boolean;
}

interface IDomainEvent {
    dateTimeOccurred: Date;
    getAggregateId(): UniqueEntityID;
}

interface ILogger {
    debug(message: string, ...meta: any[]): void;
    info(message: string, ...meta: any[]): void;
    warn(message: string, ...meta: any[]): void;
    error(message: string, ...meta: any[]): void;
}

/**
 * Aggregate Root - Domain Event yönetimi yapan Entity
 *
 * DDD'de Aggregate Root, transaction boundary'si ve consistency garantisi sağlar.
 * Tüm domain event'leri aggregate root üzerinden yönetilir.
 */
declare abstract class AggregateRoot<T> extends Entity<T> {
    private _domainEvents;
    private static _logger?;
    /**
     * Logger instance'ını static olarak set eder
     * Application başlangıcında bir kez çağrılmalı
     */
    static setLogger(logger: ILogger): void;
    /**
     * Domain event listesini döndürür
     */
    get domainEvents(): IDomainEvent[];
    /**
     * Aggregate'e yeni bir domain event ekler
     * Event otomatik olarak dispatch için işaretlenir
     */
    protected addDomainEvent(domainEvent: IDomainEvent): void;
    /**
     * Tüm domain event'leri temizler
     * Genelde dispatch sonrası çağrılır
     */
    clearEvents(): void;
    /**
     * Domain event ekleme loglaması (opsiyonel)
     * Logger inject edilmişse çalışır, yoksa sessiz kalır
     */
    private logDomainEventAdded;
}

declare class TenantId extends UniqueEntityID {
}

type EventHandler$1 = (event: IDomainEvent) => void;
/**
 * Domain Event Dispatcher
 * NOT: Global static state kullanır, test ortamlarında dikkatli kullanılmalı
 */
declare class DomainEvents {
    private static handlersMap;
    private static markedAggregates;
    /**
     * Event dinleyici kaydeder (Idempotent)
     * Aynı subscriberId ile tekrar kayıt yapılırsa güncellenir
     */
    static register(callback: EventHandler$1, eventClassName: string, subscriberId: string): void;
    /**
     * Event dinleyici kaydını siler
     */
    static unregister(eventClassName: string, subscriberId: string): void;
    /**
     * Event'i hemen dispatch eder
     */
    static dispatch(event: IDomainEvent): void;
    /**
     * Aggregate'i dispatch listesine ekler
     */
    static markAggregateForDispatch(aggregate: AggregateRoot<any>): void;
    /**
     * Belirli bir aggregate'in tüm event'lerini dispatch eder
     */
    static dispatchEventsForAggregate(id: UniqueEntityID): void;
    /**
     * Tüm handler'ları temizler (Test için)
     */
    static clearHandlers(): void;
    /**
     * Bekleyen aggregate'leri temizler (Test için)
     */
    static clearMarkedAggregates(): void;
    /**
     * Hem handler'ları hem aggregate'leri temizler (Test için)
     */
    static clearAll(): void;
    /**
     * Debug için mevcut durumu gösterir
     */
    static getState(): {
        registeredEvents: string[];
        subscriberCounts: {
            event: string;
            count: number;
        }[];
        markedAggregatesCount: number;
    };
}

interface EmailProps {
    value: string;
}
declare class Email extends ValueObject<EmailProps> {
    private constructor();
    getValue(): string;
    static create(emailString: string): Result<Email>;
}

interface PhoneNumberProps {
    value: string;
}
/**
 * Phone Number Value Object
 * E.164 format: +[country code][number]
 * Example: +905551234567, +12125551234
 */
declare class PhoneNumber extends ValueObject<PhoneNumberProps> {
    private constructor();
    /**
     * Get formatted phone number
     */
    getValue(): string;
    /**
     * Get country code
     */
    getCountryCode(): string;
    /**
     * Get number without country code
     */
    getNumber(): string;
    /**
     * Format for display (with spaces)
     * Example: +90 555 123 45 67
     */
    format(): string;
    /**
     * Create PhoneNumber from string
     * Accepts various formats and normalizes to E.164
     */
    static create(phone: string): Result<PhoneNumber>;
    /**
     * Create from parts (country code + number)
     */
    static fromParts(countryCode: string, number: string): Result<PhoneNumber>;
}

interface MoneyProps {
    amount: number;
    currency: string;
}
/**
 * Money Value Object
 * Represents monetary value with currency
 * Immutable and type-safe
 */
declare class Money extends ValueObject<MoneyProps> {
    private static readonly CURRENCIES;
    private constructor();
    /**
     * Get amount
     */
    getAmount(): number;
    /**
     * Get currency code
     */
    getCurrency(): string;
    /**
     * Format for display
     * Example: $10.50, €20.00, ₺100.00
     */
    format(locale?: string): string;
    /**
     * Create Money instance
     */
    static create(amount: number, currency: string): Result<Money>;
    /**
     * Add money (same currency)
     */
    add(other: Money): Result<Money>;
    /**
     * Subtract money (same currency)
     */
    subtract(other: Money): Result<Money>;
    /**
     * Multiply by factor
     */
    multiply(factor: number): Result<Money>;
    /**
     * Divide by divisor
     */
    divide(divisor: number): Result<Money>;
    /**
     * Compare with another Money
     */
    isGreaterThan(other: Money): boolean;
    /**
     * Compare with another Money
     */
    isLessThan(other: Money): boolean;
    /**
     * Check if zero
     */
    isZero(): boolean;
    /**
     * Static zero factory
     */
    static zero(currency: string): Result<Money>;
}

interface URLProps {
    value: string;
}
/**
 * URL Value Object
 * URL validation ve manipulation
 */
declare class URL extends ValueObject<URLProps> {
    private constructor();
    /**
     * Get raw URL string
     */
    getValue(): string;
    /**
     * Get URL parts
     */
    getParts(): {
        protocol: string;
        hostname: string;
        port: string;
        pathname: string;
        search: string;
        hash: string;
    };
    /**
     * Get domain
     */
    getDomain(): string;
    /**
     * Get protocol
     */
    getProtocol(): string;
    /**
     * Is HTTPS?
     */
    isSecure(): boolean;
    /**
     * Get query parameters
     */
    getQueryParams(): Record<string, string>;
    /**
     * Get specific query parameter
     */
    getQueryParam(key: string): string | null;
    /**
     * Add query parameter
     */
    withQueryParam(key: string, value: string): Result<URL>;
    /**
     * Remove query parameter
     */
    withoutQueryParam(key: string): Result<URL>;
    /**
     * Create URL from string
     */
    static create(url: string): Result<URL>;
    /**
     * Create from parts
     */
    static fromParts(protocol: string, hostname: string, pathname?: string, queryParams?: Record<string, string>): Result<URL>;
}

interface ColorProps {
    r: number;
    g: number;
    b: number;
    a: number;
}
/**
 * Color Value Object
 * RGB/RGBA color manipulation
 */
declare class Color extends ValueObject<ColorProps> {
    private constructor();
    /**
     * Get red component (0-255)
     */
    getRed(): number;
    /**
     * Get green component (0-255)
     */
    getGreen(): number;
    /**
     * Get blue component (0-255)
     */
    getBlue(): number;
    /**
     * Get alpha component (0-1)
     */
    getAlpha(): number;
    /**
     * To HEX string (#RRGGBB)
     */
    toHex(): string;
    /**
     * To RGB string (rgb(r, g, b))
     */
    toRgb(): string;
    /**
     * To RGBA string (rgba(r, g, b, a))
     */
    toRgba(): string;
    /**
     * To HSL
     */
    toHsl(): {
        h: number;
        s: number;
        l: number;
    };
    /**
     * Lighten color
     */
    lighten(amount: number): Result<Color>;
    /**
     * Darken color
     */
    darken(amount: number): Result<Color>;
    /**
     * Set opacity
     */
    withOpacity(alpha: number): Result<Color>;
    /**
     * Create from RGB
     */
    static fromRgb(r: number, g: number, b: number): Result<Color>;
    /**
     * Create from RGBA
     */
    static fromRgba(r: number, g: number, b: number, a: number): Result<Color>;
    /**
     * Create from HEX (#RRGGBB or #RGB)
     */
    static fromHex(hex: string): Result<Color>;
    /**
     * Create from HSL
     */
    static fromHsl(h: number, s: number, l: number, a?: number): Result<Color>;
    /**
     * Predefined colors
     */
    static get WHITE(): Color;
    static get BLACK(): Color;
    static get RED(): Color;
    static get GREEN(): Color;
    static get BLUE(): Color;
    static get TRANSPARENT(): Color;
}

interface DateRangeProps {
    startDate: Date;
    endDate: Date;
}
/**
 * Date Range Value Object
 * Tarih aralığı validation ve manipulation
 */
declare class DateRange extends ValueObject<DateRangeProps> {
    private constructor();
    /**
     * Get start date
     */
    getStartDate(): Date;
    /**
     * Get end date
     */
    getEndDate(): Date;
    /**
     * Duration in milliseconds
     */
    getDurationMs(): number;
    /**
     * Duration in days
     */
    getDurationDays(): number;
    /**
     * Duration in hours
     */
    getDurationHours(): number;
    /**
     * Duration in minutes
     */
    getDurationMinutes(): number;
    /**
     * Contains date?
     */
    contains(date: Date): boolean;
    /**
     * Overlaps with another range?
     */
    overlaps(other: DateRange): boolean;
    /**
     * Is before another range?
     */
    isBefore(other: DateRange): boolean;
    /**
     * Is after another range?
     */
    isAfter(other: DateRange): boolean;
    /**
     * Extend range
     */
    extend(days: number): Result<DateRange>;
    /**
     * Split range into chunks
     */
    splitIntoDays(): Date[];
    /**
     * Format range
     */
    format(separator?: string): string;
    /**
     * Create DateRange
     */
    static create(startDate: Date, endDate: Date): Result<DateRange>;
    /**
     * Create from ISO strings
     */
    static fromStrings(startDate: string, endDate: string): Result<DateRange>;
    /**
     * Create range for today
     */
    static today(): DateRange;
    /**
     * Create range for this week
     */
    static thisWeek(): DateRange;
    /**
     * Create range for this month
     */
    static thisMonth(): DateRange;
    /**
     * Create range for this year
     */
    static thisYear(): DateRange;
    /**
     * Last N days
     */
    static lastDays(days: number): DateRange;
}

/**
 * Base Repository Interface
 * Tüm repository'lerin uygulaması gereken temel CRUD operasyonları
 *
 * @template T - Entity tipi
 */
interface IRepository<T, E = string> {
    save(entity: T): Promise<Result<void, E>>;
    delete(id: string | number): Promise<Result<void, E>>;
    getById(id: string | number): Promise<Result<T, E>>;
    exists(id: string | number): Promise<Result<boolean, E>>;
    count(): Promise<Result<number, E>>;
    findAll(options?: Partial<IPaginationRequest>): Promise<Result<T[], E>>;
}

interface IAppConfig {
    get(key: string): string;
    getNumber(key: string): number;
    getBoolean(key: string): boolean;
    isProduction(): boolean;
    isDevelopment(): boolean;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface IHttpRequest {
    url: string;
    method: HttpMethod;
    body?: any;
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean>;
    timeout?: number;
}

interface IHttpResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string | string[]>;
}

interface IHashingService {
    /**
     * Metni hash'ler (Örn: Parola oluştururken)
     * @param plainText Şifresiz metin
     */
    hash(plainText: string): Promise<Result<string>>;
    /**
     * Düz metin ile hash'i karşılaştırır (Örn: Login olurken)
     * @param plainText Kullanıcının girdiği şifre
     * @param hashedValue Veritabanındaki hash
     */
    compare(plainText: string, hashedValue: string): Promise<Result<boolean>>;
}

interface IEncryptionService {
    /**
     * Veriyi şifreler
     */
    encrypt(plainText: string): Promise<Result<string>>;
    /**
     * Şifreli veriyi çözer
     */
    decrypt(cipherText: string): Promise<Result<string>>;
}

interface ITokenPayload {
    id: string;
    email: string;
    role?: string;
    tenantId?: string;
    iat?: number;
    exp?: number;
    type?: string;
    [key: string]: any;
}

interface IAuthResponse {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    tokenType: string;
}

interface ITokenService {
    /**
     * Payload'dan yeni bir token üretir (Sign)
     * Sadece Backend kullanır.
     */
    sign(payload: ITokenPayload, expiresIn?: string | number): Promise<Result<string>>;
    /**
     * Token'ın geçerliliğini ve imzasını doğrular (Verify)
     */
    verify(token: string): Promise<Result<ITokenPayload>>;
    /**
     * Token'ı doğrulamadan sadece içini okur (Decode)
     */
    decode(token: string): Result<ITokenPayload | null>;
}

declare enum NotificationChannel {
    EMAIL = "EMAIL",
    SMS = "SMS",
    TELEGRAM = "TELEGRAM",
    WHATSAPP = "WHATSAPP",
    PUSH = "PUSH",
    WEBSOCKET = "WEBSOCKET"
}

interface IBaseNotification {
    channel: NotificationChannel;
    metadata?: Record<string, any>;
}

interface IDataNotification extends IBaseNotification {
    channel: NotificationChannel.PUSH;
    recipient: string;
    eventName: string;
    payload: Record<string, any>;
    displayMessage?: string;
}

interface ITelegramNotification extends IBaseNotification {
    readonly channel: NotificationChannel.TELEGRAM;
    chatId: string;
    message: string;
    parseMode?: 'Markdown' | 'HTML';
}

interface IWebSocketNotification extends IBaseNotification {
    readonly channel: NotificationChannel.WEBSOCKET;
    userId: string;
    eventName: string;
    payload: unknown;
}

interface IEmailNotification extends IBaseNotification {
    channel: NotificationChannel.EMAIL;
    recipient: string;
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    templateId?: string;
    variables?: Record<string, any>;
    content?: string;
    attachments?: {
        filename: string;
        content: Buffer | string;
    }[];
}

interface ISmsNotification extends IBaseNotification {
    readonly channel: NotificationChannel.SMS;
    phoneNumber: string;
    content: string;
}

interface IWhatsappNotification extends IBaseNotification {
    readonly channel: NotificationChannel.WHATSAPP;
    phoneNumber: string;
    content?: string;
    templateId?: string;
    variables?: Record<string, string>;
    mediaUrl?: string;
}

type INotificationRequest = ITelegramNotification | IWebSocketNotification | IDataNotification | ISmsNotification | IWhatsappNotification | IEmailNotification;

interface IBaseNotificationService<T extends IBaseNotification> {
    send(request: T): Promise<Result<void>>;
}

interface IEmailService extends IBaseNotificationService<IEmailNotification> {
}

interface ISmsService extends IBaseNotificationService<ISmsNotification> {
}

interface ITelegramService extends IBaseNotificationService<ITelegramNotification> {
}

interface IWebSocketService extends IBaseNotificationService<IWebSocketNotification> {
}

interface IWhatsappService extends IBaseNotificationService<IWhatsappNotification> {
}

interface INotificationService extends IBaseNotificationService<INotificationRequest> {
    send(request: INotificationRequest): Promise<Result<void>>;
    sendBatch(requests: INotificationRequest[]): Promise<Result<void>>;
}

/**
 * Middleware Interface
 * Backend için middleware pipeline (Express, Fastify, Koa benzeri)
 */
/**
 * Middleware Context
 * Request/Response wrapper
 */
interface IMiddlewareContext<TRequest = any, TResponse = any> {
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
type NextFunction = () => Promise<Result<void>>;
/**
 * Middleware Handler
 */
type MiddlewareHandler<TContext = IMiddlewareContext> = (context: TContext, next: NextFunction) => Promise<Result<void>>;
/**
 * Middleware Interface
 */
interface IMiddleware<TContext = IMiddlewareContext> {
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
interface IMiddlewarePipeline<TContext = IMiddlewareContext> {
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
interface MiddlewareOptions {
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

/**
 * Middleware Context Implementation
 */
declare class MiddlewareContext<TRequest = any, TResponse = any> implements IMiddlewareContext<TRequest, TResponse> {
    request: TRequest;
    response: TResponse;
    readonly metadata: Map<string, any>;
    constructor(request: TRequest, response: TResponse);
    set(key: string, value: any): void;
    get<T = any>(key: string): T | undefined;
    has(key: string): boolean;
}

/**
 * Middleware Pipeline Implementation
 */
declare class MiddlewarePipeline<TContext = IMiddlewareContext> implements IMiddlewarePipeline<TContext> {
    private middlewares;
    use(middleware: IMiddleware<TContext> | MiddlewareHandler<TContext>): this;
    execute(context: TContext): Promise<Result<void>>;
    count(): number;
    clear(): void;
}

/**
 * Logging Middleware
 */
declare class LoggingMiddleware implements IMiddleware {
    private logger;
    name: string;
    constructor(logger: ILogger);
    execute(context: IMiddlewareContext, next: NextFunction): Promise<Result<void>>;
}
/**
 * Authentication Middleware
 */
declare class AuthenticationMiddleware implements IMiddleware {
    private validateToken;
    name: string;
    constructor(validateToken: (token: string) => Promise<any>);
    execute(context: IMiddlewareContext, next: NextFunction): Promise<Result<void>>;
}
/**
 * Authorization Middleware
 */
declare class AuthorizationMiddleware implements IMiddleware {
    private requiredRoles;
    name: string;
    constructor(requiredRoles: string[]);
    execute(context: IMiddlewareContext, next: NextFunction): Promise<Result<void>>;
}
/**
 * Rate Limiting Middleware
 */
declare class RateLimitMiddleware implements IMiddleware {
    private maxRequests;
    private windowMs;
    name: string;
    private requests;
    constructor(maxRequests?: number, windowMs?: number);
    execute(context: IMiddlewareContext, next: NextFunction): Promise<Result<void>>;
}
/**
 * Request Validation Middleware
 */
declare class ValidationMiddleware<T = any> implements IMiddleware {
    private validator;
    name: string;
    constructor(validator: (data: any) => Result<T>);
    execute(context: IMiddlewareContext, next: NextFunction): Promise<Result<void>>;
}
/**
 * Error Handling Middleware
 */
declare class ErrorHandlingMiddleware implements IMiddleware {
    private logger?;
    name: string;
    constructor(logger?: ILogger | undefined);
    execute(context: IMiddlewareContext, next: NextFunction): Promise<Result<void>>;
}
/**
 * CORS Middleware
 */
declare class CorsMiddleware implements IMiddleware {
    private allowedOrigins;
    private allowedMethods;
    name: string;
    constructor(allowedOrigins?: string[], allowedMethods?: string[]);
    execute(context: IMiddlewareContext, next: NextFunction): Promise<Result<void>>;
}
/**
 * Timeout Middleware
 */
declare class TimeoutMiddleware implements IMiddleware {
    private timeoutMs;
    name: string;
    constructor(timeoutMs?: number);
    execute(context: IMiddlewareContext, next: NextFunction): Promise<Result<void>>;
}

/**
 * Circuit Breaker Pattern
 * Hatalı servisleri otomatik kapat/aç
 */
/**
 * Circuit State
 */
declare enum CircuitState {
    Closed = "CLOSED",// Normal çalışma
    Open = "OPEN",// Devre açık (istekler bloke)
    HalfOpen = "HALF_OPEN"
}
/**
 * Circuit Breaker Options
 */
interface CircuitBreakerOptions {
    /**
     * Failure threshold (kaç hata sonra aç)
     */
    failureThreshold: number;
    /**
     * Success threshold (half-open'da kaç başarı sonra kapat)
     */
    successThreshold: number;
    /**
     * Timeout (ms) - devre açıldıktan sonra ne kadar bekle
     */
    timeout: number;
    /**
     * Rolling window (ms) - hataları say
     */
    rollingWindow?: number;
}
/**
 * Circuit Breaker Stats
 */
interface CircuitBreakerStats {
    state: CircuitState;
    failures: number;
    successes: number;
    lastFailureTime?: Date;
    nextAttemptTime?: Date;
}
/**
 * Circuit Breaker Interface
 */
interface ICircuitBreaker {
    /**
     * Execute function with circuit breaker
     */
    execute<T>(fn: () => Promise<T>): Promise<Result<T>>;
    /**
     * Get current state
     */
    getState(): CircuitState;
    /**
     * Get stats
     */
    getStats(): CircuitBreakerStats;
    /**
     * Reset circuit breaker
     */
    reset(): void;
}

/**
 * Circuit Breaker Implementation
 */
declare class CircuitBreaker implements ICircuitBreaker {
    private options;
    private state;
    private failures;
    private successes;
    private lastFailureTime?;
    private nextAttemptTime?;
    constructor(options: CircuitBreakerOptions);
    execute<T>(fn: () => Promise<T>): Promise<Result<T>>;
    getState(): CircuitState;
    getStats(): CircuitBreakerStats;
    reset(): void;
    private onSuccess;
    private onFailure;
    private openCircuit;
    private shouldAttemptReset;
}

/**
 * Rate Limiter Algorithms
 */
declare enum RateLimitAlgorithm {
    FixedWindow = "FIXED_WINDOW",
    SlidingWindow = "SLIDING_WINDOW",
    TokenBucket = "TOKEN_BUCKET",
    LeakyBucket = "LEAKY_BUCKET"
}
/**
 * Rate Limit Options
 */
interface RateLimitOptions {
    /**
     * Max requests
     */
    maxRequests: number;
    /**
     * Window size (ms)
     */
    windowMs: number;
    /**
     * Algorithm
     */
    algorithm?: RateLimitAlgorithm;
}
/**
 * Rate Limit Result
 */
interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    retryAfter?: number;
}
/**
 * Rate Limiter Interface
 */
interface IRateLimiter {
    /**
     * Check if request is allowed
     */
    tryAcquire(key: string): Promise<Result<RateLimitResult>>;
    /**
     * Reset rate limit for key
     */
    reset(key: string): void;
    /**
     * Get current stats
     */
    getStats(key: string): RateLimitResult;
}

/**
 * Simple Sliding Window Rate Limiter
 */
declare class RateLimiter implements IRateLimiter {
    private options;
    private requests;
    constructor(options: RateLimitOptions);
    tryAcquire(key: string): Promise<Result<RateLimitResult>>;
    reset(key: string): void;
    getStats(key: string): RateLimitResult;
}
/**
 * Token Bucket Rate Limiter
 */
declare class TokenBucketRateLimiter implements IRateLimiter {
    private options;
    private buckets;
    constructor(options: RateLimitOptions);
    tryAcquire(key: string): Promise<Result<RateLimitResult>>;
    reset(key: string): void;
    getStats(key: string): RateLimitResult;
}

/**
 * Cache Interface
 * Redis, Memcached, In-Memory için generic interface
 */
/**
 * Cache Entry with metadata
 */
interface CacheEntry<T> {
    value: T;
    expiresAt?: Date;
    createdAt: Date;
}
/**
 * Cache Options
 */
interface CacheOptions {
    /**
     * TTL in seconds
     */
    ttl?: number;
    /**
     * Namespace/Prefix for keys
     */
    prefix?: string;
    /**
     * Serialize to JSON
     */
    serialize?: boolean;
}
/**
 * Cache Statistics
 */
interface CacheStats {
    hits: number;
    misses: number;
    keys: number;
    memory?: string;
}
/**
 * Cache Interface
 */
interface ICache {
    /**
     * Get value from cache
     */
    get<T>(key: string): Promise<Result<T | null>>;
    /**
     * Set value in cache
     */
    set<T>(key: string, value: T, ttl?: number): Promise<Result<void>>;
    /**
     * Delete key from cache
     */
    delete(key: string): Promise<Result<void>>;
    /**
     * Check if key exists
     */
    has(key: string): Promise<Result<boolean>>;
    /**
     * Clear all cache
     */
    clear(): Promise<Result<void>>;
    /**
     * Get multiple keys
     */
    mget<T>(keys: string[]): Promise<Result<(T | null)[]>>;
    /**
     * Set multiple keys
     */
    mset<T>(entries: Record<string, T>, ttl?: number): Promise<Result<void>>;
    /**
     * Increment value
     */
    increment(key: string, amount?: number): Promise<Result<number>>;
    /**
     * Decrement value
     */
    decrement(key: string, amount?: number): Promise<Result<number>>;
    /**
     * Get TTL for key
     */
    ttl(key: string): Promise<Result<number>>;
    /**
     * Set expiration for key
     */
    expire(key: string, seconds: number): Promise<Result<boolean>>;
    /**
     * Get all keys matching pattern
     */
    keys(pattern: string): Promise<Result<string[]>>;
    /**
     * Get cache statistics
     */
    stats(): Promise<Result<CacheStats>>;
    /**
     * Disconnect/Close
     */
    disconnect(): Promise<Result<void>>;
}
/**
 * Cache Configuration
 */
interface CacheConfig {
    /**
     * Default TTL in seconds
     */
    defaultTTL?: number;
    /**
     * Key prefix
     */
    prefix?: string;
    /**
     * Enable compression
     */
    compress?: boolean;
    /**
     * Max memory (MB)
     */
    maxMemory?: number;
}

/**
 * Redis Configuration
 */
interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    prefix?: string;
    defaultTTL?: number;
    connectTimeout?: number;
    maxRetriesPerRequest?: number;
}
/**
 * Redis Adapter
 *
 * IMPORTANT: Requires 'ioredis' package
 * Install: npm install ioredis @types/ioredis
 *
 * This is an interface adapter - actual Redis client must be injected
 */
declare class RedisAdapter implements ICache {
    private client;
    private prefix;
    private defaultTTL;
    private hitCount;
    private missCount;
    constructor(client: any, config?: Partial<RedisConfig>);
    /**
     * Get full key with prefix
     */
    private getKey;
    /**
     * Serialize value to string
     */
    private serialize;
    /**
     * Deserialize string to value
     */
    private deserialize;
    get<T>(key: string): Promise<Result<T | null>>;
    set<T>(key: string, value: T, ttl?: number): Promise<Result<void>>;
    delete(key: string): Promise<Result<void>>;
    has(key: string): Promise<Result<boolean>>;
    clear(): Promise<Result<void>>;
    mget<T>(keys: string[]): Promise<Result<(T | null)[]>>;
    mset<T>(entries: Record<string, T>, ttl?: number): Promise<Result<void>>;
    increment(key: string, amount?: number): Promise<Result<number>>;
    decrement(key: string, amount?: number): Promise<Result<number>>;
    ttl(key: string): Promise<Result<number>>;
    expire(key: string, seconds: number): Promise<Result<boolean>>;
    keys(pattern: string): Promise<Result<string[]>>;
    stats(): Promise<Result<CacheStats>>;
    disconnect(): Promise<Result<void>>;
    /**
     * Get hit rate
     */
    getHitRate(): number;
    /**
     * Reset statistics
     */
    resetStats(): void;
}

/**
 * In-Memory Cache Adapter
 * Test ve development için
 */
declare class InMemoryAdapter implements ICache {
    private cache;
    private prefix;
    private defaultTTL;
    private hitCount;
    private missCount;
    constructor(prefix?: string, defaultTTL?: number);
    private getKey;
    private isExpired;
    private cleanup;
    get<T>(key: string): Promise<Result<T | null>>;
    set<T>(key: string, value: T, ttl?: number): Promise<Result<void>>;
    delete(key: string): Promise<Result<void>>;
    has(key: string): Promise<Result<boolean>>;
    clear(): Promise<Result<void>>;
    mget<T>(keys: string[]): Promise<Result<(T | null)[]>>;
    mset<T>(entries: Record<string, T>, ttl?: number): Promise<Result<void>>;
    increment(key: string, amount?: number): Promise<Result<number>>;
    decrement(key: string, amount?: number): Promise<Result<number>>;
    ttl(key: string): Promise<Result<number>>;
    expire(key: string, seconds: number): Promise<Result<boolean>>;
    keys(pattern: string): Promise<Result<string[]>>;
    stats(): Promise<Result<CacheStats>>;
    disconnect(): Promise<Result<void>>;
    getHitRate(): number;
    resetStats(): void;
}

/**
 * WebSocket Message
 */
interface WebSocketMessage<T = any> {
    event: string;
    data: T;
    timestamp?: Date;
    id?: string;
}
/**
 * WebSocket Room
 */
interface WebSocketRoom {
    name: string;
    clients: Set<string>;
}
/**
 * WebSocket Client Info
 */
interface WebSocketClient {
    id: string;
    rooms: Set<string>;
    metadata?: Record<string, any>;
    connectedAt: Date;
}
/**
 * WebSocket Server Interface
 */
interface IWebSocketServer {
    /**
     * Start server
     */
    start(port: number): Promise<Result<void>>;
    /**
     * Stop server
     */
    stop(): Promise<Result<void>>;
    /**
     * Send message to specific client
     */
    sendToClient<T>(clientId: string, event: string, data: T): Result<void>;
    /**
     * Send message to all clients
     */
    broadcast<T>(event: string, data: T): Result<void>;
    /**
     * Send message to room
     */
    broadcastToRoom<T>(room: string, event: string, data: T): Result<void>;
    /**
     * Join client to room
     */
    joinRoom(clientId: string, room: string): Result<void>;
    /**
     * Remove client from room
     */
    leaveRoom(clientId: string, room: string): Result<void>;
    /**
     * Get all connected clients
     */
    getClients(): WebSocketClient[];
    /**
     * Get clients in room
     */
    getRoomClients(room: string): string[];
    /**
     * Disconnect client
     */
    disconnectClient(clientId: string): Result<void>;
    /**
     * Register event handler
     */
    on(event: string, handler: (clientId: string, data: any) => void | Promise<void>): void;
    /**
     * Get server stats
     */
    getStats(): WebSocketStats;
}
/**
 * WebSocket Client Interface
 */
interface IWebSocketClient {
    /**
     * Connect to server
     */
    connect(url: string): Promise<Result<void>>;
    /**
     * Disconnect from server
     */
    disconnect(): Result<void>;
    /**
     * Send message
     */
    send<T>(event: string, data: T): Result<void>;
    /**
     * Listen to event
     */
    on(event: string, handler: (data: any) => void): void;
    /**
     * Remove event listener
     */
    off(event: string, handler: (data: any) => void): void;
    /**
     * Is connected?
     */
    isConnected(): boolean;
}
/**
 * WebSocket Stats
 */
interface WebSocketStats {
    connectedClients: number;
    rooms: number;
    messagesSent: number;
    messagesReceived: number;
    uptime: number;
}
/**
 * WebSocket Configuration
 */
interface WebSocketConfig {
    /**
     * Port number
     */
    port?: number;
    /**
     * Path
     */
    path?: string;
    /**
     * CORS settings
     */
    cors?: {
        origin: string | string[];
        credentials?: boolean;
    };
    /**
     * Ping interval (ms)
     */
    pingInterval?: number;
    /**
     * Ping timeout (ms)
     */
    pingTimeout?: number;
    /**
     * Max payload size (bytes)
     */
    maxPayload?: number;
}

/**
 * Socket.IO Server Adapter
 *
 * IMPORTANT: Requires 'socket.io' package
 * Install: npm install socket.io @types/socket.io
 *
 * This is an interface adapter - actual Socket.IO server must be injected
 */
declare class SocketIOServerAdapter implements IWebSocketServer {
    private io;
    private clients;
    private rooms;
    private handlers;
    private messagesSent;
    private messagesReceived;
    private startTime;
    constructor(io: any, config?: WebSocketConfig);
    /**
     * Setup Socket.IO event handlers
     */
    private setupHandlers;
    /**
     * Handle new client connection
     */
    private handleConnection;
    /**
     * Setup handlers for client events
     */
    private setupClientHandlers;
    /**
     * Handle client disconnection
     */
    private handleDisconnection;
    start(port: number): Promise<Result<void>>;
    stop(): Promise<Result<void>>;
    sendToClient<T>(clientId: string, event: string, data: T): Result<void>;
    broadcast<T>(event: string, data: T): Result<void>;
    broadcastToRoom<T>(room: string, event: string, data: T): Result<void>;
    joinRoom(clientId: string, room: string): Result<void>;
    leaveRoom(clientId: string, room: string): Result<void>;
    getClients(): WebSocketClient[];
    getRoomClients(room: string): string[];
    disconnectClient(clientId: string): Result<void>;
    on(event: string, handler: (clientId: string, data: any) => void | Promise<void>): void;
    getStats(): WebSocketStats;
    /**
     * Set client metadata
     */
    setClientMetadata(clientId: string, metadata: Record<string, any>): Result<void>;
    /**
     * Get client metadata
     */
    getClientMetadata(clientId: string): Result<Record<string, any> | undefined>;
}

/**
 * Socket.IO Client Adapter
 *
 * IMPORTANT: Requires 'socket.io-client' package
 * Install: npm install socket.io-client
 *
 * This is an interface adapter - actual Socket.IO client must be injected
 */
declare class SocketIOClientAdapter implements IWebSocketClient {
    private socket;
    private url;
    private connected;
    private reconnectAttempts;
    private maxReconnectAttempts;
    constructor(socket?: any);
    connect(url: string): Promise<Result<void>>;
    disconnect(): Result<void>;
    send<T>(event: string, data: T): Result<void>;
    on(event: string, handler: (data: any) => void): void;
    off(event: string, handler: (data: any) => void): void;
    isConnected(): boolean;
    /**
     * Send with acknowledgment
     */
    sendWithAck<T, R>(event: string, data: T, timeout?: number): Promise<Result<R>>;
    /**
     * Join room
     */
    joinRoom(room: string): Result<void>;
    /**
     * Leave room
     */
    leaveRoom(room: string): Result<void>;
}

/**
 * Native WebSocket Client Adapter
 * Lightweight alternative to Socket.IO
 *
 * Uses native WebSocket API (works in browser and Node.js with 'ws' package)
 */
declare class NativeWebSocketAdapter implements IWebSocketClient {
    private ws?;
    private url;
    private connected;
    private eventHandlers;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    connect(url: string): Promise<Result<void>>;
    disconnect(): Result<void>;
    send<T>(event: string, data: T): Result<void>;
    on(event: string, handler: (data: any) => void): void;
    off(event: string, handler: (data: any) => void): void;
    isConnected(): boolean;
    /**
     * Handle incoming message
     */
    private handleMessage;
    /**
     * Attempt to reconnect
     */
    private attemptReconnect;
}

interface IHttpClient {
    request<T>(options: IHttpRequest): Promise<Result<IHttpResponse<T>>>;
    get<T>(url: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<Result<IHttpResponse<T>>>;
    post<T>(url: string, body: any, headers?: Record<string, string>): Promise<Result<IHttpResponse<T>>>;
    put<T>(url: string, body: any, headers?: Record<string, string>): Promise<Result<IHttpResponse<T>>>;
    delete<T>(url: string, headers?: Record<string, string>): Promise<Result<IHttpResponse<T>>>;
}

interface ISoapClient {
    call<T>(methodName: string, args: Record<string, any>): Promise<Result<T>>;
    addHeader(name: string, content: any): void;
}

/**
 * Browser Storage Interface
 * localStorage, sessionStorage, IndexedDB için generic interface
 *
 * Frontend'de kullanılır (Vue, React vb.)
 */
interface IBrowserStorage {
    /**
     * Item'ı kaydet
     */
    setItem<T>(key: string, value: T): Result<void>;
    /**
     * Item'ı getir
     */
    getItem<T>(key: string): Result<T | null>;
    /**
     * Item'ı sil
     */
    removeItem(key: string): Result<void>;
    /**
     * Tüm storage'ı temizle
     */
    clear(): Result<void>;
    /**
     * Key var mı kontrol et
     */
    hasKey(key: string): boolean;
    /**
     * Tüm key'leri getir
     */
    keys(): string[];
    /**
     * Storage boyutunu getir (byte)
     */
    size(): number;
}
/**
 * Storage Options
 */
interface StorageOptions {
    /**
     * Expire süresi (millisecond)
     */
    expiresIn?: number;
    /**
     * Encrypt edilsin mi?
     */
    encrypt?: boolean;
    /**
     * Prefix (namespace için)
     */
    prefix?: string;
}
/**
 * Stored Item Wrapper (metadata ile)
 */
interface StoredItem<T> {
    value: T;
    timestamp: number;
    expiresAt?: number;
    version?: string;
}

/**
 * LocalStorage Adapter
 * IBrowserStorage'ın localStorage implementasyonu
 */
declare class LocalStorageAdapter implements IBrowserStorage {
    private readonly prefix;
    constructor(prefix?: string);
    private getFullKey;
    setItem<T>(key: string, value: T): Result<void>;
    getItem<T>(key: string): Result<T | null>;
    removeItem(key: string): Result<void>;
    clear(): Result<void>;
    hasKey(key: string): boolean;
    keys(): string[];
    size(): number;
    /**
     * Set item with expiration
     */
    setItemWithExpiry<T>(key: string, value: T, expiresInMs: number): Result<void>;
}

/**
 * Unit of Work Pattern
 * Transaction yönetimi için
 *
 * Backend'de kullanılır - Birden fazla repository operasyonunu
 * tek bir transaction'da toplar
 */
interface IUnitOfWork {
    /**
     * Transaction başlat
     */
    begin(): Promise<Result<void>>;
    /**
     * Transaction'ı commit et (kaydet)
     */
    commit(): Promise<Result<void>>;
    /**
     * Transaction'ı rollback et (geri al)
     */
    rollback(): Promise<Result<void>>;
    /**
     * Transaction aktif mi?
     */
    isActive(): boolean;
    /**
     * Transaction içinde iş yap (auto commit/rollback)
     */
    execute<T>(work: () => Promise<Result<T>>): Promise<Result<T>>;
}
/**
 * Transaction Manager
 * Nested transaction desteği ile
 */
interface ITransactionManager {
    /**
     * Transaction başlat ve callback çalıştır
     * Başarılı ise commit, hata varsa rollback
     */
    runInTransaction<T>(work: (transaction: ITransaction) => Promise<Result<T>>): Promise<Result<T>>;
    /**
     * Savepoint oluştur (nested transaction için)
     */
    createSavepoint(name: string): Promise<Result<void>>;
    /**
     * Savepoint'e geri dön
     */
    rollbackToSavepoint(name: string): Promise<Result<void>>;
    /**
     * Savepoint'i sil
     */
    releaseSavepoint(name: string): Promise<Result<void>>;
}
/**
 * Transaction Interface
 * Aktif transaction'ı temsil eder
 */
interface ITransaction {
    /**
     * Transaction ID
     */
    readonly id: string;
    /**
     * Commit
     */
    commit(): Promise<Result<void>>;
    /**
     * Rollback
     */
    rollback(): Promise<Result<void>>;
    /**
     * Isolation level
     */
    readonly isolationLevel?: TransactionIsolationLevel;
}
/**
 * Transaction Isolation Levels
 */
declare enum TransactionIsolationLevel {
    ReadUncommitted = "READ_UNCOMMITTED",
    ReadCommitted = "READ_COMMITTED",
    RepeatableRead = "REPEATABLE_READ",
    Serializable = "SERIALIZABLE"
}
/**
 * Transaction Options
 */
interface TransactionOptions {
    isolationLevel?: TransactionIsolationLevel;
    timeout?: number;
    readOnly?: boolean;
}

/**
 * Base Unit of Work Implementation
 * Abstract class - Her ORM için extend edilmeli
 */
declare abstract class BaseUnitOfWork implements IUnitOfWork {
    private _isActive;
    isActive(): boolean;
    begin(): Promise<Result<void>>;
    commit(): Promise<Result<void>>;
    rollback(): Promise<Result<void>>;
    /**
     * Transaction içinde iş yap - auto commit/rollback
     */
    execute<T>(work: () => Promise<Result<T>>): Promise<Result<T>>;
    /**
     * Abstract methods - ORM'e göre implement edilmeli
     */
    protected abstract beginTransaction(): Promise<Result<void>>;
    protected abstract commitTransaction(): Promise<Result<void>>;
    protected abstract rollbackTransaction(): Promise<Result<void>>;
}

/**
 * Query Builder Interface
 * Type-safe sorgu oluşturma (Frontend & Backend)
 *
 * Fluent API ile SQL/NoSQL sorgularını güvenli şekilde oluştur
 */
interface IQueryBuilder<T> {
    /**
     * WHERE koşulu ekle
     */
    where(field: keyof T, operator: Operator, value: any): this;
    /**
     * WHERE koşulu ekle (custom)
     */
    whereRaw(condition: string, params?: any[]): this;
    /**
     * AND koşulu
     */
    andWhere(field: keyof T, operator: Operator, value: any): this;
    /**
     * OR koşulu
     */
    orWhere(field: keyof T, operator: Operator, value: any): this;
    /**
     * WHERE IN
     */
    whereIn(field: keyof T, values: any[]): this;
    /**
     * WHERE NOT IN
     */
    whereNotIn(field: keyof T, values: any[]): this;
    /**
     * WHERE BETWEEN
     */
    whereBetween(field: keyof T, min: any, max: any): this;
    /**
     * WHERE NULL
     */
    whereNull(field: keyof T): this;
    /**
     * WHERE NOT NULL
     */
    whereNotNull(field: keyof T): this;
    /**
     * ORDER BY
     */
    orderBy(field: keyof T, direction?: 'ASC' | 'DESC'): this;
    /**
     * LIMIT
     */
    limit(count: number): this;
    /**
     * OFFSET
     */
    offset(count: number): this;
    /**
     * Pagination
     */
    paginate(options: Partial<IPaginationRequest>): this;
    /**
     * SELECT fields
     */
    select(...fields: (keyof T)[]): this;
    /**
     * JOIN
     */
    join<U>(table: string, leftField: keyof T, operator: Operator, rightField: string): this;
    /**
     * GROUP BY
     */
    groupBy(...fields: (keyof T)[]): this;
    /**
     * HAVING
     */
    having(field: keyof T, operator: Operator, value: any): this;
    /**
     * Execute query - Birden fazla sonuç
     */
    getMany(): Promise<Result<T[]>>;
    /**
     * Execute query - Tek sonuç
     */
    getOne(): Promise<Result<T | null>>;
    /**
     * Execute query - Count
     */
    count(): Promise<Result<number>>;
    /**
     * Execute query - Exists
     */
    exists(): Promise<Result<boolean>>;
    /**
     * Raw SQL çalıştır
     */
    raw(sql: string, params?: any[]): Promise<Result<any>>;
    /**
     * Query'yi string'e çevir (debug için)
     */
    toSQL(): string;
    /**
     * Query'yi klonla
     */
    clone(): IQueryBuilder<T>;
}
/**
 * Query Operators
 */
type Operator = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'LIKE' | 'NOT LIKE' | 'IN' | 'NOT IN' | 'BETWEEN' | 'IS NULL' | 'IS NOT NULL';
/**
 * Query Condition
 */
interface QueryCondition<T> {
    field: keyof T;
    operator: Operator;
    value: any;
    conjunction?: 'AND' | 'OR';
}
/**
 * Query Order
 */
interface QueryOrder<T> {
    field: keyof T;
    direction: 'ASC' | 'DESC';
}
/**
 * Query Options
 */
interface QueryOptions {
    timeout?: number;
    readOnly?: boolean;
    cache?: boolean;
    cacheTTL?: number;
}

/**
 * Base Query Builder
 * Abstract implementation - Her ORM extend edebilir
 */
declare abstract class BaseQueryBuilder<T> implements IQueryBuilder<T> {
    protected conditions: QueryCondition<T>[];
    protected orders: QueryOrder<T>[];
    protected selectedFields: (keyof T)[];
    protected limitValue?: number;
    protected offsetValue?: number;
    protected groupByFields: (keyof T)[];
    where(field: keyof T, operator: Operator, value: any): this;
    whereRaw(condition: string, params?: any[]): this;
    andWhere(field: keyof T, operator: Operator, value: any): this;
    orWhere(field: keyof T, operator: Operator, value: any): this;
    whereIn(field: keyof T, values: any[]): this;
    whereNotIn(field: keyof T, values: any[]): this;
    whereBetween(field: keyof T, min: any, max: any): this;
    whereNull(field: keyof T): this;
    whereNotNull(field: keyof T): this;
    orderBy(field: keyof T, direction?: 'ASC' | 'DESC'): this;
    limit(count: number): this;
    offset(count: number): this;
    paginate(options: Partial<IPaginationRequest>): this;
    select(...fields: (keyof T)[]): this;
    join<U>(table: string, leftField: keyof T, operator: Operator, rightField: string): this;
    groupBy(...fields: (keyof T)[]): this;
    having(field: keyof T, operator: Operator, value: any): this;
    clone(): IQueryBuilder<T>;
    /**
     * Abstract methods - Subclass implement etmeli
     */
    abstract getMany(): Promise<Result<T[]>>;
    abstract getOne(): Promise<Result<T | null>>;
    abstract count(): Promise<Result<number>>;
    abstract exists(): Promise<Result<boolean>>;
    abstract raw(sql: string, params?: any[]): Promise<Result<any>>;
    abstract toSQL(): string;
}

/**
 * Query Helper Functions
 * Sık kullanılan query pattern'leri
 */
declare class QueryHelpers {
    /**
     * Pagination helper
     */
    static paginate<T>(query: IQueryBuilder<T>, page: number, pageSize?: number): IQueryBuilder<T>;
    /**
     * Search helper (LIKE query)
     */
    static search<T>(query: IQueryBuilder<T>, fields: (keyof T)[], searchTerm: string): IQueryBuilder<T>;
    /**
     * Date range helper
     */
    static dateRange<T>(query: IQueryBuilder<T>, field: keyof T, startDate: Date, endDate: Date): IQueryBuilder<T>;
    /**
     * Active records helper
     */
    static active<T extends {
        isActive?: boolean;
    }>(query: IQueryBuilder<T>): IQueryBuilder<T>;
    /**
     * Soft delete helper
     */
    static notDeleted<T extends {
        deletedAt?: Date | null;
    }>(query: IQueryBuilder<T>): IQueryBuilder<T>;
}

/**
 * Advanced Query Builder Extensions
 */
declare class QueryBuilderExtensions {
    /**
     * Full text search
     */
    static search<T>(query: IQueryBuilder<T>, fields: (keyof T)[], searchTerm: string): IQueryBuilder<T>;
    /**
     * Filter by multiple values (OR)
     */
    static filterByAny<T>(query: IQueryBuilder<T>, field: keyof T, values: any[]): IQueryBuilder<T>;
    /**
     * Date range filter
     */
    static dateRange<T>(query: IQueryBuilder<T>, field: keyof T, start: Date, end: Date): IQueryBuilder<T>;
    /**
     * Conditional filter
     */
    static when<T>(query: IQueryBuilder<T>, condition: boolean, callback: (q: IQueryBuilder<T>) => IQueryBuilder<T>): IQueryBuilder<T>;
    /**
     * Select distinct
     */
    static distinct<T>(query: IQueryBuilder<T>, fields?: (keyof T)[]): IQueryBuilder<T>;
    /**
     * Random order
     */
    static random<T>(query: IQueryBuilder<T>): IQueryBuilder<T>;
    /**
     * Chunk processing
     */
    static chunk<T>(query: IQueryBuilder<T>, size: number, callback: (items: T[]) => Promise<void>): Promise<void>;
}

/**
 * Event Bus Interface
 * Uygulama içi event yayınlama/dinleme (Frontend & Backend)
 *
 * Domain Events'den farkı: Application-level events
 * - Domain Events: Domain içinde (UserCreated, OrderPlaced)
 * - Event Bus: Application-level (UI events, system events)
 */
/**
 * Event Interface
 */
interface IEvent {
    /**
     * Event adı (unique identifier)
     */
    name: string;
    /**
     * Event payload
     */
    data?: any;
    /**
     * Event zamanı
     */
    timestamp: Date;
    /**
     * Event source (hangi component/service)
     */
    source?: string;
}
/**
 * Event Handler Type
 */
type EventHandler<T = any> = (event: IEvent & {
    data: T;
}) => void | Promise<void>;
/**
 * Event Subscription
 */
interface IEventSubscription {
    /**
     * Subscription ID
     */
    id: string;
    /**
     * Event adı
     */
    eventName: string;
    /**
     * Unsubscribe
     */
    unsubscribe(): void;
}
/**
 * Event Bus Interface
 */
interface IEventBus {
    /**
     * Event'e subscribe ol
     */
    on<T = any>(eventName: string, handler: EventHandler<T>): IEventSubscription;
    /**
     * Event'e bir kez subscribe ol (auto unsubscribe)
     */
    once<T = any>(eventName: string, handler: EventHandler<T>): IEventSubscription;
    /**
     * Event'ten unsubscribe ol
     */
    off(eventName: string, handler: EventHandler): void;
    /**
     * Tüm event'leri temizle
     */
    offAll(eventName?: string): void;
    /**
     * Event yayınla (async)
     */
    emit<T = any>(eventName: string, data?: T, source?: string): Promise<Result<void>>;
    /**
     * Event yayınla (sync)
     */
    emitSync<T = any>(eventName: string, data?: T, source?: string): Result<void>;
    /**
     * Event'in listener'ı var mı?
     */
    hasListeners(eventName: string): boolean;
    /**
     * Listener sayısını getir
     */
    listenerCount(eventName: string): number;
}
/**
 * Event Bus Options
 */
interface EventBusOptions {
    /**
     * Max listener sayısı (memory leak önleme)
     */
    maxListeners?: number;
    /**
     * Error handler
     */
    onError?: (error: Error, event: IEvent) => void;
    /**
     * Wildcard destekle (* ile subscribe)
     */
    enableWildcard?: boolean;
}

/**
 * In-Memory Event Bus Implementation
 */
declare class EventBus implements IEventBus {
    private listeners;
    private onceListeners;
    private options;
    private subscriptionIdCounter;
    constructor(options?: EventBusOptions);
    on<T = any>(eventName: string, handler: EventHandler<T>): IEventSubscription;
    once<T = any>(eventName: string, handler: EventHandler<T>): IEventSubscription;
    off(eventName: string, handler: EventHandler): void;
    offAll(eventName?: string): void;
    emit<T = any>(eventName: string, data?: T, source?: string): Promise<Result<void>>;
    emitSync<T = any>(eventName: string, data?: T, source?: string): Result<void>;
    hasListeners(eventName: string): boolean;
    listenerCount(eventName: string): number;
    private validateMaxListeners;
    /**
     * Debug: Tüm event'leri listele
     */
    getEventNames(): string[];
}

/**
 * Application Event Types
 * Magic string yerine constant kullan
 */
declare const EventTypes: {
    readonly USER_LOGGED_IN: "user.logged_in";
    readonly USER_LOGGED_OUT: "user.logged_out";
    readonly USER_REGISTERED: "user.registered";
    readonly USER_UPDATED: "user.updated";
    readonly THEME_CHANGED: "ui.theme_changed";
    readonly LANGUAGE_CHANGED: "ui.language_changed";
    readonly NOTIFICATION_RECEIVED: "ui.notification_received";
    readonly SYSTEM_ERROR: "system.error";
    readonly SYSTEM_WARNING: "system.warning";
    readonly SYSTEM_INFO: "system.info";
    readonly DATA_LOADED: "data.loaded";
    readonly DATA_SAVED: "data.saved";
    readonly DATA_DELETED: "data.deleted";
    readonly WS_CONNECTED: "websocket.connected";
    readonly WS_DISCONNECTED: "websocket.disconnected";
    readonly WS_MESSAGE_RECEIVED: "websocket.message_received";
};
type EventType = typeof EventTypes[keyof typeof EventTypes];

/**
 * Dependency Injection Container Interface
 * Service'leri kaydet ve çöz (Frontend & Backend)
 */
/**
 * Service Lifecycle
 */
declare enum ServiceLifetime {
    /**
     * Her çağrıda yeni instance
     */
    Transient = "TRANSIENT",
    /**
     * İlk çağrıda oluştur, sonra aynısını kullan (Singleton)
     */
    Singleton = "SINGLETON",
    /**
     * Request/Scope bazlı (Backend için)
     */
    Scoped = "SCOPED"
}
/**
 * Service Descriptor
 */
interface ServiceDescriptor<T = any> {
    /**
     * Service identifier (class veya string token)
     */
    token: string | symbol;
    /**
     * Factory function veya Class constructor
     */
    factory: () => T | Promise<T>;
    /**
     * Lifecycle
     */
    lifetime: ServiceLifetime;
    /**
     * Dependencies (optional - auto-injection için)
     */
    dependencies?: (string | symbol)[];
}
/**
 * Container Interface
 */
interface IContainer {
    /**
     * Transient service kaydet
     */
    registerTransient<T>(token: string | symbol, factory: () => T): void;
    /**
     * Singleton service kaydet
     */
    registerSingleton<T>(token: string | symbol, factory: () => T): void;
    /**
     * Scoped service kaydet
     */
    registerScoped<T>(token: string | symbol, factory: () => T): void;
    /**
     * Instance kaydet (singleton olarak)
     */
    registerInstance<T>(token: string | symbol, instance: T): void;
    /**
     * Service çöz (resolve)
     */
    resolve<T>(token: string | symbol): Result<T>;
    /**
     * Async service çöz
     */
    resolveAsync<T>(token: string | symbol): Promise<Result<T>>;
    /**
     * Service kayıtlı mı kontrol et
     */
    isRegistered(token: string | symbol): boolean;
    /**
     * Tüm servisleri temizle
     */
    clear(): void;
    /**
     * Child scope oluştur (scoped services için)
     */
    createScope(): IContainer;
}
/**
 * Injectable Decorator için metadata key
 */
declare const INJECTABLE_METADATA_KEY: unique symbol;
/**
 * Inject Decorator için metadata key
 */
declare const INJECT_METADATA_KEY: unique symbol;

/**
 * Simple Dependency Injection Container
 */
declare class Container implements IContainer {
    private services;
    private singletons;
    private scopedInstances;
    private parent?;
    constructor(parent?: Container);
    registerTransient<T>(token: string | symbol, factory: () => T): void;
    registerSingleton<T>(token: string | symbol, factory: () => T): void;
    registerScoped<T>(token: string | symbol, factory: () => T): void;
    registerInstance<T>(token: string | symbol, instance: T): void;
    resolve<T>(token: string | symbol): Result<T>;
    resolveAsync<T>(token: string | symbol): Promise<Result<T>>;
    isRegistered(token: string | symbol): boolean;
    clear(): void;
    createScope(): IContainer;
    private resolveInternal;
    private resolveInternalAsync;
    private resolveSingleton;
    private resolveSingletonAsync;
    private resolveScoped;
    private resolveScopedAsync;
}

/**
 * Generic Service Tokens
 * Sadece CORE infrastructure servisleri
 *
 * Domain-specific token'lar (UserRepository, ProductRepository vb.)
 * projenin kendi ServiceTokens.ts dosyasında tanımlanmalı!
 */
declare const ServiceTokens: {
    readonly LOGGER: symbol;
    readonly CONFIG: symbol;
    readonly EVENT_BUS: symbol;
    readonly HTTP_CLIENT: symbol;
    readonly SOAP_CLIENT: symbol;
    readonly UNIT_OF_WORK: symbol;
    readonly TRANSACTION_MANAGER: symbol;
    readonly CACHE: symbol;
    readonly LOCAL_STORAGE: symbol;
    readonly SESSION_STORAGE: symbol;
    readonly BROWSER_STORAGE: symbol;
    readonly HASHING_SERVICE: symbol;
    readonly ENCRYPTION_SERVICE: symbol;
    readonly TOKEN_SERVICE: symbol;
    readonly NOTIFICATION_SERVICE: symbol;
    readonly EMAIL_SERVICE: symbol;
    readonly SMS_SERVICE: symbol;
    readonly TRANSLATOR: symbol;
    readonly LOCALIZATION_SERVICE: symbol;
};

/**
 * Config Validator Interface
 * Environment variable'ları validate eder (Backend)
 *
 * Uygulama başlarken çevre değişkenlerinin doğru olduğundan emin ol
 */
/**
 * Validation Rule
 */
interface ValidationRule {
    /**
     * Zorunlu mu?
     */
    required?: boolean;
    /**
     * Tip kontrolü
     */
    type?: 'string' | 'number' | 'boolean' | 'url' | 'email' | 'port';
    /**
     * Pattern (regex)
     */
    pattern?: RegExp;
    /**
     * Enum (allowed values)
     */
    enum?: string[];
    /**
     * Min değer (number için)
     */
    min?: number;
    /**
     * Max değer (number için)
     */
    max?: number;
    /**
     * Min uzunluk (string için)
     */
    minLength?: number;
    /**
     * Max uzunluk (string için)
     */
    maxLength?: number;
    /**
     * Default değer
     */
    default?: any;
    /**
     * Transform function (parse etmeden önce)
     */
    transform?: (value: string) => any;
    /**
     * Custom validator
     */
    validator?: (value: any) => boolean | string;
    /**
     * Açıklama (hata mesajlarında kullanılır)
     */
    description?: string;
}
/**
 * Config Schema
 */
type ConfigSchema = Record<string, ValidationRule>;
/**
 * Validation Error
 */
interface ConfigValidationError {
    field: string;
    value: any;
    message: string;
    rule?: string;
}
/**
 * Validation Result
 */
interface ConfigValidationResult<T = any> {
    isValid: boolean;
    config?: T;
    errors: ConfigValidationError[];
}
/**
 * Config Validator Interface
 */
interface IConfigValidator {
    /**
     * Config'i validate et
     */
    validate<T = any>(config: Record<string, any>, schema: ConfigSchema): Result<T>;
    /**
     * Tek bir field validate et
     */
    validateField(fieldName: string, value: any, rule: ValidationRule): Result<any>;
    /**
     * Environment variable'ları validate et
     */
    validateEnv<T = any>(schema: ConfigSchema, env?: Record<string, string | undefined>): Result<T>;
}

/**
 * Config Validator Implementation
 */
declare class ConfigValidator implements IConfigValidator {
    validate<T = any>(config: Record<string, any>, schema: ConfigSchema): Result<T>;
    validateField(fieldName: string, value: any, rule: ValidationRule): Result<any>;
    validateEnv<T = any>(schema: ConfigSchema, env?: Record<string, string | undefined>): Result<T>;
    private validateType;
}

/**
 * Common Config Schemas
 * Sık kullanılan validation schema'ları
 */
/**
 * Database Config Schema
 */
declare const DatabaseConfigSchema: ConfigSchema;
/**
 * Server Config Schema
 */
declare const ServerConfigSchema: ConfigSchema;
/**
 * Auth Config Schema
 */
declare const AuthConfigSchema: ConfigSchema;
/**
 * Email Config Schema
 */
declare const EmailConfigSchema: ConfigSchema;
/**
 * Complete App Config Schema
 * Combine all schemas
 */
declare const AppConfigSchema: ConfigSchema;

declare const CoreKeys: {
    readonly RESULT: {
        readonly SUCCESS_WITH_ERROR: "RESULT_SUCCESS_WITH_ERROR";
        readonly FAIL_WITHOUT_ERROR: "RESULT_FAIL_WITHOUT_ERROR";
        readonly VALUE_ON_ERROR: "RESULT_VALUE_ON_ERROR";
    };
    readonly GUARD: {
        readonly NULL_OR_UNDEFINED: "GUARD.NULL_OR_UNDEFINED";
        readonly EMPTY_STRING: "GUARD.EMPTY_STRING";
        readonly AT_LEAST: "GUARD.AT_LEAST";
        readonly AT_MOST: "GUARD.AT_MOST";
        readonly RANGE: "GUARD.RANGE";
        readonly INVALID_PATTERN: "GUARD.INVALID_PATTERN";
    };
    readonly VALIDATION: {
        readonly INVALID_EMAIL: "VALIDATION_INVALID_EMAIL";
    };
    readonly APP_ERROR: {
        readonly UNEXPECTED: "APP_ERROR_UNEXPECTED";
    };
    readonly ERRORS: {
        readonly VALIDATION: "ERROR_VALIDATION";
        readonly UNAUTHORIZED: "ERROR_UNAUTHORIZED";
        readonly FORBIDDEN: "ERROR_FORBIDDEN";
        readonly NOT_FOUND: "ERROR_NOT_FOUND";
        readonly CONFLICT: "ERROR_CONFLICT";
        readonly SERVICE_UNAVAILABLE: "ERROR_SERVICE_UNAVAILABLE";
        readonly NOT_IMPLEMENTED: "ERROR_NOT_IMPLEMENTED";
        readonly UNEXPECTED: "ERROR_UNEXPECTED";
    };
    readonly INFRA: {
        readonly NETWORK_ERROR: "INFRA_NETWORK_ERROR";
        readonly TIMEOUT_ERROR: "INFRA_TIMEOUT_ERROR";
        readonly ENCRYPTION_FAILED: "INFRA_ENCRYPTION_FAILED";
        readonly DECRYPTION_FAILED: "INFRA_DECRYPTION_FAILED";
        readonly HASHING_FAILED: "INFRA_HASHING_FAILED";
        readonly INVALID_CIPHER_FORMAT: "INFRA_INVALID_CIPHER_FORMAT";
    };
};

declare const RegexPatterns: {
    readonly EMAIL: RegExp;
};

declare enum HttpStatus {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    INTERNAL_SERVER_ERROR = 500,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503
}

type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<DeepPartial<U>> : T[P] extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Type guard functions
 */
declare const isIdle: <T, E>(state: AsyncState<T, E>) => state is {
    status: "idle";
};
declare const isLoading: <T, E>(state: AsyncState<T, E>) => state is {
    status: "loading";
};
declare const isSuccess: <T, E>(state: AsyncState<T, E>) => state is {
    status: "success";
    data: T;
};
declare const isError: <T, E>(state: AsyncState<T, E>) => state is {
    status: "error";
    error: E;
};
/**
 * Async State Type
 * Frontend'de API çağrılarının durumunu takip etmek için
 *
 * Kullanım:
 * - Idle: Henüz başlamadı
 * - Loading: Yükleniyor
 * - Success: Başarılı, data var
 * - Error: Hata oluştu
 */
type AsyncState<T, E = string> = {
    status: 'idle';
} | {
    status: 'loading';
} | {
    status: 'success';
    data: T;
} | {
    status: 'error';
    error: E;
};
/**
 * Helper functions
 */
declare const AsyncState: {
    idle: <T, E = string>() => AsyncState<T, E>;
    loading: <T, E = string>() => AsyncState<T, E>;
    success: <T, E = string>(data: T) => AsyncState<T, E>;
    error: <T, E = string>(error: E) => AsyncState<T, E>;
    /**
     * Map data if success
     */
    map: <T, U, E>(state: AsyncState<T, E>, fn: (data: T) => U) => AsyncState<U, E>;
    /**
     * Get data or default value
     */
    getOrElse: <T, E>(state: AsyncState<T, E>, defaultValue: T) => T;
};

interface ICancellationToken {
    isCancellationRequested: boolean;
    throwIfCancellationRequested(): void;
    signal?: AbortSignal;
}
declare class CancellationToken implements ICancellationToken {
    private readonly nativeSignal?;
    constructor(nativeSignal?: AbortSignal | undefined);
    get isCancellationRequested(): boolean;
    get signal(): AbortSignal | undefined;
    throwIfCancellationRequested(): void;
    static get None(): ICancellationToken;
    static fromAbortSignal(signal: AbortSignal): CancellationToken;
}

interface ITranslator {
    translate(key: string, args?: Record<string, any>): string;
}

/**
 * Singleton Localization Service.
 * Varsayılan olarak basit bir string replace yapar ve İngilizce çalışır.
 * Vue veya Strapi tarafında configure() metodu ile daha gelişmiş bir yapıya (i18n, next-intl vb.) bağlanabilir.
 */
declare class LocalizationService {
    private static instance;
    private translator;
    private localeData;
    private constructor();
    static getInstance(): LocalizationService;
    static configure(translator: ITranslator): void;
    static setLocaleData(data: Record<string, string>): void;
    static t(key: string, args?: Record<string, any>): string;
}

declare const en: {
    RESULT_SUCCESS_WITH_ERROR: string;
    RESULT_FAIL_WITHOUT_ERROR: string;
    RESULT_VALUE_ON_ERROR: string;
    "GUARD.NULL_OR_UNDEFINED": string;
    "GUARD.EMPTY_STRING": string;
    "GUARD.AT_LEAST": string;
    "GUARD.AT_MOST": string;
    "GUARD.RANGE": string;
    "GUARD.INVALID_PATTERN": string;
    ERROR_VALIDATION: string;
    ERROR_UNAUTHORIZED: string;
    ERROR_FORBIDDEN: string;
    ERROR_NOT_FOUND: string;
    ERROR_CONFLICT: string;
    ERROR_SERVICE_UNAVAILABLE: string;
    ERROR_NOT_IMPLEMENTED: string;
    ERROR_UNEXPECTED: string;
    INFRA_NETWORK_ERROR: string;
    INFRA_TIMEOUT_ERROR: string;
    INFRA_ENCRYPTION_FAILED: string;
    INFRA_DECRYPTION_FAILED: string;
    INFRA_HASHING_FAILED: string;
    INFRA_INVALID_CIPHER_FORMAT: string;
    APP_ERROR_UNEXPECTED: string;
    VALIDATION_INVALID_EMAIL: string;
};

declare const tr: {
    RESULT_SUCCESS_WITH_ERROR: string;
    RESULT_FAIL_WITHOUT_ERROR: string;
    RESULT_VALUE_ON_ERROR: string;
    "GUARD.NULL_OR_UNDEFINED": string;
    "GUARD.EMPTY_STRING": string;
    "GUARD.AT_LEAST": string;
    "GUARD.AT_MOST": string;
    "GUARD.RANGE": string;
    "GUARD.INVALID_PATTERN": string;
    ERROR_VALIDATION: string;
    ERROR_UNAUTHORIZED: string;
    ERROR_FORBIDDEN: string;
    ERROR_NOT_FOUND: string;
    ERROR_CONFLICT: string;
    ERROR_SERVICE_UNAVAILABLE: string;
    ERROR_NOT_IMPLEMENTED: string;
    ERROR_UNEXPECTED: string;
    INFRA_NETWORK_ERROR: string;
    INFRA_TIMEOUT_ERROR: string;
    INFRA_ENCRYPTION_FAILED: string;
    INFRA_DECRYPTION_FAILED: string;
    INFRA_HASHING_FAILED: string;
    INFRA_INVALID_CIPHER_FORMAT: string;
    APP_ERROR_UNEXPECTED: string;
    VALIDATION_INVALID_EMAIL: string;
};

/**
 * Deep equality comparison
 * Nested object'leri recursive olarak karşılaştırır
 *
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns true if deeply equal
 */
declare function deepEqual(obj1: any, obj2: any): boolean;

export { AggregateRoot, ApiResponse, AppConfigSchema, AppError, ApplicationError, AsyncState, AuthConfigSchema, AuthenticationMiddleware, AuthorizationMiddleware, BaseQueryBuilder, BaseUnitOfWork, type CacheConfig, type CacheEntry, type CacheOptions, type CacheStats, CancellationToken, CircuitBreaker, type CircuitBreakerOptions, type CircuitBreakerStats, CircuitState, Color, type ConfigSchema, type ConfigValidationError, type ConfigValidationResult, ConfigValidator, ConflictError, Container, type CookieOptions, CoreKeys, CorsMiddleware, DatabaseConfigSchema, DateRange, type DeepPartial, DomainEvents, Email, EmailConfigSchema, Entity, ErrorHandlingMiddleware, EventBus, type EventBusOptions, type EventHandler, type EventType, EventTypes, type FieldError, type FieldRule, type FieldSchema, ForbiddenError, type FormSchema, FormValidator, Guard, type GuardResponse, type HttpMethod, HttpStatus, type IApiError, type IApiResponse, type IApiResponseMeta, type IAppConfig, type IAuthResponse, type IBaseNotification, type IBrowserStorage, type ICache, type ICancellationToken, type ICircuitBreaker, type IConfigValidator, type IContainer, type ICookieAdapter, type IDataNotification, type IDomainEvent, type IEmailNotification, type IEmailService, type IEncryptionService, type IEvent, type IEventBus, type IEventSubscription, type IFormValidator, type IGuardArgument, type IHashingService, type IHttpClient, type IHttpRequest, type IHttpResponse, type ILogger, type IMiddleware, type IMiddlewareContext, type IMiddlewarePipeline, INJECTABLE_METADATA_KEY, INJECT_METADATA_KEY, type INotificationRequest, type INotificationService, type IPaginatedResponse, type IPaginationRequest, type IQueryBuilder, type IRateLimiter, type IRepository, type ISessionManager, type ISmsNotification, type ISmsService, type ISoapClient, type IStorageAdapter, type ITelegramNotification, type ITelegramService, type ITokenPayload, type ITokenService, type ITransaction, type ITransactionManager, type ITranslator, type IUnitOfWork, type IUseCase, type IWebSocketClient, type IWebSocketNotification, type IWebSocketServer, type IWebSocketService, type IWhatsappNotification, type IWhatsappService, InMemoryAdapter, LocalStorageAdapter, LocalizationService, LoggingMiddleware, Mapper, MiddlewareContext, type MiddlewareHandler, type MiddlewareOptions, MiddlewarePipeline, Money, NativeWebSocketAdapter, type NextFunction, NotFoundError, NotImplementedError, NotificationChannel, type Operator, PermissionDeniedError, PhoneNumber, QueryBuilderExtensions, type QueryCondition, QueryHelpers, type QueryOptions, type QueryOrder, RateLimitAlgorithm, RateLimitMiddleware, type RateLimitOptions, type RateLimitResult, RateLimiter, RedisAdapter, type RedisConfig, RegexPatterns, Result, type SearchParams, ServerConfigSchema, type ServiceDescriptor, ServiceLifetime, ServiceTokens, ServiceUnavailableError, SocketIOClientAdapter, SocketIOServerAdapter, type SortDirection, type StorageOptions, type StoredItem, type StructuredError, TenantId, TimeoutMiddleware, TokenBucketRateLimiter, TransactionIsolationLevel, type TransactionOptions, URL, UnauthorizedError, UnexpectedError, UniqueEntityID, ValidationError, ValidationMiddleware, type ValidationResult, type ValidationRule, type ValidationRuleFn, ValueObject, type WebSocketClient, type WebSocketConfig, type WebSocketMessage, type WebSocketRoom, type WebSocketStats, alpha, alphanumeric, asyncUnique, confirmed, creditCard, custom, deepEqual, email, en, fileType, futureDate, iban, ipv4, isError, isIdle, isLoading, isSuccess, jsonString, macAddress, max, maxFileSize, maxLength, min, minAge, minLength, numeric, pastDate, pattern, phone, required, strongPassword, tr, url };
