var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/constants/CoreKeys.ts
var CoreKeys = {
  RESULT: {
    SUCCESS_WITH_ERROR: "RESULT_SUCCESS_WITH_ERROR",
    FAIL_WITHOUT_ERROR: "RESULT_FAIL_WITHOUT_ERROR",
    VALUE_ON_ERROR: "RESULT_VALUE_ON_ERROR"
  },
  GUARD: {
    NULL_OR_UNDEFINED: "GUARD.NULL_OR_UNDEFINED",
    EMPTY_STRING: "GUARD.EMPTY_STRING",
    AT_LEAST: "GUARD.AT_LEAST",
    AT_MOST: "GUARD.AT_MOST",
    RANGE: "GUARD.RANGE",
    INVALID_PATTERN: "GUARD.INVALID_PATTERN"
  },
  VALIDATION: {
    INVALID_EMAIL: "VALIDATION_INVALID_EMAIL"
  },
  APP_ERROR: {
    UNEXPECTED: "APP_ERROR_UNEXPECTED"
  },
  ERRORS: {
    VALIDATION: "ERROR_VALIDATION",
    UNAUTHORIZED: "ERROR_UNAUTHORIZED",
    // Kimliksiz (401)
    FORBIDDEN: "ERROR_FORBIDDEN",
    // Yetkisiz (403)
    NOT_FOUND: "ERROR_NOT_FOUND",
    // Bulunamadı (404)
    CONFLICT: "ERROR_CONFLICT",
    // Çakışma (409)
    SERVICE_UNAVAILABLE: "ERROR_SERVICE_UNAVAILABLE",
    // Servis Yok (503)
    NOT_IMPLEMENTED: "ERROR_NOT_IMPLEMENTED",
    // Yapılmadı (501)
    UNEXPECTED: "ERROR_UNEXPECTED"
  },
  INFRA: {
    NETWORK_ERROR: "INFRA_NETWORK_ERROR",
    TIMEOUT_ERROR: "INFRA_TIMEOUT_ERROR",
    ENCRYPTION_FAILED: "INFRA_ENCRYPTION_FAILED",
    DECRYPTION_FAILED: "INFRA_DECRYPTION_FAILED",
    HASHING_FAILED: "INFRA_HASHING_FAILED",
    INVALID_CIPHER_FORMAT: "INFRA_INVALID_CIPHER_FORMAT"
  }
};

// src/localization/locales/en.ts
var en = {
  // Result
  [CoreKeys.RESULT.SUCCESS_WITH_ERROR]: "InvalidOperation: A result cannot be successful and contain an error",
  [CoreKeys.RESULT.FAIL_WITHOUT_ERROR]: "InvalidOperation: A failing result needs to contain an error message",
  [CoreKeys.RESULT.VALUE_ON_ERROR]: "Can't get the value of an error result. Use 'error' property.",
  // Guard
  [CoreKeys.GUARD.NULL_OR_UNDEFINED]: "{name} is null or undefined",
  [CoreKeys.GUARD.EMPTY_STRING]: "{name} is empty",
  [CoreKeys.GUARD.AT_LEAST]: "{name} must be at least {min} characters long",
  [CoreKeys.GUARD.AT_MOST]: "{name} must be at most {max} characters long",
  [CoreKeys.GUARD.RANGE]: "{name} must be between {min} and {max} characters long",
  [CoreKeys.GUARD.INVALID_PATTERN]: "{name} has an invalid format",
  // Domain Errors
  [CoreKeys.ERRORS.VALIDATION]: "Validation failed.",
  [CoreKeys.ERRORS.UNAUTHORIZED]: "Authentication required.",
  [CoreKeys.ERRORS.FORBIDDEN]: "Access denied.",
  [CoreKeys.ERRORS.NOT_FOUND]: "{resource} not found.",
  [CoreKeys.ERRORS.CONFLICT]: "Resource conflict occurred.",
  [CoreKeys.ERRORS.SERVICE_UNAVAILABLE]: "Service is currently unavailable.",
  [CoreKeys.ERRORS.NOT_IMPLEMENTED]: "This feature is not implemented yet.",
  [CoreKeys.ERRORS.UNEXPECTED]: "An unexpected error occurred.",
  // Infra Errors
  [CoreKeys.INFRA.NETWORK_ERROR]: "A network error occurred. Please check your connection.",
  [CoreKeys.INFRA.TIMEOUT_ERROR]: "The request timed out.",
  [CoreKeys.INFRA.ENCRYPTION_FAILED]: "Encryption process failed.",
  [CoreKeys.INFRA.DECRYPTION_FAILED]: "Decryption process failed.",
  [CoreKeys.INFRA.HASHING_FAILED]: "Hashing process failed.",
  [CoreKeys.INFRA.INVALID_CIPHER_FORMAT]: "Invalid cipher text format.",
  // App & Logic
  [CoreKeys.APP_ERROR.UNEXPECTED]: "An unexpected error occurred.",
  [CoreKeys.VALIDATION.INVALID_EMAIL]: "Invalid email format."
};

// src/localization/LocalizationService.ts
var LocalizationService = class _LocalizationService {
  constructor() {
    this.localeData = en;
    this.translator = {
      translate: (key, args) => {
        let text = this.localeData[key] || key;
        if (args) {
          Object.keys(args).forEach((argKey) => {
            text = text.replace(`{${argKey}}`, String(args[argKey]));
          });
        }
        return text;
      }
    };
  }
  static getInstance() {
    if (!_LocalizationService.instance) {
      _LocalizationService.instance = new _LocalizationService();
    }
    return _LocalizationService.instance;
  }
  // Dışarıdan özel bir translator (Vue-i18n vb.) enjekte etmek için
  static configure(translator) {
    this.getInstance().translator = translator;
  }
  // Core içindeki basit dil dosyalarını değiştirmek için (örn: TR yüklemek için)
  static setLocaleData(data) {
    this.getInstance().localeData = data;
  }
  static t(key, args) {
    return this.getInstance().translator.translate(key, args);
  }
};

// src/logic/Result.ts
var Result = class _Result {
  constructor(isSuccess2, error, value) {
    if (isSuccess2 && error) {
      throw new Error(LocalizationService.t(CoreKeys.RESULT.SUCCESS_WITH_ERROR));
    }
    if (!isSuccess2 && !error) {
      throw new Error(LocalizationService.t(CoreKeys.RESULT.FAIL_WITHOUT_ERROR));
    }
    this.isSuccess = isSuccess2;
    this.isFailure = !isSuccess2;
    this.error = error || null;
    this._value = value;
    Object.freeze(this);
  }
  /**
   * Başarılı sonuç oluşturur
   */
  static ok(value) {
    return new _Result(true, null, value);
  }
  /**
   * Başarısız sonuç oluşturur
   */
  static fail(error) {
    return new _Result(false, error);
  }
  /**
   * Değeri döner. Hata durumunda exception fırlatır.
   */
  getValue() {
    if (!this.isSuccess) {
      throw new Error(LocalizationService.t(CoreKeys.RESULT.VALUE_ON_ERROR));
    }
    return this._value;
  }
  /**
   * Hatayı döner. Başarılı durumda null döner.
   */
  getError() {
    return this.error;
  }
  /**
   * Type-safe değer erişimi (Option pattern)
   */
  getValueOrDefault(defaultValue) {
    return this.isSuccess ? this._value : defaultValue;
  }
  /**
   * Functional map - Başarılı durumda değeri transform eder
   */
  map(fn) {
    if (this.isFailure) {
      return _Result.fail(this.error);
    }
    return _Result.ok(fn(this._value));
  }
  /**
   * Functional flatMap/bind - Başarılı durumda Result dönen fonksiyon uygular
   */
  flatMap(fn) {
    if (this.isFailure) {
      return _Result.fail(this.error);
    }
    return fn(this._value);
  }
};

// src/logic/Guard.ts
var Guard = class {
  /**
   * Custom kural kontrolü
   */
  static should(rule, message) {
    if (!rule) {
      return Result.fail(message);
    }
    return Result.ok();
  }
  /**
   * Null veya undefined kontrolü
   */
  static againstNullOrUndefined(argument, argumentName) {
    if (argument === null || argument === void 0) {
      return Result.fail(
        LocalizationService.t(CoreKeys.GUARD.NULL_OR_UNDEFINED, { name: argumentName })
      );
    }
    return Result.ok();
  }
  /**
   * Çoklu null/undefined kontrolü
   */
  static againstNullOrUndefinedBulk(args) {
    for (const arg of args) {
      const result = this.againstNullOrUndefined(arg.argument, arg.argumentName);
      if (result.isFailure) return result;
    }
    return Result.ok();
  }
  /**
   * Boş string kontrolü
   */
  static againstEmptyString(argument, argumentName) {
    const nullCheck = this.againstNullOrUndefined(argument, argumentName);
    if (nullCheck.isFailure) return nullCheck;
    if (typeof argument === "string" && argument.trim().length === 0) {
      return Result.fail(
        LocalizationService.t(CoreKeys.GUARD.EMPTY_STRING, { name: argumentName })
      );
    }
    return Result.ok();
  }
  /**
   * Minimum karakter uzunluğu kontrolü
   */
  static againstAtLeast(numChars, text, argumentName = "Text") {
    const nullCheck = this.againstNullOrUndefined(text, argumentName);
    if (nullCheck.isFailure) return nullCheck;
    if (text.length < numChars) {
      return Result.fail(
        LocalizationService.t(CoreKeys.GUARD.AT_LEAST, {
          name: argumentName,
          min: numChars.toString()
        })
      );
    }
    return Result.ok();
  }
  /**
   * Maksimum karakter uzunluğu kontrolü
   */
  static againstAtMost(numChars, text, argumentName = "Text") {
    const nullCheck = this.againstNullOrUndefined(text, argumentName);
    if (nullCheck.isFailure) return nullCheck;
    if (text.length > numChars) {
      return Result.fail(
        LocalizationService.t(CoreKeys.GUARD.AT_MOST, {
          name: argumentName,
          max: numChars.toString()
        })
      );
    }
    return Result.ok();
  }
  /**
   * Karakter uzunluğu aralığı kontrolü
   */
  static againstRange(minChars, maxChars, text, argumentName = "Text") {
    const nullCheck = this.againstNullOrUndefined(text, argumentName);
    if (nullCheck.isFailure) return nullCheck;
    if (text.length < minChars || text.length > maxChars) {
      return Result.fail(
        LocalizationService.t(CoreKeys.GUARD.RANGE, {
          name: argumentName,
          min: minChars.toString(),
          max: maxChars.toString()
        })
      );
    }
    return Result.ok();
  }
  /**
   * Birden fazla Result'ı birleştirir
   * Herhangi biri başarısız ise ilk hatayı döner
   */
  static combine(results) {
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.error);
      }
    }
    return Result.ok();
  }
  /**
   * Regex pattern kontrolü
   */
  static againstPattern(pattern2, text, argumentName = "Text") {
    const nullCheck = this.againstNullOrUndefined(text, argumentName);
    if (nullCheck.isFailure) return nullCheck;
    if (!pattern2.test(text)) {
      return Result.fail(
        LocalizationService.t(CoreKeys.GUARD.INVALID_PATTERN, { name: argumentName })
      );
    }
    return Result.ok();
  }
};

// src/logic/errors/ApplicationError.ts
var ApplicationError = class extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
};

// src/logic/errors/ValidationError.ts
var ValidationError = class extends ApplicationError {
  constructor(message, details) {
    super(
      message || LocalizationService.t("VALIDATION_ERROR"),
      "VALIDATION_ERROR",
      details
    );
  }
};

// src/logic/errors/UnauthorizedError.ts
var UnauthorizedError = class extends ApplicationError {
  constructor(message) {
    super(
      message || LocalizationService.t(CoreKeys.ERRORS.UNAUTHORIZED),
      "UNAUTHORIZED_ERROR"
    );
  }
};

// src/logic/errors/NotFoundError.ts
var NotFoundError = class extends ApplicationError {
  constructor(resource) {
    super(
      // DÜZELTME: Elle string yazmak yerine CoreKeys kullanıyoruz
      LocalizationService.t(CoreKeys.ERRORS.NOT_FOUND, { resource }),
      "NOT_FOUND_ERROR"
    );
  }
};

// src/logic/errors/ConflictError.ts
var ConflictError = class extends ApplicationError {
  constructor(message) {
    super(
      message || LocalizationService.t("RESOURCE_CONFLICT"),
      "CONFLICT_ERROR"
    );
  }
};

// src/logic/errors/ServiceUnavailableError.ts
var ServiceUnavailableError = class extends ApplicationError {
  constructor(message) {
    super(
      message || LocalizationService.t(CoreKeys.ERRORS.SERVICE_UNAVAILABLE),
      "SERVICE_UNAVAILABLE_ERROR"
    );
  }
};

// src/logic/errors/NotImplementedError.ts
var NotImplementedError = class extends ApplicationError {
  constructor(methodName) {
    super(
      `Method ${methodName || ""} not implemented.`,
      "NOT_IMPLEMENTED_ERROR"
    );
  }
};

// src/logic/errors/PermissionDeniedError.ts
var PermissionDeniedError = class extends ApplicationError {
  constructor(message) {
    super(
      message || LocalizationService.t("PERMISSION_DENIED"),
      "PERMISSION_DENIED_ERROR"
    );
  }
};

// src/logic/errors/UnexpectedError.ts
var UnexpectedError = class extends ApplicationError {
  constructor(message, details) {
    super(
      message || LocalizationService.t(CoreKeys.ERRORS.UNEXPECTED),
      "UNEXPECTED_ERROR",
      details
    );
  }
};

// src/logic/errors/ForbiddenError.ts
var ForbiddenError = class extends ApplicationError {
  constructor(message) {
    super(
      message || LocalizationService.t(CoreKeys.ERRORS.FORBIDDEN),
      "FORBIDDEN_ERROR"
    );
  }
};

// src/application/Mapper.ts
var Mapper = class {
  /**
   * Bulk transformation: Entity listesini DTO listesine çevir
   */
  toDTOList(entities) {
    return entities.map((entity) => this.toDTO(entity));
  }
  /**
   * Bulk transformation: Raw data listesini Domain Entity listesine çevir
   */
  toDomainList(raws) {
    return raws.map((raw) => this.toDomain(raw));
  }
  /**
   * Bulk transformation: Entity listesini Persistence listesine çevir
   * Sadece toPersistence implement edilmişse kullanılabilir
   */
  toPersistenceList(entities) {
    if (!this.toPersistence) {
      throw new Error("toPersistence method is not implemented");
    }
    return entities.map((entity) => this.toPersistence(entity));
  }
};

// src/application/AppError.ts
var AppError;
((AppError2) => {
  class UnexpectedError2 {
    constructor(err, details) {
      this.code = "UNEXPECTED_ERROR";
      this.originalError = err;
      this.details = details;
      if (err instanceof Error) {
        this.message = err.message;
      } else if (typeof err === "string") {
        this.message = err;
      } else {
        this.message = "An unexpected error occurred.";
      }
    }
    static create(err, details) {
      const error = new UnexpectedError2(err, details);
      console.error("[UnexpectedError]", {
        message: error.message,
        code: error.code,
        originalError: error.originalError,
        stack: err instanceof Error ? err.stack : void 0
      });
      return Result.fail(error);
    }
    toString() {
      return `[${this.code}] ${this.message}`;
    }
  }
  AppError2.UnexpectedError = UnexpectedError2;
  class ValidationFailure {
    constructor(message, details) {
      this.code = "VALIDATION_ERROR";
      this.message = message || "Validation failed.";
      this.details = details;
    }
    static create(message, details) {
      return Result.fail(new ValidationFailure(message, details));
    }
    toString() {
      return `[${this.code}] ${this.message}`;
    }
  }
  AppError2.ValidationFailure = ValidationFailure;
  class Unauthorized {
    constructor(message) {
      this.code = "UNAUTHORIZED_ERROR";
      this.message = message || "Authentication required.";
    }
    static create(message) {
      return Result.fail(new Unauthorized(message));
    }
    toString() {
      return `[${this.code}] ${this.message}`;
    }
  }
  AppError2.Unauthorized = Unauthorized;
  class NotFound {
    constructor(resource) {
      this.code = "NOT_FOUND_ERROR";
      this.resource = resource;
      this.message = `${resource} not found.`;
    }
    static create(resource) {
      return Result.fail(new NotFound(resource));
    }
    toString() {
      return `[${this.code}] ${this.message}`;
    }
  }
  AppError2.NotFound = NotFound;
  class InvalidOperation {
    constructor(message, details) {
      this.code = "INVALID_OPERATION";
      this.message = message;
      this.details = details;
    }
    static create(message, details) {
      return Result.fail(new InvalidOperation(message, details));
    }
    toString() {
      return `[${this.code}] ${this.message}`;
    }
  }
  AppError2.InvalidOperation = InvalidOperation;
  class Forbidden {
    constructor(message, details) {
      this.code = "FORBIDDEN";
      this.message = message;
      this.details = details;
    }
    static create(message, details) {
      return Result.fail(new Forbidden(message, details));
    }
    toString() {
      return `[${this.code}] ${this.message}`;
    }
  }
  AppError2.Forbidden = Forbidden;
})(AppError || (AppError = {}));

// src/application/dto/ApiResponse.ts
var ApiResponse = class {
  /**
   * Create success response
   */
  static success(data, message = "Operation successful", code = "SUCCESS") {
    return {
      success: true,
      code,
      message,
      data,
      errors: null,
      meta: this.createMeta()
    };
  }
  /**
   * Create error response
   */
  static error(message, code = "ERROR", errors) {
    return {
      success: false,
      code,
      message,
      data: null,
      errors: errors || [{
        code,
        message
      }],
      meta: this.createMeta()
    };
  }
  /**
   * Create validation error response
   */
  static validationError(errors, message = "Validation failed") {
    return {
      success: false,
      code: "VALIDATION_ERROR",
      message,
      data: null,
      errors,
      meta: this.createMeta()
    };
  }
  /**
   * Create from Result monad
   */
  static fromResult(result, successMessage, successCode, errorCode) {
    if (result.isSuccess) {
      return this.success(
        result.getValue(),
        successMessage || "Operation successful",
        successCode || "SUCCESS"
      );
    } else {
      return this.error(
        result.error,
        errorCode || "ERROR"
      );
    }
  }
  /**
   * Create paginated response
   */
  static paginated(data, page, limit, total, message = "Data retrieved successfully", code = "SUCCESS") {
    const totalPages = Math.ceil(total / limit);
    return {
      success: true,
      code,
      message,
      data,
      errors: null,
      meta: {
        ...this.createMeta(),
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    };
  }
  /**
   * Create not found response
   */
  static notFound(resource = "Resource") {
    return {
      success: false,
      code: "NOT_FOUND",
      message: `${resource} not found`,
      data: null,
      errors: [{
        code: "NOT_FOUND",
        message: `${resource} not found`
      }],
      meta: this.createMeta()
    };
  }
  /**
   * Create unauthorized response
   */
  static unauthorized(message = "Unauthorized access") {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message,
      data: null,
      errors: [{
        code: "UNAUTHORIZED",
        message
      }],
      meta: this.createMeta()
    };
  }
  /**
   * Create forbidden response
   */
  static forbidden(message = "Forbidden access") {
    return {
      success: false,
      code: "FORBIDDEN",
      message,
      data: null,
      errors: [{
        code: "FORBIDDEN",
        message
      }],
      meta: this.createMeta()
    };
  }
  /**
   * Create created response (201)
   */
  static created(data, message = "Resource created successfully", code = "CREATED") {
    return this.success(data, message, code);
  }
  /**
   * Create no content response (204)
   */
  static noContent(message = "Operation completed successfully") {
    return {
      success: true,
      code: "NO_CONTENT",
      message,
      data: null,
      errors: null,
      meta: this.createMeta()
    };
  }
  /**
   * Create metadata
   */
  static createMeta(requestId) {
    return {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      requestId: requestId || this.generateRequestId()
    };
  }
  /**
   * Generate unique request ID
   */
  static generateRequestId() {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * Set request ID (from middleware)
   */
  static withRequestId(response, requestId) {
    return {
      ...response,
      meta: {
        ...response.meta,
        requestId
      }
    };
  }
  /**
   * Set API version
   */
  static withVersion(response, version) {
    return {
      ...response,
      meta: {
        ...response.meta,
        version
      }
    };
  }
};

// src/application/validation/FormValidator.ts
var FormValidator = class {
  constructor() {
    this.errors = {};
  }
  async validate(formData, schema) {
    this.clearErrors();
    let hasErrors = false;
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      const value = formData[fieldName];
      const result = await this.validateField(
        fieldName,
        value,
        fieldSchema.rules,
        formData
      );
      if (result.isFailure) {
        hasErrors = true;
      }
    }
    if (hasErrors) {
      return Result.fail("Form validation failed");
    }
    return Result.ok(true);
  }
  async validateField(fieldName, value, rules, formData) {
    const fieldErrors = [];
    for (const rule of rules) {
      try {
        const result = await rule.validator(value, formData);
        if (result === false) {
          const message = rule.message || `${fieldName} is invalid`;
          fieldErrors.push(message);
        } else if (typeof result === "string") {
          fieldErrors.push(result);
        }
      } catch (error) {
        fieldErrors.push(`${fieldName} validation error: ${error}`);
      }
    }
    if (fieldErrors.length > 0) {
      this.errors[fieldName] = fieldErrors;
      return Result.fail(fieldErrors[0]);
    }
    delete this.errors[fieldName];
    return Result.ok(true);
  }
  getErrors() {
    return { ...this.errors };
  }
  getFieldErrors(fieldName) {
    return this.errors[fieldName] || [];
  }
  getFirstError() {
    for (const [field, messages] of Object.entries(this.errors)) {
      if (messages.length > 0) {
        return {
          field,
          message: messages[0]
        };
      }
    }
    return null;
  }
  clearErrors(fieldName) {
    if (fieldName) {
      delete this.errors[fieldName];
    } else {
      this.errors = {};
    }
  }
  isValid() {
    return Object.keys(this.errors).length === 0;
  }
};

// src/constants/RegexPatterns.ts
var RegexPatterns = {
  // Basit ve genel geçer email kontrolü
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// src/application/validation/ValidationRules.ts
var required = (message) => ({
  name: "required",
  message: message || "This field is required",
  validator: (value) => {
    if (value === null || value === void 0) return false;
    if (typeof value === "string" && value.trim() === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }
});
var email = (message) => ({
  name: "email",
  message: message || "Invalid email address",
  validator: (value) => {
    if (!value) return true;
    return RegexPatterns.EMAIL.test(String(value));
  }
});
var minLength = (min2, message) => ({
  name: "minLength",
  message: message || `Minimum ${min2} characters required`,
  validator: (value) => {
    if (!value) return true;
    return String(value).length >= min2;
  }
});
var maxLength = (max2, message) => ({
  name: "maxLength",
  message: message || `Maximum ${max2} characters allowed`,
  validator: (value) => {
    if (!value) return true;
    return String(value).length <= max2;
  }
});
var min = (minValue, message) => ({
  name: "min",
  message: message || `Minimum value is ${minValue}`,
  validator: (value) => {
    if (value === null || value === void 0) return true;
    return Number(value) >= minValue;
  }
});
var max = (maxValue, message) => ({
  name: "max",
  message: message || `Maximum value is ${maxValue}`,
  validator: (value) => {
    if (value === null || value === void 0) return true;
    return Number(value) <= maxValue;
  }
});
var pattern = (regex, message) => ({
  name: "pattern",
  message: message || "Invalid format",
  validator: (value) => {
    if (!value) return true;
    return regex.test(String(value));
  }
});
var url = (message) => ({
  name: "url",
  message: message || "Invalid URL",
  validator: (value) => {
    if (!value) return true;
    try {
      new URL(String(value));
      return true;
    } catch {
      return false;
    }
  }
});
var phone = (message) => ({
  name: "phone",
  message: message || "Invalid phone number",
  validator: (value) => {
    if (!value) return true;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(String(value)) && String(value).replace(/\D/g, "").length >= 10;
  }
});
var numeric = (message) => ({
  name: "numeric",
  message: message || "Must be a number",
  validator: (value) => {
    if (!value) return true;
    return !isNaN(Number(value));
  }
});
var alpha = (message) => ({
  name: "alpha",
  message: message || "Only letters allowed",
  validator: (value) => {
    if (!value) return true;
    return /^[a-zA-Z]+$/.test(String(value));
  }
});
var alphanumeric = (message) => ({
  name: "alphanumeric",
  message: message || "Only letters and numbers allowed",
  validator: (value) => {
    if (!value) return true;
    return /^[a-zA-Z0-9]+$/.test(String(value));
  }
});
var confirmed = (fieldToMatch, message) => ({
  name: "confirmed",
  message: message || "Fields do not match",
  validator: (value, formData) => {
    if (!formData) return true;
    return value === formData[fieldToMatch];
  }
});
var custom = (fn, message) => ({
  name: "custom",
  message,
  validator: fn
});
var asyncUnique = (checkFn, message) => ({
  name: "asyncUnique",
  message: message || "This value is already taken",
  validator: async (value) => {
    if (!value) return true;
    const isUnique = await checkFn(value);
    return isUnique;
  }
});

// src/application/validation/AdvancedValidationRules.ts
var creditCard = (message) => ({
  name: "creditCard",
  message: message || "Invalid credit card number",
  validator: (value) => {
    if (!value) return true;
    const cleaned = String(value).replace(/\D/g, "");
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  }
});
var iban = (message) => ({
  name: "iban",
  message: message || "Invalid IBAN",
  validator: (value) => {
    if (!value) return true;
    const iban2 = String(value).replace(/\s/g, "").toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban2)) return false;
    if (iban2.length < 15 || iban2.length > 34) return false;
    const rearranged = iban2.slice(4) + iban2.slice(0, 4);
    const numeric2 = rearranged.replace(
      /[A-Z]/g,
      (char) => (char.charCodeAt(0) - 55).toString()
    );
    let remainder = numeric2;
    while (remainder.length > 2) {
      const block = remainder.slice(0, 9);
      remainder = parseInt(block) % 97 + remainder.slice(9);
    }
    return parseInt(remainder) % 97 === 1;
  }
});
var strongPassword = (message) => ({
  name: "strongPassword",
  message: message || "Password must contain uppercase, lowercase, number and special character",
  validator: (value) => {
    if (!value) return true;
    const str = String(value);
    const hasUppercase = /[A-Z]/.test(str);
    const hasLowercase = /[a-z]/.test(str);
    const hasNumber = /\d/.test(str);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(str);
    return hasUppercase && hasLowercase && hasNumber && hasSpecial;
  }
});
var futureDate = (message) => ({
  name: "futureDate",
  message: message || "Date must be in the future",
  validator: (value) => {
    if (!value) return true;
    const date = new Date(value);
    return date > /* @__PURE__ */ new Date();
  }
});
var pastDate = (message) => ({
  name: "pastDate",
  message: message || "Date must be in the past",
  validator: (value) => {
    if (!value) return true;
    const date = new Date(value);
    return date < /* @__PURE__ */ new Date();
  }
});
var minAge = (age, message) => ({
  name: "minAge",
  message: message || `Must be at least ${age} years old`,
  validator: (value) => {
    if (!value) return true;
    const birthDate = new Date(value);
    const today = /* @__PURE__ */ new Date();
    const userAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || monthDiff === 0 && today.getDate() < birthDate.getDate()) {
      return userAge - 1 >= age;
    }
    return userAge >= age;
  }
});
var maxFileSize = (maxSizeMB, message) => ({
  name: "maxFileSize",
  message: message || `File size must be less than ${maxSizeMB}MB`,
  validator: (value) => {
    if (!value) return true;
    if (value instanceof File) {
      return value.size <= maxSizeMB * 1024 * 1024;
    }
    return true;
  }
});
var fileType = (allowedTypes, message) => ({
  name: "fileType",
  message: message || `File type must be one of: ${allowedTypes.join(", ")}`,
  validator: (value) => {
    if (!value) return true;
    if (value instanceof File) {
      return allowedTypes.some((type) => value.type.includes(type));
    }
    return true;
  }
});
var jsonString = (message) => ({
  name: "jsonString",
  message: message || "Invalid JSON format",
  validator: (value) => {
    if (!value) return true;
    try {
      JSON.parse(String(value));
      return true;
    } catch {
      return false;
    }
  }
});
var ipv4 = (message) => ({
  name: "ipv4",
  message: message || "Invalid IPv4 address",
  validator: (value) => {
    if (!value) return true;
    const ipv4Regex = /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/;
    return ipv4Regex.test(String(value));
  }
});
var macAddress = (message) => ({
  name: "macAddress",
  message: message || "Invalid MAC address",
  validator: (value) => {
    if (!value) return true;
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(String(value));
  }
});

// src/utils/deepEqual.ts
function deepEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }
  if (obj1 == null || obj2 == null) {
    return false;
  }
  if (typeof obj1 !== typeof obj2) {
    return false;
  }
  if (typeof obj1 !== "object") {
    return obj1 === obj2;
  }
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    return obj1.every((item, index) => deepEqual(item, obj2[index]));
  }
  if (Array.isArray(obj1) || Array.isArray(obj2)) {
    return false;
  }
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  }
  if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
    return obj1.toString() === obj2.toString();
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }
    if (!deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
}

// src/domain/ValueObject.ts
var ValueObject = class {
  constructor(props) {
    this.props = Object.freeze(props);
  }
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
  equals(vo) {
    if (vo === null || vo === void 0) {
      return false;
    }
    if (vo.props === void 0) {
      return false;
    }
    return deepEqual(this.props, vo.props);
  }
};

// src/domain/UniqueEntityID.ts
var UniqueEntityID = class _UniqueEntityID extends ValueObject {
  constructor(id) {
    super({
      // id !== undefined kontrolü yapıyoruz (0, '', false kabul edilir)
      value: id !== void 0 ? id : _UniqueEntityID.generateId()
    });
  }
  getValue() {
    return this.props.value;
  }
  /**
   * Kriptografik olarak güvenli UUID v4 üretir.
   * Node.js 14.17+ ve tüm modern tarayıcıları destekler.
   */
  static generateId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      return _UniqueEntityID.generateUUIDv4();
    }
    try {
      const nodeCrypto = __require("crypto");
      return nodeCrypto.randomUUID();
    } catch {
      throw new Error(
        "crypto.randomUUID() is not available. Please upgrade to Node.js 14.17+ or use a modern browser."
      );
    }
  }
  /**
   * Manuel UUID v4 üretimi (RFC 4122 uyumlu)
   * crypto.getRandomValues() kullanarak kriptografik güvenli
   */
  static generateUUIDv4() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = bytes[6] & 15 | 64;
    bytes[8] = bytes[8] & 63 | 128;
    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`;
  }
  toString() {
    return String(this.props.value);
  }
  equals(other) {
    if (!other) return false;
    return String(this.props.value) === String(other.props.value);
  }
};

// src/domain/Entity.ts
var isEntity = (v) => {
  return v instanceof Entity;
};
var Entity = class {
  constructor(props, id) {
    this._id = id ? id : new UniqueEntityID();
    this.props = props;
  }
  /**
   * Entity'nin ID'sine erişim (Public getter)
   */
  get id() {
    return this._id;
  }
  /**
   * Entity eşitlik kontrolü (Kimlik bazlı, referans değil)
   */
  equals(object) {
    if (object == null || object == void 0) {
      return false;
    }
    if (this === object) {
      return true;
    }
    if (!isEntity(object)) {
      return false;
    }
    return this._id.equals(object._id);
  }
};

// src/domain/events/DomainEvents.ts
var DomainEvents = class {
  /**
   * Event dinleyici kaydeder (Idempotent)
   * Aynı subscriberId ile tekrar kayıt yapılırsa güncellenir
   */
  static register(callback, eventClassName, subscriberId) {
    if (!this.handlersMap.has(eventClassName)) {
      this.handlersMap.set(eventClassName, /* @__PURE__ */ new Map());
    }
    const subscribers = this.handlersMap.get(eventClassName);
    subscribers.set(subscriberId, callback);
    console.log(
      `[DomainEvents] '${subscriberId}' subscribed to '${eventClassName}'. Total: ${subscribers.size}`
    );
  }
  /**
   * Event dinleyici kaydını siler
   */
  static unregister(eventClassName, subscriberId) {
    if (this.handlersMap.has(eventClassName)) {
      const subscribers = this.handlersMap.get(eventClassName);
      const deleted = subscribers.delete(subscriberId);
      if (deleted) {
        console.log(`[DomainEvents] '${subscriberId}' unsubscribed from '${eventClassName}'`);
      }
      if (subscribers.size === 0) {
        this.handlersMap.delete(eventClassName);
      }
    }
  }
  /**
   * Event'i hemen dispatch eder
   */
  static dispatch(event) {
    const eventClassName = event.constructor.name;
    if (this.handlersMap.has(eventClassName)) {
      const subscribers = this.handlersMap.get(eventClassName);
      for (const [subscriberId, handler] of subscribers.entries()) {
        try {
          handler(event);
        } catch (error) {
          console.error(
            `[DomainEvents] Handler '${subscriberId}' failed for '${eventClassName}':`,
            error
          );
        }
      }
    }
  }
  /**
   * Aggregate'i dispatch listesine ekler
   */
  static markAggregateForDispatch(aggregate) {
    const found = this.markedAggregates.find((a) => a.equals(aggregate));
    if (!found) {
      this.markedAggregates.push(aggregate);
    }
  }
  /**
   * Belirli bir aggregate'in tüm event'lerini dispatch eder
   */
  static dispatchEventsForAggregate(id) {
    const aggregate = this.markedAggregates.find((a) => a["_id"].equals(id));
    if (aggregate) {
      aggregate.domainEvents.forEach((event) => {
        this.dispatch(event);
      });
      aggregate.clearEvents();
      this.markedAggregates = this.markedAggregates.filter((a) => !a.equals(aggregate));
    }
  }
  /**
   * Tüm handler'ları temizler (Test için)
   */
  static clearHandlers() {
    this.handlersMap.clear();
    console.log("[DomainEvents] All handlers cleared");
  }
  /**
   * Bekleyen aggregate'leri temizler (Test için)
   */
  static clearMarkedAggregates() {
    this.markedAggregates = [];
    console.log("[DomainEvents] All marked aggregates cleared");
  }
  /**
   * Hem handler'ları hem aggregate'leri temizler (Test için)
   */
  static clearAll() {
    this.clearHandlers();
    this.clearMarkedAggregates();
  }
  /**
   * Debug için mevcut durumu gösterir
   */
  static getState() {
    return {
      registeredEvents: Array.from(this.handlersMap.keys()),
      subscriberCounts: Array.from(this.handlersMap.entries()).map(([event, subs]) => ({
        event,
        count: subs.size
      })),
      markedAggregatesCount: this.markedAggregates.length
    };
  }
};
// Event adı -> (Subscriber ID -> Handler fonksiyonu)
DomainEvents.handlersMap = /* @__PURE__ */ new Map();
// Dispatch bekleyen aggregate'ler
DomainEvents.markedAggregates = [];

// src/domain/AggregateRoot.ts
var AggregateRoot = class _AggregateRoot extends Entity {
  constructor() {
    super(...arguments);
    this._domainEvents = [];
  }
  /**
   * Logger instance'ını static olarak set eder
   * Application başlangıcında bir kez çağrılmalı
   */
  static setLogger(logger) {
    _AggregateRoot._logger = logger;
  }
  /**
   * Domain event listesini döndürür
   */
  get domainEvents() {
    return this._domainEvents;
  }
  /**
   * Aggregate'e yeni bir domain event ekler
   * Event otomatik olarak dispatch için işaretlenir
   */
  addDomainEvent(domainEvent) {
    this._domainEvents.push(domainEvent);
    DomainEvents.markAggregateForDispatch(this);
    this.logDomainEventAdded(domainEvent);
  }
  /**
   * Tüm domain event'leri temizler
   * Genelde dispatch sonrası çağrılır
   */
  clearEvents() {
    this._domainEvents = [];
  }
  /**
   * Domain event ekleme loglaması (opsiyonel)
   * Logger inject edilmişse çalışır, yoksa sessiz kalır
   */
  logDomainEventAdded(domainEvent) {
    if (_AggregateRoot._logger) {
      const aggregateName = this.constructor.name;
      const eventName = domainEvent.constructor.name;
      _AggregateRoot._logger.debug("Domain event added", {
        aggregate: aggregateName,
        event: eventName,
        aggregateId: this.id.toString()
      });
    }
  }
};

// src/domain/TenantId.ts
var TenantId = class extends UniqueEntityID {
};

// src/domain/common/Email.ts
var Email = class _Email extends ValueObject {
  constructor(props) {
    super(props);
  }
  getValue() {
    return this.props.value;
  }
  static create(emailString) {
    const guardResult = Guard.againstNullOrUndefined(emailString, "email");
    if (guardResult.isFailure) {
      return Result.fail(guardResult.error);
    }
    const formattedEmail = emailString.trim().toLowerCase();
    if (!RegexPatterns.EMAIL.test(formattedEmail)) {
      return Result.fail(
        LocalizationService.t(CoreKeys.VALIDATION.INVALID_EMAIL)
      );
    }
    return Result.ok(new _Email({ value: formattedEmail }));
  }
};

// src/domain/common/PhoneNumber.ts
var PhoneNumber = class _PhoneNumber extends ValueObject {
  constructor(props) {
    super(props);
  }
  /**
   * Get formatted phone number
   */
  getValue() {
    return this.props.value;
  }
  /**
   * Get country code
   */
  getCountryCode() {
    const match = this.props.value.match(/^\+(\d{1,3})/);
    return match ? match[1] : "";
  }
  /**
   * Get number without country code
   */
  getNumber() {
    const code = this.getCountryCode();
    return this.props.value.substring(code.length + 1);
  }
  /**
   * Format for display (with spaces)
   * Example: +90 555 123 45 67
   */
  format() {
    const code = this.getCountryCode();
    const number = this.getNumber();
    if (number.length === 10) {
      return `+${code} ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6, 8)} ${number.substring(8)}`;
    }
    return `+${code} ${number}`;
  }
  /**
   * Create PhoneNumber from string
   * Accepts various formats and normalizes to E.164
   */
  static create(phone2) {
    const guardResult = Guard.againstNullOrUndefined(phone2, "phone");
    if (guardResult.isFailure) {
      return Result.fail(guardResult.error);
    }
    let cleaned = phone2.replace(/[^\d+]/g, "");
    if (!cleaned.startsWith("+")) {
      return Result.fail(
        "Phone number must include country code (start with +)"
      );
    }
    const digitsOnly = cleaned.substring(1);
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return Result.fail(
        "Phone number must be between 10 and 15 digits"
      );
    }
    if (!/^\d+$/.test(digitsOnly)) {
      return Result.fail(
        "Phone number can only contain digits"
      );
    }
    return Result.ok(new _PhoneNumber({ value: cleaned }));
  }
  /**
   * Create from parts (country code + number)
   */
  static fromParts(countryCode, number) {
    const fullNumber = `+${countryCode}${number}`;
    return _PhoneNumber.create(fullNumber);
  }
};

// src/domain/common/Money.ts
var _Money = class _Money extends ValueObject {
  constructor(props) {
    super(props);
  }
  /**
   * Get amount
   */
  getAmount() {
    return this.props.amount;
  }
  /**
   * Get currency code
   */
  getCurrency() {
    return this.props.currency;
  }
  /**
   * Format for display
   * Example: $10.50, €20.00, ₺100.00
   */
  format(locale = "en-US") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: this.props.currency
    }).format(this.props.amount);
  }
  /**
   * Create Money instance
   */
  static create(amount, currency) {
    const guardResult = Guard.combine([
      Guard.againstNullOrUndefined(amount, "amount"),
      Guard.againstNullOrUndefined(currency, "currency")
    ]);
    if (guardResult.isFailure) {
      return Result.fail(guardResult.error);
    }
    if (amount < 0) {
      return Result.fail("Amount cannot be negative");
    }
    const upperCurrency = currency.toUpperCase();
    if (!_Money.CURRENCIES.includes(upperCurrency)) {
      return Result.fail(
        `Currency '${currency}' is not supported. Supported: ${_Money.CURRENCIES.join(", ")}`
      );
    }
    const rounded = Math.round(amount * 100) / 100;
    return Result.ok(new _Money({
      amount: rounded,
      currency: upperCurrency
    }));
  }
  /**
   * Add money (same currency)
   */
  add(other) {
    if (this.props.currency !== other.props.currency) {
      return Result.fail(
        `Cannot add different currencies: ${this.props.currency} and ${other.props.currency}`
      );
    }
    return _Money.create(
      this.props.amount + other.props.amount,
      this.props.currency
    );
  }
  /**
   * Subtract money (same currency)
   */
  subtract(other) {
    if (this.props.currency !== other.props.currency) {
      return Result.fail(
        `Cannot subtract different currencies: ${this.props.currency} and ${other.props.currency}`
      );
    }
    const result = this.props.amount - other.props.amount;
    if (result < 0) {
      return Result.fail("Result cannot be negative");
    }
    return _Money.create(result, this.props.currency);
  }
  /**
   * Multiply by factor
   */
  multiply(factor) {
    if (factor < 0) {
      return Result.fail("Factor cannot be negative");
    }
    return _Money.create(
      this.props.amount * factor,
      this.props.currency
    );
  }
  /**
   * Divide by divisor
   */
  divide(divisor) {
    if (divisor <= 0) {
      return Result.fail("Divisor must be positive");
    }
    return _Money.create(
      this.props.amount / divisor,
      this.props.currency
    );
  }
  /**
   * Compare with another Money
   */
  isGreaterThan(other) {
    if (this.props.currency !== other.props.currency) {
      throw new Error("Cannot compare different currencies");
    }
    return this.props.amount > other.props.amount;
  }
  /**
   * Compare with another Money
   */
  isLessThan(other) {
    if (this.props.currency !== other.props.currency) {
      throw new Error("Cannot compare different currencies");
    }
    return this.props.amount < other.props.amount;
  }
  /**
   * Check if zero
   */
  isZero() {
    return this.props.amount === 0;
  }
  /**
   * Static zero factory
   */
  static zero(currency) {
    return _Money.create(0, currency);
  }
};
// Supported currencies
_Money.CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "TRY",
  "JPY",
  "CNY",
  "CHF",
  "AUD",
  "CAD"
];
var Money = _Money;

// src/domain/common/URL.ts
var URL2 = class _URL extends ValueObject {
  constructor(props) {
    super(props);
  }
  /**
   * Get raw URL string
   */
  getValue() {
    return this.props.value;
  }
  /**
   * Get URL parts
   */
  getParts() {
    const url2 = new globalThis.URL(this.props.value);
    return {
      protocol: url2.protocol,
      hostname: url2.hostname,
      port: url2.port,
      pathname: url2.pathname,
      search: url2.search,
      hash: url2.hash
    };
  }
  /**
   * Get domain
   */
  getDomain() {
    const url2 = new globalThis.URL(this.props.value);
    return url2.hostname;
  }
  /**
   * Get protocol
   */
  getProtocol() {
    const url2 = new globalThis.URL(this.props.value);
    return url2.protocol.replace(":", "");
  }
  /**
   * Is HTTPS?
   */
  isSecure() {
    return this.getProtocol() === "https";
  }
  /**
   * Get query parameters
   */
  getQueryParams() {
    const url2 = new globalThis.URL(this.props.value);
    const params = {};
    url2.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }
  /**
   * Get specific query parameter
   */
  getQueryParam(key) {
    const url2 = new globalThis.URL(this.props.value);
    return url2.searchParams.get(key);
  }
  /**
   * Add query parameter
   */
  withQueryParam(key, value) {
    const url2 = new globalThis.URL(this.props.value);
    url2.searchParams.set(key, value);
    return _URL.create(url2.toString());
  }
  /**
   * Remove query parameter
   */
  withoutQueryParam(key) {
    const url2 = new globalThis.URL(this.props.value);
    url2.searchParams.delete(key);
    return _URL.create(url2.toString());
  }
  /**
   * Create URL from string
   */
  static create(url2) {
    const guardResult = Guard.againstNullOrUndefined(url2, "url");
    if (guardResult.isFailure) {
      return Result.fail(guardResult.error);
    }
    const emptyGuard = Guard.againstEmptyString(url2, "url");
    if (emptyGuard.isFailure) {
      return Result.fail(emptyGuard.error);
    }
    try {
      new globalThis.URL(url2);
      return Result.ok(new _URL({ value: url2 }));
    } catch (error) {
      return Result.fail("Invalid URL format");
    }
  }
  /**
   * Create from parts
   */
  static fromParts(protocol, hostname, pathname, queryParams) {
    let urlString = `${protocol}://${hostname}`;
    if (pathname) {
      urlString += pathname.startsWith("/") ? pathname : `/${pathname}`;
    }
    if (queryParams) {
      const params = new URLSearchParams(queryParams);
      urlString += `?${params.toString()}`;
    }
    return _URL.create(urlString);
  }
};

// src/domain/common/Color.ts
var Color = class _Color extends ValueObject {
  constructor(props) {
    super(props);
  }
  /**
   * Get red component (0-255)
   */
  getRed() {
    return this.props.r;
  }
  /**
   * Get green component (0-255)
   */
  getGreen() {
    return this.props.g;
  }
  /**
   * Get blue component (0-255)
   */
  getBlue() {
    return this.props.b;
  }
  /**
   * Get alpha component (0-1)
   */
  getAlpha() {
    return this.props.a;
  }
  /**
   * To HEX string (#RRGGBB)
   */
  toHex() {
    const r = this.props.r.toString(16).padStart(2, "0");
    const g = this.props.g.toString(16).padStart(2, "0");
    const b = this.props.b.toString(16).padStart(2, "0");
    return `#${r}${g}${b}`.toUpperCase();
  }
  /**
   * To RGB string (rgb(r, g, b))
   */
  toRgb() {
    return `rgb(${this.props.r}, ${this.props.g}, ${this.props.b})`;
  }
  /**
   * To RGBA string (rgba(r, g, b, a))
   */
  toRgba() {
    return `rgba(${this.props.r}, ${this.props.g}, ${this.props.b}, ${this.props.a})`;
  }
  /**
   * To HSL
   */
  toHsl() {
    const r = this.props.r / 255;
    const g = this.props.g / 255;
    const b = this.props.b / 255;
    const max2 = Math.max(r, g, b);
    const min2 = Math.min(r, g, b);
    const l = (max2 + min2) / 2;
    if (max2 === min2) {
      return { h: 0, s: 0, l: Math.round(l * 100) };
    }
    const d = max2 - min2;
    const s = l > 0.5 ? d / (2 - max2 - min2) : d / (max2 + min2);
    let h = 0;
    switch (max2) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }
  /**
   * Lighten color
   */
  lighten(amount) {
    const hsl = this.toHsl();
    const newL = Math.min(100, hsl.l + amount);
    return _Color.fromHsl(hsl.h, hsl.s, newL, this.props.a);
  }
  /**
   * Darken color
   */
  darken(amount) {
    const hsl = this.toHsl();
    const newL = Math.max(0, hsl.l - amount);
    return _Color.fromHsl(hsl.h, hsl.s, newL, this.props.a);
  }
  /**
   * Set opacity
   */
  withOpacity(alpha2) {
    if (alpha2 < 0 || alpha2 > 1) {
      return Result.fail("Alpha must be between 0 and 1");
    }
    return _Color.fromRgba(this.props.r, this.props.g, this.props.b, alpha2);
  }
  /**
   * Create from RGB
   */
  static fromRgb(r, g, b) {
    return _Color.fromRgba(r, g, b, 1);
  }
  /**
   * Create from RGBA
   */
  static fromRgba(r, g, b, a) {
    if (r < 0 || r > 255) return Result.fail("Red must be 0-255");
    if (g < 0 || g > 255) return Result.fail("Green must be 0-255");
    if (b < 0 || b > 255) return Result.fail("Blue must be 0-255");
    if (a < 0 || a > 1) return Result.fail("Alpha must be 0-1");
    return Result.ok(new _Color({
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b),
      a
    }));
  }
  /**
   * Create from HEX (#RRGGBB or #RGB)
   */
  static fromHex(hex) {
    const guardResult = Guard.againstNullOrUndefined(hex, "hex");
    if (guardResult.isFailure) {
      return Result.fail(guardResult.error);
    }
    hex = hex.replace("#", "");
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    if (hex.length !== 6) {
      return Result.fail("Invalid hex color format");
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return Result.fail("Invalid hex color values");
    }
    return _Color.fromRgba(r, g, b, 1);
  }
  /**
   * Create from HSL
   */
  static fromHsl(h, s, l, a = 1) {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p2, q2, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t;
        if (t < 1 / 2) return q2;
        if (t < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t) * 6;
        return p2;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return _Color.fromRgba(
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255),
      a
    );
  }
  /**
   * Predefined colors
   */
  static get WHITE() {
    return new _Color({ r: 255, g: 255, b: 255, a: 1 });
  }
  static get BLACK() {
    return new _Color({ r: 0, g: 0, b: 0, a: 1 });
  }
  static get RED() {
    return new _Color({ r: 255, g: 0, b: 0, a: 1 });
  }
  static get GREEN() {
    return new _Color({ r: 0, g: 255, b: 0, a: 1 });
  }
  static get BLUE() {
    return new _Color({ r: 0, g: 0, b: 255, a: 1 });
  }
  static get TRANSPARENT() {
    return new _Color({ r: 0, g: 0, b: 0, a: 0 });
  }
};

// src/domain/common/DateRange.ts
var DateRange = class _DateRange extends ValueObject {
  constructor(props) {
    super(props);
  }
  /**
   * Get start date
   */
  getStartDate() {
    return new Date(this.props.startDate);
  }
  /**
   * Get end date
   */
  getEndDate() {
    return new Date(this.props.endDate);
  }
  /**
   * Duration in milliseconds
   */
  getDurationMs() {
    return this.props.endDate.getTime() - this.props.startDate.getTime();
  }
  /**
   * Duration in days
   */
  getDurationDays() {
    return Math.floor(this.getDurationMs() / (1e3 * 60 * 60 * 24));
  }
  /**
   * Duration in hours
   */
  getDurationHours() {
    return Math.floor(this.getDurationMs() / (1e3 * 60 * 60));
  }
  /**
   * Duration in minutes
   */
  getDurationMinutes() {
    return Math.floor(this.getDurationMs() / (1e3 * 60));
  }
  /**
   * Contains date?
   */
  contains(date) {
    const time = date.getTime();
    return time >= this.props.startDate.getTime() && time <= this.props.endDate.getTime();
  }
  /**
   * Overlaps with another range?
   */
  overlaps(other) {
    return this.props.startDate <= other.props.endDate && this.props.endDate >= other.props.startDate;
  }
  /**
   * Is before another range?
   */
  isBefore(other) {
    return this.props.endDate < other.props.startDate;
  }
  /**
   * Is after another range?
   */
  isAfter(other) {
    return this.props.startDate > other.props.endDate;
  }
  /**
   * Extend range
   */
  extend(days) {
    const newEndDate = new Date(this.props.endDate);
    newEndDate.setDate(newEndDate.getDate() + days);
    return _DateRange.create(this.props.startDate, newEndDate);
  }
  /**
   * Split range into chunks
   */
  splitIntoDays() {
    const dates = [];
    const current = new Date(this.props.startDate);
    while (current <= this.props.endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }
  /**
   * Format range
   */
  format(separator = " - ") {
    const start = this.props.startDate.toLocaleDateString();
    const end = this.props.endDate.toLocaleDateString();
    return `${start}${separator}${end}`;
  }
  /**
   * Create DateRange
   */
  static create(startDate, endDate) {
    const startGuard = Guard.againstNullOrUndefined(startDate, "startDate");
    if (startGuard.isFailure) {
      return Result.fail(startGuard.error);
    }
    const endGuard = Guard.againstNullOrUndefined(endDate, "endDate");
    if (endGuard.isFailure) {
      return Result.fail(endGuard.error);
    }
    if (startDate > endDate) {
      return Result.fail("Start date must be before end date");
    }
    return Result.ok(new _DateRange({ startDate, endDate }));
  }
  /**
   * Create from ISO strings
   */
  static fromStrings(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime())) {
        return Result.fail("Invalid start date");
      }
      if (isNaN(end.getTime())) {
        return Result.fail("Invalid end date");
      }
      return _DateRange.create(start, end);
    } catch (error) {
      return Result.fail(`Invalid date format: ${error}`);
    }
  }
  /**
   * Create range for today
   */
  static today() {
    const start = /* @__PURE__ */ new Date();
    start.setHours(0, 0, 0, 0);
    const end = /* @__PURE__ */ new Date();
    end.setHours(23, 59, 59, 999);
    return new _DateRange({ startDate: start, endDate: end });
  }
  /**
   * Create range for this week
   */
  static thisWeek() {
    const now = /* @__PURE__ */ new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return new _DateRange({ startDate: start, endDate: end });
  }
  /**
   * Create range for this month
   */
  static thisMonth() {
    const now = /* @__PURE__ */ new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return new _DateRange({ startDate: start, endDate: end });
  }
  /**
   * Create range for this year
   */
  static thisYear() {
    const now = /* @__PURE__ */ new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), 11, 31);
    end.setHours(23, 59, 59, 999);
    return new _DateRange({ startDate: start, endDate: end });
  }
  /**
   * Last N days
   */
  static lastDays(days) {
    const end = /* @__PURE__ */ new Date();
    end.setHours(23, 59, 59, 999);
    const start = /* @__PURE__ */ new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    return new _DateRange({ startDate: start, endDate: end });
  }
};

// src/infrastructure/notification/enums/NotificationChannel.ts
var NotificationChannel = /* @__PURE__ */ ((NotificationChannel2) => {
  NotificationChannel2["EMAIL"] = "EMAIL";
  NotificationChannel2["SMS"] = "SMS";
  NotificationChannel2["TELEGRAM"] = "TELEGRAM";
  NotificationChannel2["WHATSAPP"] = "WHATSAPP";
  NotificationChannel2["PUSH"] = "PUSH";
  NotificationChannel2["WEBSOCKET"] = "WEBSOCKET";
  return NotificationChannel2;
})(NotificationChannel || {});

// src/infrastructure/middleware/MiddlewareContext.ts
var MiddlewareContext = class {
  constructor(request, response) {
    this.request = request;
    this.response = response;
    this.metadata = /* @__PURE__ */ new Map();
  }
  set(key, value) {
    this.metadata.set(key, value);
  }
  get(key) {
    return this.metadata.get(key);
  }
  has(key) {
    return this.metadata.has(key);
  }
};

// src/infrastructure/middleware/MiddlewarePipeline.ts
var MiddlewareWrapper = class {
  constructor(handler, name) {
    this.handler = handler;
    this.name = name;
  }
  async execute(context, next) {
    return this.handler(context, next);
  }
};
var MiddlewarePipeline = class {
  constructor() {
    this.middlewares = [];
  }
  use(middleware) {
    if (typeof middleware === "function") {
      this.middlewares.push(new MiddlewareWrapper(middleware));
    } else {
      this.middlewares.push(middleware);
    }
    return this;
  }
  async execute(context) {
    let index = 0;
    const dispatch = async () => {
      if (index >= this.middlewares.length) {
        return Result.ok();
      }
      const middleware = this.middlewares[index++];
      try {
        const next = async () => {
          return dispatch();
        };
        return await middleware.execute(context, next);
      } catch (error) {
        return Result.fail(`Middleware error: ${error}`);
      }
    };
    return dispatch();
  }
  count() {
    return this.middlewares.length;
  }
  clear() {
    this.middlewares = [];
  }
};

// src/infrastructure/middleware/CommonMiddlewares.ts
var LoggingMiddleware = class {
  constructor(logger) {
    this.logger = logger;
    this.name = "LoggingMiddleware";
  }
  async execute(context, next) {
    const start = Date.now();
    this.logger.info("Request started", {
      request: context.request
    });
    const result = await next();
    const duration = Date.now() - start;
    if (result.isSuccess) {
      this.logger.info("Request completed", { duration });
    } else {
      this.logger.error("Request failed", {
        error: result.error,
        duration
      });
    }
    return result;
  }
};
var AuthenticationMiddleware = class {
  constructor(validateToken) {
    this.validateToken = validateToken;
    this.name = "AuthenticationMiddleware";
  }
  async execute(context, next) {
    const token = context.request.headers?.authorization?.replace("Bearer ", "");
    if (!token) {
      return Result.fail("No authentication token provided");
    }
    try {
      const user = await this.validateToken(token);
      context.set("user", user);
      context.set("isAuthenticated", true);
      return next();
    } catch (error) {
      return Result.fail(`Authentication failed: ${error}`);
    }
  }
};
var AuthorizationMiddleware = class {
  constructor(requiredRoles) {
    this.requiredRoles = requiredRoles;
    this.name = "AuthorizationMiddleware";
  }
  async execute(context, next) {
    const user = context.get("user");
    if (!user) {
      return Result.fail("User not authenticated");
    }
    const hasRequiredRole = this.requiredRoles.some(
      (role) => user.roles?.includes(role)
    );
    if (!hasRequiredRole) {
      return Result.fail(`Insufficient permissions. Required roles: ${this.requiredRoles.join(", ")}`);
    }
    return next();
  }
};
var RateLimitMiddleware = class {
  constructor(maxRequests = 100, windowMs = 6e4) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.name = "RateLimitMiddleware";
    this.requests = /* @__PURE__ */ new Map();
  }
  async execute(context, next) {
    const clientId = context.request.ip || "unknown";
    const now = Date.now();
    const timestamps = this.requests.get(clientId) || [];
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
    if (validTimestamps.length >= this.maxRequests) {
      return Result.fail("Rate limit exceeded. Please try again later.");
    }
    validTimestamps.push(now);
    this.requests.set(clientId, validTimestamps);
    return next();
  }
};
var ValidationMiddleware = class {
  constructor(validator) {
    this.validator = validator;
    this.name = "ValidationMiddleware";
  }
  async execute(context, next) {
    const requestData = context.request.body;
    const validationResult = this.validator(requestData);
    if (validationResult.isFailure) {
      return Result.fail(`Validation failed: ${validationResult.error}`);
    }
    context.set("validatedData", validationResult.getValue());
    return next();
  }
};
var ErrorHandlingMiddleware = class {
  constructor(logger) {
    this.logger = logger;
    this.name = "ErrorHandlingMiddleware";
  }
  async execute(context, next) {
    try {
      const result = await next();
      if (result.isFailure) {
        this.logger?.error("Request failed", {
          error: result.error,
          request: context.request
        });
        context.response.error = result.error;
        context.response.statusCode = 500;
      }
      return result;
    } catch (error) {
      this.logger?.error("Unexpected error", { error });
      context.response.error = "Internal server error";
      context.response.statusCode = 500;
      return Result.fail(`Unexpected error: ${error}`);
    }
  }
};
var CorsMiddleware = class {
  constructor(allowedOrigins = ["*"], allowedMethods = ["GET", "POST", "PUT", "DELETE"]) {
    this.allowedOrigins = allowedOrigins;
    this.allowedMethods = allowedMethods;
    this.name = "CorsMiddleware";
  }
  async execute(context, next) {
    const response = context.response;
    const request = context.request;
    const origin = request.headers?.origin;
    if (this.allowedOrigins.includes("*") || this.allowedOrigins.includes(origin)) {
      response.headers = response.headers || {};
      response.headers["Access-Control-Allow-Origin"] = origin || "*";
      response.headers["Access-Control-Allow-Methods"] = this.allowedMethods.join(", ");
      response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
    }
    if (request.method === "OPTIONS") {
      response.statusCode = 204;
      return Result.ok();
    }
    return next();
  }
};
var TimeoutMiddleware = class {
  constructor(timeoutMs = 3e4) {
    this.timeoutMs = timeoutMs;
    this.name = "TimeoutMiddleware";
  }
  async execute(context, next) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${this.timeoutMs}ms`));
      }, this.timeoutMs);
    });
    try {
      return await Promise.race([
        next(),
        timeoutPromise
      ]);
    } catch (error) {
      return Result.fail(`${error}`);
    }
  }
};

// src/infrastructure/resilience/ICircuitBreaker.ts
var CircuitState = /* @__PURE__ */ ((CircuitState2) => {
  CircuitState2["Closed"] = "CLOSED";
  CircuitState2["Open"] = "OPEN";
  CircuitState2["HalfOpen"] = "HALF_OPEN";
  return CircuitState2;
})(CircuitState || {});

// src/infrastructure/resilience/CircuitBreaker.ts
var CircuitBreaker = class {
  constructor(options) {
    this.options = options;
    this.state = "CLOSED" /* Closed */;
    this.failures = 0;
    this.successes = 0;
  }
  async execute(fn) {
    if (this.state === "OPEN" /* Open */) {
      if (this.shouldAttemptReset()) {
        this.state = "HALF_OPEN" /* HalfOpen */;
        this.successes = 0;
      } else {
        return Result.fail("Circuit breaker is OPEN");
      }
    }
    try {
      const result = await fn();
      this.onSuccess();
      return Result.ok(result);
    } catch (error) {
      this.onFailure();
      return Result.fail(`Circuit breaker execution failed: ${error}`);
    }
  }
  getState() {
    return this.state;
  }
  getStats() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime
    };
  }
  reset() {
    this.state = "CLOSED" /* Closed */;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = void 0;
    this.nextAttemptTime = void 0;
  }
  onSuccess() {
    this.failures = 0;
    if (this.state === "HALF_OPEN" /* HalfOpen */) {
      this.successes++;
      if (this.successes >= this.options.successThreshold) {
        this.state = "CLOSED" /* Closed */;
        this.successes = 0;
      }
    }
  }
  onFailure() {
    this.failures++;
    this.lastFailureTime = /* @__PURE__ */ new Date();
    if (this.state === "HALF_OPEN" /* HalfOpen */) {
      this.openCircuit();
    } else if (this.failures >= this.options.failureThreshold) {
      this.openCircuit();
    }
  }
  openCircuit() {
    this.state = "OPEN" /* Open */;
    this.nextAttemptTime = new Date(Date.now() + this.options.timeout);
  }
  shouldAttemptReset() {
    if (!this.nextAttemptTime) return false;
    return Date.now() >= this.nextAttemptTime.getTime();
  }
};

// src/infrastructure/resilience/IRateLimiter.ts
var RateLimitAlgorithm = /* @__PURE__ */ ((RateLimitAlgorithm2) => {
  RateLimitAlgorithm2["FixedWindow"] = "FIXED_WINDOW";
  RateLimitAlgorithm2["SlidingWindow"] = "SLIDING_WINDOW";
  RateLimitAlgorithm2["TokenBucket"] = "TOKEN_BUCKET";
  RateLimitAlgorithm2["LeakyBucket"] = "LEAKY_BUCKET";
  return RateLimitAlgorithm2;
})(RateLimitAlgorithm || {});

// src/infrastructure/resilience/RateLimiter.ts
var RateLimiter = class {
  constructor(options) {
    this.options = options;
    this.requests = /* @__PURE__ */ new Map();
  }
  async tryAcquire(key) {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter(
      (ts) => now - ts < this.options.windowMs
    );
    if (validTimestamps.length >= this.options.maxRequests) {
      const oldestTimestamp = validTimestamps[0];
      const resetTime = new Date(oldestTimestamp + this.options.windowMs);
      const retryAfter = Math.ceil((resetTime.getTime() - now) / 1e3);
      const result2 = {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter
      };
      return Result.ok(result2);
    }
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    const result = {
      allowed: true,
      remaining: this.options.maxRequests - validTimestamps.length,
      resetTime: new Date(now + this.options.windowMs)
    };
    return Result.ok(result);
  }
  reset(key) {
    this.requests.delete(key);
  }
  getStats(key) {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter(
      (ts) => now - ts < this.options.windowMs
    );
    return {
      allowed: validTimestamps.length < this.options.maxRequests,
      remaining: this.options.maxRequests - validTimestamps.length,
      resetTime: new Date(now + this.options.windowMs)
    };
  }
};
var TokenBucketRateLimiter = class {
  constructor(options) {
    this.options = options;
    this.buckets = /* @__PURE__ */ new Map();
  }
  async tryAcquire(key) {
    const now = Date.now();
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = {
        tokens: this.options.maxRequests,
        lastRefill: now
      };
      this.buckets.set(key, bucket);
    }
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(
      timePassed / this.options.windowMs * this.options.maxRequests
    );
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(
        this.options.maxRequests,
        bucket.tokens + tokensToAdd
      );
      bucket.lastRefill = now;
    }
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return Result.ok({
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetTime: new Date(now + this.options.windowMs)
      });
    }
    const refillTime = bucket.lastRefill + this.options.windowMs;
    const retryAfter = Math.ceil((refillTime - now) / 1e3);
    return Result.ok({
      allowed: false,
      remaining: 0,
      resetTime: new Date(refillTime),
      retryAfter
    });
  }
  reset(key) {
    this.buckets.delete(key);
  }
  getStats(key) {
    const bucket = this.buckets.get(key);
    const now = Date.now();
    if (!bucket) {
      return {
        allowed: true,
        remaining: this.options.maxRequests,
        resetTime: new Date(now + this.options.windowMs)
      };
    }
    return {
      allowed: bucket.tokens >= 1,
      remaining: Math.floor(bucket.tokens),
      resetTime: new Date(bucket.lastRefill + this.options.windowMs)
    };
  }
};

// src/infrastructure/cache/RedisAdapter.ts
var RedisAdapter = class {
  constructor(client, config) {
    this.hitCount = 0;
    this.missCount = 0;
    this.client = client;
    this.prefix = config?.prefix || "cache:";
    this.defaultTTL = config?.defaultTTL || 3600;
  }
  /**
   * Get full key with prefix
   */
  getKey(key) {
    return `${this.prefix}${key}`;
  }
  /**
   * Serialize value to string
   */
  serialize(value) {
    return JSON.stringify(value);
  }
  /**
   * Deserialize string to value
   */
  deserialize(value) {
    return JSON.parse(value);
  }
  async get(key) {
    try {
      const fullKey = this.getKey(key);
      const value = await this.client.get(fullKey);
      if (value === null) {
        this.missCount++;
        return Result.ok(null);
      }
      this.hitCount++;
      const deserialized = this.deserialize(value);
      return Result.ok(deserialized);
    } catch (error) {
      return Result.fail(`Cache get failed: ${error}`);
    }
  }
  async set(key, value, ttl) {
    try {
      const fullKey = this.getKey(key);
      const serialized = this.serialize(value);
      const expiry = ttl || this.defaultTTL;
      if (expiry > 0) {
        await this.client.setex(fullKey, expiry, serialized);
      } else {
        await this.client.set(fullKey, serialized);
      }
      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache set failed: ${error}`);
    }
  }
  async delete(key) {
    try {
      const fullKey = this.getKey(key);
      await this.client.del(fullKey);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache delete failed: ${error}`);
    }
  }
  async has(key) {
    try {
      const fullKey = this.getKey(key);
      const exists = await this.client.exists(fullKey);
      return Result.ok(exists === 1);
    } catch (error) {
      return Result.fail(`Cache has failed: ${error}`);
    }
  }
  async clear() {
    try {
      const pattern2 = `${this.prefix}*`;
      const keys = await this.client.keys(pattern2);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache clear failed: ${error}`);
    }
  }
  async mget(keys) {
    try {
      const fullKeys = keys.map((k) => this.getKey(k));
      const values = await this.client.mget(...fullKeys);
      const results = values.map((value) => {
        if (value === null) {
          this.missCount++;
          return null;
        }
        this.hitCount++;
        return this.deserialize(value);
      });
      return Result.ok(results);
    } catch (error) {
      return Result.fail(`Cache mget failed: ${error}`);
    }
  }
  async mset(entries, ttl) {
    try {
      const pipeline = this.client.pipeline();
      const expiry = ttl || this.defaultTTL;
      for (const [key, value] of Object.entries(entries)) {
        const fullKey = this.getKey(key);
        const serialized = this.serialize(value);
        if (expiry > 0) {
          pipeline.setex(fullKey, expiry, serialized);
        } else {
          pipeline.set(fullKey, serialized);
        }
      }
      await pipeline.exec();
      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache mset failed: ${error}`);
    }
  }
  async increment(key, amount = 1) {
    try {
      const fullKey = this.getKey(key);
      const value = await this.client.incrby(fullKey, amount);
      return Result.ok(value);
    } catch (error) {
      return Result.fail(`Cache increment failed: ${error}`);
    }
  }
  async decrement(key, amount = 1) {
    try {
      const fullKey = this.getKey(key);
      const value = await this.client.decrby(fullKey, amount);
      return Result.ok(value);
    } catch (error) {
      return Result.fail(`Cache decrement failed: ${error}`);
    }
  }
  async ttl(key) {
    try {
      const fullKey = this.getKey(key);
      const seconds = await this.client.ttl(fullKey);
      return Result.ok(seconds);
    } catch (error) {
      return Result.fail(`Cache ttl failed: ${error}`);
    }
  }
  async expire(key, seconds) {
    try {
      const fullKey = this.getKey(key);
      const result = await this.client.expire(fullKey, seconds);
      return Result.ok(result === 1);
    } catch (error) {
      return Result.fail(`Cache expire failed: ${error}`);
    }
  }
  async keys(pattern2) {
    try {
      const fullPattern = this.getKey(pattern2);
      const keys = await this.client.keys(fullPattern);
      const cleanKeys = keys.map(
        (k) => k.startsWith(this.prefix) ? k.substring(this.prefix.length) : k
      );
      return Result.ok(cleanKeys);
    } catch (error) {
      return Result.fail(`Cache keys failed: ${error}`);
    }
  }
  async stats() {
    try {
      const info = await this.client.info("stats");
      const dbSize = await this.client.dbsize();
      let memory = "N/A";
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      if (memoryMatch) {
        memory = memoryMatch[1];
      }
      const stats = {
        hits: this.hitCount,
        misses: this.missCount,
        keys: dbSize,
        memory
      };
      return Result.ok(stats);
    } catch (error) {
      return Result.fail(`Cache stats failed: ${error}`);
    }
  }
  async disconnect() {
    try {
      await this.client.quit();
      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache disconnect failed: ${error}`);
    }
  }
  /**
   * Get hit rate
   */
  getHitRate() {
    const total = this.hitCount + this.missCount;
    return total === 0 ? 0 : this.hitCount / total;
  }
  /**
   * Reset statistics
   */
  resetStats() {
    this.hitCount = 0;
    this.missCount = 0;
  }
};

// src/infrastructure/cache/InMemoryAdapter.ts
var InMemoryAdapter = class {
  constructor(prefix = "cache:", defaultTTL = 3600) {
    this.cache = /* @__PURE__ */ new Map();
    this.hitCount = 0;
    this.missCount = 0;
    this.prefix = prefix;
    this.defaultTTL = defaultTTL;
    setInterval(() => this.cleanup(), 6e4);
  }
  getKey(key) {
    return `${this.prefix}${key}`;
  }
  isExpired(entry) {
    if (!entry.expiresAt) return false;
    return /* @__PURE__ */ new Date() > entry.expiresAt;
  }
  cleanup() {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }
  async get(key) {
    try {
      const fullKey = this.getKey(key);
      const entry = this.cache.get(fullKey);
      if (!entry) {
        this.missCount++;
        return Result.ok(null);
      }
      if (this.isExpired(entry)) {
        this.cache.delete(fullKey);
        this.missCount++;
        return Result.ok(null);
      }
      this.hitCount++;
      return Result.ok(entry.value);
    } catch (error) {
      return Result.fail(`Cache get failed: ${error}`);
    }
  }
  async set(key, value, ttl) {
    try {
      const fullKey = this.getKey(key);
      const expiry = ttl || this.defaultTTL;
      const entry = {
        value,
        createdAt: /* @__PURE__ */ new Date(),
        expiresAt: expiry > 0 ? new Date(Date.now() + expiry * 1e3) : void 0
      };
      this.cache.set(fullKey, entry);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache set failed: ${error}`);
    }
  }
  async delete(key) {
    try {
      const fullKey = this.getKey(key);
      this.cache.delete(fullKey);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache delete failed: ${error}`);
    }
  }
  async has(key) {
    try {
      const fullKey = this.getKey(key);
      const entry = this.cache.get(fullKey);
      if (!entry) return Result.ok(false);
      if (this.isExpired(entry)) {
        this.cache.delete(fullKey);
        return Result.ok(false);
      }
      return Result.ok(true);
    } catch (error) {
      return Result.fail(`Cache has failed: ${error}`);
    }
  }
  async clear() {
    try {
      for (const key of this.cache.keys()) {
        if (key.startsWith(this.prefix)) {
          this.cache.delete(key);
        }
      }
      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache clear failed: ${error}`);
    }
  }
  async mget(keys) {
    try {
      const results = await Promise.all(
        keys.map((key) => this.get(key))
      );
      const values = results.map((r) => r.isSuccess ? r.getValue() : null);
      return Result.ok(values);
    } catch (error) {
      return Result.fail(`Cache mget failed: ${error}`);
    }
  }
  async mset(entries, ttl) {
    try {
      await Promise.all(
        Object.entries(entries).map(
          ([key, value]) => this.set(key, value, ttl)
        )
      );
      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache mset failed: ${error}`);
    }
  }
  async increment(key, amount = 1) {
    try {
      const current = await this.get(key);
      const value = (current.getValue() || 0) + amount;
      await this.set(key, value);
      return Result.ok(value);
    } catch (error) {
      return Result.fail(`Cache increment failed: ${error}`);
    }
  }
  async decrement(key, amount = 1) {
    try {
      const current = await this.get(key);
      const value = (current.getValue() || 0) - amount;
      await this.set(key, value);
      return Result.ok(value);
    } catch (error) {
      return Result.fail(`Cache decrement failed: ${error}`);
    }
  }
  async ttl(key) {
    try {
      const fullKey = this.getKey(key);
      const entry = this.cache.get(fullKey);
      if (!entry || !entry.expiresAt) {
        return Result.ok(-1);
      }
      const remaining = Math.floor((entry.expiresAt.getTime() - Date.now()) / 1e3);
      return Result.ok(remaining > 0 ? remaining : -2);
    } catch (error) {
      return Result.fail(`Cache ttl failed: ${error}`);
    }
  }
  async expire(key, seconds) {
    try {
      const fullKey = this.getKey(key);
      const entry = this.cache.get(fullKey);
      if (!entry) return Result.ok(false);
      entry.expiresAt = new Date(Date.now() + seconds * 1e3);
      return Result.ok(true);
    } catch (error) {
      return Result.fail(`Cache expire failed: ${error}`);
    }
  }
  async keys(pattern2) {
    try {
      const regex = new RegExp(pattern2.replace("*", ".*"));
      const matchingKeys = [];
      for (const key of this.cache.keys()) {
        if (key.startsWith(this.prefix)) {
          const cleanKey = key.substring(this.prefix.length);
          if (regex.test(cleanKey)) {
            matchingKeys.push(cleanKey);
          }
        }
      }
      return Result.ok(matchingKeys);
    } catch (error) {
      return Result.fail(`Cache keys failed: ${error}`);
    }
  }
  async stats() {
    try {
      let totalSize = 0;
      for (const entry of this.cache.values()) {
        totalSize += JSON.stringify(entry).length;
      }
      const stats = {
        hits: this.hitCount,
        misses: this.missCount,
        keys: this.cache.size,
        memory: `${(totalSize / 1024).toFixed(2)} KB`
      };
      return Result.ok(stats);
    } catch (error) {
      return Result.fail(`Cache stats failed: ${error}`);
    }
  }
  async disconnect() {
    this.cache.clear();
    return Result.ok();
  }
  getHitRate() {
    const total = this.hitCount + this.missCount;
    return total === 0 ? 0 : this.hitCount / total;
  }
  resetStats() {
    this.hitCount = 0;
    this.missCount = 0;
  }
};

// src/infrastructure/websocket/SocketIOServerAdapter.ts
var SocketIOServerAdapter = class {
  constructor(io, config) {
    // Socket.IO Server
    this.clients = /* @__PURE__ */ new Map();
    this.rooms = /* @__PURE__ */ new Map();
    this.handlers = /* @__PURE__ */ new Map();
    this.messagesSent = 0;
    this.messagesReceived = 0;
    this.io = io;
    this.startTime = /* @__PURE__ */ new Date();
    this.setupHandlers();
  }
  /**
   * Setup Socket.IO event handlers
   */
  setupHandlers() {
    this.io.on("connection", (socket) => {
      this.handleConnection(socket);
    });
  }
  /**
   * Handle new client connection
   */
  handleConnection(socket) {
    const clientId = socket.id;
    const client = {
      id: clientId,
      rooms: /* @__PURE__ */ new Set(),
      connectedAt: /* @__PURE__ */ new Date()
    };
    this.clients.set(clientId, client);
    console.log(`[WebSocket] Client connected: ${clientId}`);
    this.setupClientHandlers(socket);
    socket.on("disconnect", () => {
      this.handleDisconnection(clientId);
    });
  }
  /**
   * Setup handlers for client events
   */
  setupClientHandlers(socket) {
    for (const [event, handlers] of this.handlers.entries()) {
      socket.on(event, async (data) => {
        this.messagesReceived++;
        for (const handler of handlers) {
          try {
            await handler(socket.id, data);
          } catch (error) {
            console.error(`[WebSocket] Handler error for event ${event}:`, error);
          }
        }
      });
    }
  }
  /**
   * Handle client disconnection
   */
  handleDisconnection(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      for (const room of client.rooms) {
        this.leaveRoom(clientId, room);
      }
      this.clients.delete(clientId);
      console.log(`[WebSocket] Client disconnected: ${clientId}`);
    }
  }
  async start(port) {
    try {
      this.startTime = /* @__PURE__ */ new Date();
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to start WebSocket server: ${error}`);
    }
  }
  async stop() {
    try {
      this.io.close();
      this.clients.clear();
      this.rooms.clear();
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to stop WebSocket server: ${error}`);
    }
  }
  sendToClient(clientId, event, data) {
    try {
      const socket = this.io.sockets.sockets.get(clientId);
      if (!socket) {
        return Result.fail(`Client ${clientId} not found`);
      }
      socket.emit(event, data);
      this.messagesSent++;
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to send to client: ${error}`);
    }
  }
  broadcast(event, data) {
    try {
      this.io.emit(event, data);
      this.messagesSent += this.clients.size;
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to broadcast: ${error}`);
    }
  }
  broadcastToRoom(room, event, data) {
    try {
      this.io.to(room).emit(event, data);
      const roomClients = this.rooms.get(room);
      if (roomClients) {
        this.messagesSent += roomClients.size;
      }
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to broadcast to room: ${error}`);
    }
  }
  joinRoom(clientId, room) {
    try {
      const socket = this.io.sockets.sockets.get(clientId);
      if (!socket) {
        return Result.fail(`Client ${clientId} not found`);
      }
      const client = this.clients.get(clientId);
      if (client) {
        client.rooms.add(room);
      }
      if (!this.rooms.has(room)) {
        this.rooms.set(room, /* @__PURE__ */ new Set());
      }
      this.rooms.get(room).add(clientId);
      socket.join(room);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to join room: ${error}`);
    }
  }
  leaveRoom(clientId, room) {
    try {
      const socket = this.io.sockets.sockets.get(clientId);
      if (socket) {
        socket.leave(room);
      }
      const client = this.clients.get(clientId);
      if (client) {
        client.rooms.delete(room);
      }
      const roomClients = this.rooms.get(room);
      if (roomClients) {
        roomClients.delete(clientId);
        if (roomClients.size === 0) {
          this.rooms.delete(room);
        }
      }
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to leave room: ${error}`);
    }
  }
  getClients() {
    return Array.from(this.clients.values());
  }
  getRoomClients(room) {
    const roomClients = this.rooms.get(room);
    return roomClients ? Array.from(roomClients) : [];
  }
  disconnectClient(clientId) {
    try {
      const socket = this.io.sockets.sockets.get(clientId);
      if (!socket) {
        return Result.fail(`Client ${clientId} not found`);
      }
      socket.disconnect(true);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to disconnect client: ${error}`);
    }
  }
  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(handler);
    for (const [socketId, socket] of this.io.sockets.sockets) {
      socket.on(event, async (data) => {
        this.messagesReceived++;
        try {
          await handler(socketId, data);
        } catch (error) {
          console.error(`[WebSocket] Handler error for event ${event}:`, error);
        }
      });
    }
  }
  getStats() {
    const uptime = Date.now() - this.startTime.getTime();
    return {
      connectedClients: this.clients.size,
      rooms: this.rooms.size,
      messagesSent: this.messagesSent,
      messagesReceived: this.messagesReceived,
      uptime: Math.floor(uptime / 1e3)
      // seconds
    };
  }
  /**
   * Set client metadata
   */
  setClientMetadata(clientId, metadata) {
    const client = this.clients.get(clientId);
    if (!client) {
      return Result.fail(`Client ${clientId} not found`);
    }
    client.metadata = { ...client.metadata, ...metadata };
    return Result.ok();
  }
  /**
   * Get client metadata
   */
  getClientMetadata(clientId) {
    const client = this.clients.get(clientId);
    if (!client) {
      return Result.fail(`Client ${clientId} not found`);
    }
    return Result.ok(client.metadata);
  }
};

// src/infrastructure/websocket/SocketIOClientAdapter.ts
var SocketIOClientAdapter = class {
  constructor(socket) {
    // Socket.IO Client
    this.url = "";
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.socket = socket;
  }
  async connect(url2) {
    try {
      this.url = url2;
      return new Promise((resolve) => {
        this.socket.on("connect", () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          console.log("[WebSocket Client] Connected to server");
          resolve(Result.ok());
        });
        this.socket.on("disconnect", () => {
          this.connected = false;
          console.log("[WebSocket Client] Disconnected from server");
        });
        this.socket.on("connect_error", (error) => {
          console.error("[WebSocket Client] Connection error:", error);
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            resolve(Result.fail(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
          }
        });
        this.socket.connect();
      });
    } catch (error) {
      return Result.fail(`Failed to connect: ${error}`);
    }
  }
  disconnect() {
    try {
      if (this.socket) {
        this.socket.disconnect();
        this.connected = false;
      }
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to disconnect: ${error}`);
    }
  }
  send(event, data) {
    try {
      if (!this.connected) {
        return Result.fail("Not connected to server");
      }
      this.socket.emit(event, data);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to send message: ${error}`);
    }
  }
  on(event, handler) {
    if (!this.socket) {
      throw new Error("Socket not initialized");
    }
    this.socket.on(event, handler);
  }
  off(event, handler) {
    if (!this.socket) {
      throw new Error("Socket not initialized");
    }
    this.socket.off(event, handler);
  }
  isConnected() {
    return this.connected;
  }
  /**
   * Send with acknowledgment
   */
  async sendWithAck(event, data, timeout = 5e3) {
    try {
      if (!this.connected) {
        return Result.fail("Not connected to server");
      }
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolve(Result.fail("Acknowledgment timeout"));
        }, timeout);
        this.socket.emit(event, data, (response) => {
          clearTimeout(timer);
          resolve(Result.ok(response));
        });
      });
    } catch (error) {
      return Result.fail(`Failed to send with ack: ${error}`);
    }
  }
  /**
   * Join room
   */
  joinRoom(room) {
    return this.send("join-room", { room });
  }
  /**
   * Leave room
   */
  leaveRoom(room) {
    return this.send("leave-room", { room });
  }
};

// src/infrastructure/websocket/NativeWebSocketAdapter.ts
var NativeWebSocketAdapter = class {
  constructor() {
    this.url = "";
    this.connected = false;
    this.eventHandlers = /* @__PURE__ */ new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1e3;
  }
  async connect(url2) {
    try {
      this.url = url2;
      return new Promise((resolve, reject) => {
        this.ws = new WebSocket(url2);
        this.ws.onopen = () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          console.log("[WebSocket Client] Connected to server");
          resolve(Result.ok());
        };
        this.ws.onclose = () => {
          this.connected = false;
          console.log("[WebSocket Client] Disconnected from server");
          this.attemptReconnect();
        };
        this.ws.onerror = (error) => {
          console.error("[WebSocket Client] Error:", error);
          reject(Result.fail("Connection failed"));
        };
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
      });
    } catch (error) {
      return Result.fail(`Failed to connect: ${error}`);
    }
  }
  disconnect() {
    try {
      if (this.ws) {
        this.ws.close();
        this.connected = false;
      }
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to disconnect: ${error}`);
    }
  }
  send(event, data) {
    try {
      if (!this.connected || !this.ws) {
        return Result.fail("Not connected to server");
      }
      const message = JSON.stringify({ event, data });
      this.ws.send(message);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to send message: ${error}`);
    }
  }
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }
  off(event, handler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
  isConnected() {
    return this.connected;
  }
  /**
   * Handle incoming message
   */
  handleMessage(rawData) {
    try {
      const message = JSON.parse(rawData);
      const { event, data } = message;
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.forEach((handler) => {
          try {
            handler(data);
          } catch (error) {
            console.error(`[WebSocket Client] Handler error for event ${event}:`, error);
          }
        });
      }
    } catch (error) {
      console.error("[WebSocket Client] Failed to parse message:", error);
    }
  }
  /**
   * Attempt to reconnect
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[WebSocket Client] Max reconnection attempts reached");
      return;
    }
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`[WebSocket Client] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    setTimeout(() => {
      this.connect(this.url);
    }, delay);
  }
};

// src/infrastructure/storage/LocalStorageAdapter.ts
var LocalStorageAdapter = class {
  constructor(prefix = "app_") {
    this.prefix = prefix;
  }
  getFullKey(key) {
    return `${this.prefix}${key}`;
  }
  setItem(key, value) {
    try {
      const fullKey = this.getFullKey(key);
      const item = {
        value,
        timestamp: Date.now()
      };
      localStorage.setItem(fullKey, JSON.stringify(item));
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to set item: ${error}`);
    }
  }
  getItem(key) {
    try {
      const fullKey = this.getFullKey(key);
      const raw = localStorage.getItem(fullKey);
      if (!raw) {
        return Result.ok(null);
      }
      const item = JSON.parse(raw);
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.removeItem(key);
        return Result.ok(null);
      }
      return Result.ok(item.value);
    } catch (error) {
      return Result.fail(`Failed to get item: ${error}`);
    }
  }
  removeItem(key) {
    try {
      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to remove item: ${error}`);
    }
  }
  clear() {
    try {
      const keysToRemove = this.keys();
      keysToRemove.forEach((key) => {
        localStorage.removeItem(this.getFullKey(key));
      });
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to clear storage: ${error}`);
    }
  }
  hasKey(key) {
    return localStorage.getItem(this.getFullKey(key)) !== null;
  }
  keys() {
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        allKeys.push(key.substring(this.prefix.length));
      }
    }
    return allKeys;
  }
  size() {
    let totalSize = 0;
    this.keys().forEach((key) => {
      const fullKey = this.getFullKey(key);
      const value = localStorage.getItem(fullKey);
      if (value) {
        totalSize += value.length + fullKey.length;
      }
    });
    return totalSize;
  }
  /**
   * Set item with expiration
   */
  setItemWithExpiry(key, value, expiresInMs) {
    try {
      const fullKey = this.getFullKey(key);
      const item = {
        value,
        timestamp: Date.now(),
        expiresAt: Date.now() + expiresInMs
      };
      localStorage.setItem(fullKey, JSON.stringify(item));
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to set item with expiry: ${error}`);
    }
  }
};

// src/infrastructure/database/IUnitOfWork.ts
var TransactionIsolationLevel = /* @__PURE__ */ ((TransactionIsolationLevel2) => {
  TransactionIsolationLevel2["ReadUncommitted"] = "READ_UNCOMMITTED";
  TransactionIsolationLevel2["ReadCommitted"] = "READ_COMMITTED";
  TransactionIsolationLevel2["RepeatableRead"] = "REPEATABLE_READ";
  TransactionIsolationLevel2["Serializable"] = "SERIALIZABLE";
  return TransactionIsolationLevel2;
})(TransactionIsolationLevel || {});

// src/infrastructure/database/BaseUnitOfWork.ts
var BaseUnitOfWork = class {
  constructor() {
    this._isActive = false;
  }
  isActive() {
    return this._isActive;
  }
  async begin() {
    if (this._isActive) {
      return Result.fail("Transaction already active");
    }
    const result = await this.beginTransaction();
    if (result.isSuccess) {
      this._isActive = true;
    }
    return result;
  }
  async commit() {
    if (!this._isActive) {
      return Result.fail("No active transaction");
    }
    const result = await this.commitTransaction();
    this._isActive = false;
    return result;
  }
  async rollback() {
    if (!this._isActive) {
      return Result.fail("No active transaction");
    }
    const result = await this.rollbackTransaction();
    this._isActive = false;
    return result;
  }
  /**
   * Transaction içinde iş yap - auto commit/rollback
   */
  async execute(work) {
    const beginResult = await this.begin();
    if (beginResult.isFailure) {
      return Result.fail(beginResult.error);
    }
    try {
      const workResult = await work();
      if (workResult.isSuccess) {
        const commitResult = await this.commit();
        if (commitResult.isFailure) {
          return Result.fail(`Commit failed: ${commitResult.error}`);
        }
        return workResult;
      } else {
        await this.rollback();
        return workResult;
      }
    } catch (error) {
      await this.rollback();
      return Result.fail(`Transaction failed: ${error}`);
    }
  }
};

// src/infrastructure/database/BaseQueryBuilder.ts
var BaseQueryBuilder = class {
  constructor() {
    this.conditions = [];
    this.orders = [];
    this.selectedFields = [];
    this.groupByFields = [];
  }
  where(field, operator, value) {
    this.conditions.push({ field, operator, value, conjunction: "AND" });
    return this;
  }
  whereRaw(condition, params) {
    return this;
  }
  andWhere(field, operator, value) {
    this.conditions.push({ field, operator, value, conjunction: "AND" });
    return this;
  }
  orWhere(field, operator, value) {
    this.conditions.push({ field, operator, value, conjunction: "OR" });
    return this;
  }
  whereIn(field, values) {
    this.conditions.push({ field, operator: "IN", value: values, conjunction: "AND" });
    return this;
  }
  whereNotIn(field, values) {
    this.conditions.push({ field, operator: "NOT IN", value: values, conjunction: "AND" });
    return this;
  }
  whereBetween(field, min2, max2) {
    this.conditions.push({
      field,
      operator: "BETWEEN",
      value: [min2, max2],
      conjunction: "AND"
    });
    return this;
  }
  whereNull(field) {
    this.conditions.push({ field, operator: "IS NULL", value: null, conjunction: "AND" });
    return this;
  }
  whereNotNull(field) {
    this.conditions.push({ field, operator: "IS NOT NULL", value: null, conjunction: "AND" });
    return this;
  }
  orderBy(field, direction = "ASC") {
    this.orders.push({ field, direction });
    return this;
  }
  limit(count) {
    this.limitValue = count;
    return this;
  }
  offset(count) {
    this.offsetValue = count;
    return this;
  }
  paginate(options) {
    if (options.limit) {
      this.limit(options.limit);
    }
    if (options.offset) {
      this.offset(options.offset);
    }
    if (options.page && options.limit) {
      this.offset((options.page - 1) * options.limit);
    }
    if (options.sortBy) {
      this.orderBy(options.sortBy, options.sortDirection || "ASC");
    }
    return this;
  }
  select(...fields) {
    this.selectedFields = fields;
    return this;
  }
  join(table, leftField, operator, rightField) {
    return this;
  }
  groupBy(...fields) {
    this.groupByFields = fields;
    return this;
  }
  having(field, operator, value) {
    return this;
  }
  clone() {
    const cloned = Object.create(Object.getPrototypeOf(this));
    cloned.conditions = [...this.conditions];
    cloned.orders = [...this.orders];
    cloned.selectedFields = [...this.selectedFields];
    cloned.limitValue = this.limitValue;
    cloned.offsetValue = this.offsetValue;
    cloned.groupByFields = [...this.groupByFields];
    return cloned;
  }
};

// src/infrastructure/database/QueryHelpers.ts
var QueryHelpers = class {
  /**
   * Pagination helper
   */
  static paginate(query, page, pageSize = 10) {
    return query.limit(pageSize).offset((page - 1) * pageSize);
  }
  /**
   * Search helper (LIKE query)
   */
  static search(query, fields, searchTerm) {
    fields.forEach((field, index) => {
      if (index === 0) {
        query.where(field, "LIKE", `%${searchTerm}%`);
      } else {
        query.orWhere(field, "LIKE", `%${searchTerm}%`);
      }
    });
    return query;
  }
  /**
   * Date range helper
   */
  static dateRange(query, field, startDate, endDate) {
    return query.whereBetween(field, startDate, endDate);
  }
  /**
   * Active records helper
   */
  static active(query) {
    return query.where("isActive", "=", true);
  }
  /**
   * Soft delete helper
   */
  static notDeleted(query) {
    return query.whereNull("deletedAt");
  }
};

// src/infrastructure/database/QueryBuilderExtensions.ts
var QueryBuilderExtensions = class {
  /**
   * Full text search
   */
  static search(query, fields, searchTerm) {
    const terms = searchTerm.split(" ").filter(Boolean);
    terms.forEach((term, index) => {
      fields.forEach((field, fieldIndex) => {
        if (index === 0 && fieldIndex === 0) {
          query.where(field, "LIKE", `%${term}%`);
        } else {
          query.orWhere(field, "LIKE", `%${term}%`);
        }
      });
    });
    return query;
  }
  /**
   * Filter by multiple values (OR)
   */
  static filterByAny(query, field, values) {
    if (values.length === 0) return query;
    return query.whereIn(field, values);
  }
  /**
   * Date range filter
   */
  static dateRange(query, field, start, end) {
    return query.whereBetween(field, start, end);
  }
  /**
   * Conditional filter
   */
  static when(query, condition, callback) {
    return condition ? callback(query) : query;
  }
  /**
   * Select distinct
   */
  static distinct(query, fields) {
    return query;
  }
  /**
   * Random order
   */
  static random(query) {
    return query.orderBy("RANDOM()");
  }
  /**
   * Chunk processing
   */
  static async chunk(query, size, callback) {
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
      const result = await query.clone().limit(size).offset(offset).getMany();
      if (result.isSuccess) {
        const items = result.getValue();
        if (items.length === 0) {
          hasMore = false;
        } else {
          await callback(items);
          offset += size;
        }
      } else {
        hasMore = false;
      }
    }
  }
};

// src/infrastructure/events/EventBus.ts
var EventBus = class {
  constructor(options = {}) {
    this.listeners = /* @__PURE__ */ new Map();
    this.onceListeners = /* @__PURE__ */ new Map();
    this.subscriptionIdCounter = 0;
    this.options = {
      maxListeners: 100,
      enableWildcard: false,
      ...options
    };
  }
  on(eventName, handler) {
    this.validateMaxListeners(eventName);
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, /* @__PURE__ */ new Set());
    }
    this.listeners.get(eventName).add(handler);
    const subscriptionId = `sub_${++this.subscriptionIdCounter}`;
    return {
      id: subscriptionId,
      eventName,
      unsubscribe: () => this.off(eventName, handler)
    };
  }
  once(eventName, handler) {
    this.validateMaxListeners(eventName);
    if (!this.onceListeners.has(eventName)) {
      this.onceListeners.set(eventName, /* @__PURE__ */ new Set());
    }
    this.onceListeners.get(eventName).add(handler);
    const subscriptionId = `sub_once_${++this.subscriptionIdCounter}`;
    return {
      id: subscriptionId,
      eventName,
      unsubscribe: () => this.off(eventName, handler)
    };
  }
  off(eventName, handler) {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.delete(handler);
      if (listeners.size === 0) {
        this.listeners.delete(eventName);
      }
    }
    const onceListeners = this.onceListeners.get(eventName);
    if (onceListeners) {
      onceListeners.delete(handler);
      if (onceListeners.size === 0) {
        this.onceListeners.delete(eventName);
      }
    }
  }
  offAll(eventName) {
    if (eventName) {
      this.listeners.delete(eventName);
      this.onceListeners.delete(eventName);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }
  async emit(eventName, data, source) {
    const event = {
      name: eventName,
      data,
      timestamp: /* @__PURE__ */ new Date(),
      source
    };
    try {
      const listeners = this.listeners.get(eventName);
      if (listeners) {
        for (const handler of listeners) {
          try {
            const result = handler(event);
            if (result instanceof Promise) {
              await result;
            }
          } catch (error) {
            if (this.options.onError) {
              this.options.onError(error, event);
            }
          }
        }
      }
      const onceListeners = this.onceListeners.get(eventName);
      if (onceListeners) {
        for (const handler of onceListeners) {
          try {
            const result = handler(event);
            if (result instanceof Promise) {
              await result;
            }
          } catch (error) {
            if (this.options.onError) {
              this.options.onError(error, event);
            }
          }
        }
        this.onceListeners.delete(eventName);
      }
      return Result.ok();
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error, event);
      }
      return Result.fail(`Event emission failed: ${error}`);
    }
  }
  emitSync(eventName, data, source) {
    const event = {
      name: eventName,
      data,
      timestamp: /* @__PURE__ */ new Date(),
      source
    };
    try {
      const listeners = this.listeners.get(eventName);
      if (listeners) {
        for (const handler of listeners) {
          try {
            handler(event);
          } catch (error) {
            if (this.options.onError) {
              this.options.onError(error, event);
            }
          }
        }
      }
      const onceListeners = this.onceListeners.get(eventName);
      if (onceListeners) {
        for (const handler of onceListeners) {
          try {
            handler(event);
          } catch (error) {
            if (this.options.onError) {
              this.options.onError(error, event);
            }
          }
        }
        this.onceListeners.delete(eventName);
      }
      return Result.ok();
    } catch (error) {
      return Result.fail(`Sync event emission failed: ${error}`);
    }
  }
  hasListeners(eventName) {
    return this.listeners.has(eventName) && this.listeners.get(eventName).size > 0 || this.onceListeners.has(eventName) && this.onceListeners.get(eventName).size > 0;
  }
  listenerCount(eventName) {
    const regular = this.listeners.get(eventName)?.size || 0;
    const once = this.onceListeners.get(eventName)?.size || 0;
    return regular + once;
  }
  validateMaxListeners(eventName) {
    const count = this.listenerCount(eventName);
    if (count >= this.options.maxListeners) {
      console.warn(
        `Max listeners (${this.options.maxListeners}) exceeded for event "${eventName}". Possible memory leak?`
      );
    }
  }
  /**
   * Debug: Tüm event'leri listele
   */
  getEventNames() {
    return [
      ...Array.from(this.listeners.keys()),
      ...Array.from(this.onceListeners.keys())
    ].filter((value, index, self) => self.indexOf(value) === index);
  }
};

// src/infrastructure/events/EventTypes.ts
var EventTypes = {
  // User Events
  USER_LOGGED_IN: "user.logged_in",
  USER_LOGGED_OUT: "user.logged_out",
  USER_REGISTERED: "user.registered",
  USER_UPDATED: "user.updated",
  // UI Events (Frontend)
  THEME_CHANGED: "ui.theme_changed",
  LANGUAGE_CHANGED: "ui.language_changed",
  NOTIFICATION_RECEIVED: "ui.notification_received",
  // System Events
  SYSTEM_ERROR: "system.error",
  SYSTEM_WARNING: "system.warning",
  SYSTEM_INFO: "system.info",
  // Data Events
  DATA_LOADED: "data.loaded",
  DATA_SAVED: "data.saved",
  DATA_DELETED: "data.deleted",
  // WebSocket Events (Frontend)
  WS_CONNECTED: "websocket.connected",
  WS_DISCONNECTED: "websocket.disconnected",
  WS_MESSAGE_RECEIVED: "websocket.message_received"
};

// src/infrastructure/di/IContainer.ts
var ServiceLifetime = /* @__PURE__ */ ((ServiceLifetime2) => {
  ServiceLifetime2["Transient"] = "TRANSIENT";
  ServiceLifetime2["Singleton"] = "SINGLETON";
  ServiceLifetime2["Scoped"] = "SCOPED";
  return ServiceLifetime2;
})(ServiceLifetime || {});
var INJECTABLE_METADATA_KEY = /* @__PURE__ */ Symbol("injectable");
var INJECT_METADATA_KEY = /* @__PURE__ */ Symbol("inject");

// src/infrastructure/di/Container.ts
var Container = class _Container {
  constructor(parent) {
    this.services = /* @__PURE__ */ new Map();
    this.singletons = /* @__PURE__ */ new Map();
    this.scopedInstances = /* @__PURE__ */ new Map();
    this.parent = parent;
  }
  registerTransient(token, factory) {
    this.services.set(token, {
      token,
      factory,
      lifetime: "TRANSIENT" /* Transient */
    });
  }
  registerSingleton(token, factory) {
    this.services.set(token, {
      token,
      factory,
      lifetime: "SINGLETON" /* Singleton */
    });
  }
  registerScoped(token, factory) {
    this.services.set(token, {
      token,
      factory,
      lifetime: "SCOPED" /* Scoped */
    });
  }
  registerInstance(token, instance) {
    this.singletons.set(token, instance);
    this.services.set(token, {
      token,
      factory: () => instance,
      lifetime: "SINGLETON" /* Singleton */
    });
  }
  resolve(token) {
    try {
      const instance = this.resolveInternal(token);
      return Result.ok(instance);
    } catch (error) {
      return Result.fail(`Failed to resolve '${String(token)}': ${error}`);
    }
  }
  async resolveAsync(token) {
    try {
      const instance = await this.resolveInternalAsync(token);
      return Result.ok(instance);
    } catch (error) {
      return Result.fail(`Failed to resolve '${String(token)}': ${error}`);
    }
  }
  isRegistered(token) {
    return this.services.has(token) || (this.parent?.isRegistered(token) ?? false);
  }
  clear() {
    this.services.clear();
    this.singletons.clear();
    this.scopedInstances.clear();
  }
  createScope() {
    return new _Container(this);
  }
  resolveInternal(token) {
    const descriptor = this.services.get(token);
    if (!descriptor) {
      if (this.parent) {
        return this.parent.resolveInternal(token);
      }
      throw new Error(`Service '${String(token)}' not registered`);
    }
    switch (descriptor.lifetime) {
      case "SINGLETON" /* Singleton */:
        return this.resolveSingleton(token, descriptor);
      case "SCOPED" /* Scoped */:
        return this.resolveScoped(token, descriptor);
      case "TRANSIENT" /* Transient */:
      default:
        return descriptor.factory();
    }
  }
  async resolveInternalAsync(token) {
    const descriptor = this.services.get(token);
    if (!descriptor) {
      if (this.parent) {
        return this.parent.resolveInternalAsync(token);
      }
      throw new Error(`Service '${String(token)}' not registered`);
    }
    switch (descriptor.lifetime) {
      case "SINGLETON" /* Singleton */:
        return this.resolveSingletonAsync(token, descriptor);
      case "SCOPED" /* Scoped */:
        return this.resolveScopedAsync(token, descriptor);
      case "TRANSIENT" /* Transient */:
      default:
        const result = descriptor.factory();
        return result instanceof Promise ? await result : result;
    }
  }
  resolveSingleton(token, descriptor) {
    if (this.singletons.has(token)) {
      return this.singletons.get(token);
    }
    const instance = descriptor.factory();
    this.singletons.set(token, instance);
    return instance;
  }
  async resolveSingletonAsync(token, descriptor) {
    if (this.singletons.has(token)) {
      return this.singletons.get(token);
    }
    const result = descriptor.factory();
    const instance = result instanceof Promise ? await result : result;
    this.singletons.set(token, instance);
    return instance;
  }
  resolveScoped(token, descriptor) {
    if (this.scopedInstances.has(token)) {
      return this.scopedInstances.get(token);
    }
    const instance = descriptor.factory();
    this.scopedInstances.set(token, instance);
    return instance;
  }
  async resolveScopedAsync(token, descriptor) {
    if (this.scopedInstances.has(token)) {
      return this.scopedInstances.get(token);
    }
    const result = descriptor.factory();
    const instance = result instanceof Promise ? await result : result;
    this.scopedInstances.set(token, instance);
    return instance;
  }
};

// src/infrastructure/di/ServiceTokens.ts
var ServiceTokens = {
  // ============================================
  // CORE INFRASTRUCTURE - Her projede ortak
  // ============================================
  // Logging
  LOGGER: /* @__PURE__ */ Symbol("ILogger"),
  // Configuration
  CONFIG: /* @__PURE__ */ Symbol("IAppConfig"),
  // Events
  EVENT_BUS: /* @__PURE__ */ Symbol("IEventBus"),
  // HTTP
  HTTP_CLIENT: /* @__PURE__ */ Symbol("IHttpClient"),
  SOAP_CLIENT: /* @__PURE__ */ Symbol("ISoapClient"),
  // Database (Backend)
  UNIT_OF_WORK: /* @__PURE__ */ Symbol("IUnitOfWork"),
  TRANSACTION_MANAGER: /* @__PURE__ */ Symbol("ITransactionManager"),
  // Cache
  CACHE: /* @__PURE__ */ Symbol("ICache"),
  // Storage (Frontend)
  LOCAL_STORAGE: /* @__PURE__ */ Symbol("ILocalStorage"),
  SESSION_STORAGE: /* @__PURE__ */ Symbol("ISessionStorage"),
  BROWSER_STORAGE: /* @__PURE__ */ Symbol("IBrowserStorage"),
  // Security
  HASHING_SERVICE: /* @__PURE__ */ Symbol("IHashingService"),
  ENCRYPTION_SERVICE: /* @__PURE__ */ Symbol("IEncryptionService"),
  TOKEN_SERVICE: /* @__PURE__ */ Symbol("ITokenService"),
  // Notifications
  NOTIFICATION_SERVICE: /* @__PURE__ */ Symbol("INotificationService"),
  EMAIL_SERVICE: /* @__PURE__ */ Symbol("IEmailService"),
  SMS_SERVICE: /* @__PURE__ */ Symbol("ISmsService"),
  // Localization
  TRANSLATOR: /* @__PURE__ */ Symbol("ITranslator"),
  LOCALIZATION_SERVICE: /* @__PURE__ */ Symbol("LocalizationService")
};

// src/infrastructure/config/ConfigValidator.ts
var ConfigValidator = class {
  validate(config, schema) {
    const errors = [];
    const validated = {};
    for (const [fieldName, rule] of Object.entries(schema)) {
      const value = config[fieldName];
      const fieldResult = this.validateField(fieldName, value, rule);
      if (fieldResult.isFailure) {
        errors.push({
          field: fieldName,
          value,
          message: fieldResult.error
        });
      } else {
        validated[fieldName] = fieldResult.getValue();
      }
    }
    if (errors.length > 0) {
      const errorMessages = errors.map((e) => `${e.field}: ${e.message}`).join(", ");
      return Result.fail(`Config validation failed: ${errorMessages}`);
    }
    return Result.ok(validated);
  }
  validateField(fieldName, value, rule) {
    if (rule.required) {
      const guardResult = Guard.againstNullOrUndefined(value, fieldName);
      if (guardResult.isFailure) {
        if (rule.default !== void 0) {
          return Result.ok(rule.default);
        }
        return Result.fail(`${fieldName} is required`);
      }
    }
    if ((value === void 0 || value === null) && !rule.required) {
      return Result.ok(rule.default);
    }
    let transformedValue = value;
    if (rule.transform) {
      try {
        transformedValue = rule.transform(value);
      } catch (error) {
        return Result.fail(`${fieldName} transform failed: ${error}`);
      }
    }
    if (rule.type) {
      const typeResult = this.validateType(fieldName, transformedValue, rule.type);
      if (typeResult.isFailure) {
        return typeResult;
      }
      transformedValue = typeResult.getValue();
    }
    if (rule.pattern && typeof transformedValue === "string") {
      if (!rule.pattern.test(transformedValue)) {
        return Result.fail(`${fieldName} does not match required pattern`);
      }
    }
    if (rule.enum && rule.enum.length > 0) {
      if (!rule.enum.includes(transformedValue)) {
        return Result.fail(
          `${fieldName} must be one of: ${rule.enum.join(", ")}`
        );
      }
    }
    if (typeof transformedValue === "number") {
      if (rule.min !== void 0 && transformedValue < rule.min) {
        return Result.fail(`${fieldName} must be at least ${rule.min}`);
      }
      if (rule.max !== void 0 && transformedValue > rule.max) {
        return Result.fail(`${fieldName} must be at most ${rule.max}`);
      }
    }
    if (typeof transformedValue === "string") {
      if (rule.minLength !== void 0 && transformedValue.length < rule.minLength) {
        return Result.fail(
          `${fieldName} must be at least ${rule.minLength} characters`
        );
      }
      if (rule.maxLength !== void 0 && transformedValue.length > rule.maxLength) {
        return Result.fail(
          `${fieldName} must be at most ${rule.maxLength} characters`
        );
      }
    }
    if (rule.validator) {
      const validatorResult = rule.validator(transformedValue);
      if (validatorResult === false) {
        return Result.fail(`${fieldName} failed custom validation`);
      }
      if (typeof validatorResult === "string") {
        return Result.fail(validatorResult);
      }
    }
    return Result.ok(transformedValue);
  }
  validateEnv(schema, env = process.env) {
    const config = {};
    for (const fieldName of Object.keys(schema)) {
      config[fieldName] = env[fieldName];
    }
    return this.validate(config, schema);
  }
  validateType(fieldName, value, type) {
    switch (type) {
      case "string":
        if (typeof value !== "string") {
          return Result.fail(`${fieldName} must be a string`);
        }
        return Result.ok(value);
      case "number":
        const num = Number(value);
        if (isNaN(num)) {
          return Result.fail(`${fieldName} must be a number`);
        }
        return Result.ok(num);
      case "boolean":
        if (typeof value === "boolean") {
          return Result.ok(value);
        }
        const lower = String(value).toLowerCase();
        if (lower === "true" || lower === "1") {
          return Result.ok(true);
        }
        if (lower === "false" || lower === "0") {
          return Result.ok(false);
        }
        return Result.fail(`${fieldName} must be a boolean`);
      case "url":
        try {
          new URL(String(value));
          return Result.ok(String(value));
        } catch {
          return Result.fail(`${fieldName} must be a valid URL`);
        }
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          return Result.fail(`${fieldName} must be a valid email`);
        }
        return Result.ok(String(value));
      case "port":
        const port = Number(value);
        if (isNaN(port) || port < 1 || port > 65535) {
          return Result.fail(`${fieldName} must be a valid port (1-65535)`);
        }
        return Result.ok(port);
      default:
        return Result.ok(value);
    }
  }
};

// src/infrastructure/config/CommonSchemas.ts
var DatabaseConfigSchema = {
  DB_HOST: {
    required: true,
    type: "string",
    description: "Database host"
  },
  DB_PORT: {
    required: true,
    type: "port",
    default: 5432,
    description: "Database port"
  },
  DB_NAME: {
    required: true,
    type: "string",
    minLength: 1,
    description: "Database name"
  },
  DB_USER: {
    required: true,
    type: "string",
    description: "Database user"
  },
  DB_PASSWORD: {
    required: true,
    type: "string",
    minLength: 8,
    description: "Database password"
  },
  DB_SSL: {
    type: "boolean",
    default: false,
    description: "Enable SSL"
  }
};
var ServerConfigSchema = {
  NODE_ENV: {
    required: true,
    enum: ["development", "production", "test", "staging"],
    default: "development",
    description: "Node environment"
  },
  PORT: {
    required: true,
    type: "port",
    default: 3e3,
    description: "Server port"
  },
  HOST: {
    type: "string",
    default: "0.0.0.0",
    description: "Server host"
  },
  BASE_URL: {
    required: true,
    type: "url",
    description: "Base URL"
  }
};
var AuthConfigSchema = {
  JWT_SECRET: {
    required: true,
    type: "string",
    minLength: 32,
    description: "JWT secret key"
  },
  JWT_EXPIRES_IN: {
    type: "string",
    default: "7d",
    description: "JWT expiration time"
  },
  REFRESH_TOKEN_EXPIRES_IN: {
    type: "string",
    default: "30d",
    description: "Refresh token expiration"
  }
};
var EmailConfigSchema = {
  SMTP_HOST: {
    required: true,
    type: "string",
    description: "SMTP host"
  },
  SMTP_PORT: {
    required: true,
    type: "port",
    description: "SMTP port"
  },
  SMTP_USER: {
    required: true,
    type: "email",
    description: "SMTP user email"
  },
  SMTP_PASSWORD: {
    required: true,
    type: "string",
    description: "SMTP password"
  },
  EMAIL_FROM: {
    required: true,
    type: "email",
    description: "Default from email"
  }
};
var AppConfigSchema = {
  ...ServerConfigSchema,
  ...DatabaseConfigSchema,
  ...AuthConfigSchema,
  ...EmailConfigSchema
};

// src/constants/HttpStatus.ts
var HttpStatus = /* @__PURE__ */ ((HttpStatus2) => {
  HttpStatus2[HttpStatus2["OK"] = 200] = "OK";
  HttpStatus2[HttpStatus2["CREATED"] = 201] = "CREATED";
  HttpStatus2[HttpStatus2["ACCEPTED"] = 202] = "ACCEPTED";
  HttpStatus2[HttpStatus2["NO_CONTENT"] = 204] = "NO_CONTENT";
  HttpStatus2[HttpStatus2["BAD_REQUEST"] = 400] = "BAD_REQUEST";
  HttpStatus2[HttpStatus2["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
  HttpStatus2[HttpStatus2["FORBIDDEN"] = 403] = "FORBIDDEN";
  HttpStatus2[HttpStatus2["NOT_FOUND"] = 404] = "NOT_FOUND";
  HttpStatus2[HttpStatus2["CONFLICT"] = 409] = "CONFLICT";
  HttpStatus2[HttpStatus2["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
  HttpStatus2[HttpStatus2["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
  HttpStatus2[HttpStatus2["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
  HttpStatus2[HttpStatus2["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
  return HttpStatus2;
})(HttpStatus || {});

// src/types/AsyncState.ts
var isIdle = (state) => {
  return state.status === "idle";
};
var isLoading = (state) => {
  return state.status === "loading";
};
var isSuccess = (state) => {
  return state.status === "success";
};
var isError = (state) => {
  return state.status === "error";
};
var AsyncState = {
  idle: () => ({ status: "idle" }),
  loading: () => ({ status: "loading" }),
  success: (data) => ({
    status: "success",
    data
  }),
  error: (error) => ({
    status: "error",
    error
  }),
  /**
   * Map data if success
   */
  map: (state, fn) => {
    if (state.status === "success") {
      return AsyncState.success(fn(state.data));
    }
    return state;
  },
  /**
   * Get data or default value
   */
  getOrElse: (state, defaultValue) => {
    return state.status === "success" ? state.data : defaultValue;
  }
};

// src/logic/CancellationToken.ts
var CancellationToken = class _CancellationToken {
  constructor(nativeSignal) {
    this.nativeSignal = nativeSignal;
  }
  // 1. İptal istendi mi diye kontrol eden property
  get isCancellationRequested() {
    return this.nativeSignal ? this.nativeSignal.aborted : false;
  }
  // 2. Native signal'e public erişim (Fetch, Axios vb. için)
  get signal() {
    return this.nativeSignal;
  }
  // 3. İptal istendiyse direkt hata fırlatan metod
  throwIfCancellationRequested() {
    if (this.isCancellationRequested) {
      throw new Error("OperationCanceled");
    }
  }
  // 4. Statik: Hiçbir zaman iptal edilmeyecek boş token
  static get None() {
    return new _CancellationToken();
  }
  // 5. Controller'dan oluşturmak için yardımcı
  static fromAbortSignal(signal) {
    return new _CancellationToken(signal);
  }
};

// src/localization/locales/tr.ts
var tr = {
  // Result
  [CoreKeys.RESULT.SUCCESS_WITH_ERROR]: "Ge\xE7ersiz\u0130\u015Flem: Ba\u015Far\u0131l\u0131 bir sonu\xE7 hata i\xE7eremez.",
  [CoreKeys.RESULT.FAIL_WITHOUT_ERROR]: "Ge\xE7ersiz\u0130\u015Flem: Ba\u015Far\u0131s\u0131z bir sonu\xE7 hata mesaj\u0131 i\xE7ermelidir.",
  [CoreKeys.RESULT.VALUE_ON_ERROR]: "Hatal\u0131 bir sonucun de\u011Feri okunamaz. 'error' \xF6zelli\u011Fini kullan\u0131n.",
  // Guard
  [CoreKeys.GUARD.NULL_OR_UNDEFINED]: "{name} de\u011Feri bo\u015F (null/undefined) olamaz.",
  [CoreKeys.GUARD.EMPTY_STRING]: "{name} de\u011Feri bo\u015F metin olamaz.",
  [CoreKeys.GUARD.AT_LEAST]: "{name} en az {min} karakter uzunlu\u011Funda olmal\u0131d\u0131r",
  [CoreKeys.GUARD.AT_MOST]: "{name} en fazla {max} karakter uzunlu\u011Funda olmal\u0131d\u0131r",
  [CoreKeys.GUARD.RANGE]: "{name} {min} ile {max} karakter aras\u0131nda olmal\u0131d\u0131r",
  [CoreKeys.GUARD.INVALID_PATTERN]: "{name} ge\xE7ersiz bir formata sahip",
  // Domain Errors
  [CoreKeys.ERRORS.VALIDATION]: "Do\u011Frulama hatas\u0131.",
  [CoreKeys.ERRORS.UNAUTHORIZED]: "Oturum a\xE7man\u0131z gerekiyor.",
  [CoreKeys.ERRORS.FORBIDDEN]: "Eri\u015Fim reddedildi.",
  [CoreKeys.ERRORS.NOT_FOUND]: "{resource} bulunamad\u0131.",
  [CoreKeys.ERRORS.CONFLICT]: "Veri \xE7ak\u0131\u015Fmas\u0131 olu\u015Ftu.",
  [CoreKeys.ERRORS.SERVICE_UNAVAILABLE]: "Servis \u015Fu anda kullan\u0131lam\u0131yor.",
  [CoreKeys.ERRORS.NOT_IMPLEMENTED]: "Bu \xF6zellik hen\xFCz tamamlanmad\u0131.",
  [CoreKeys.ERRORS.UNEXPECTED]: "Beklenmeyen bir hata olu\u015Ftu.",
  // Infra Errors
  [CoreKeys.INFRA.NETWORK_ERROR]: "Bir a\u011F hatas\u0131 olu\u015Ftu. L\xFCtfen ba\u011Flant\u0131n\u0131z\u0131 kontrol edin.",
  [CoreKeys.INFRA.TIMEOUT_ERROR]: "\u0130stek zaman a\u015F\u0131m\u0131na u\u011Frad\u0131.",
  [CoreKeys.INFRA.ENCRYPTION_FAILED]: "\u015Eifreleme i\u015Flemi ba\u015Far\u0131s\u0131z oldu.",
  [CoreKeys.INFRA.DECRYPTION_FAILED]: "\u015Eifre \xE7\xF6zme i\u015Flemi ba\u015Far\u0131s\u0131z oldu.",
  [CoreKeys.INFRA.HASHING_FAILED]: "Hashleme i\u015Flemi ba\u015Far\u0131s\u0131z oldu.",
  [CoreKeys.INFRA.INVALID_CIPHER_FORMAT]: "Ge\xE7ersiz \u015Fifreli metin format\u0131.",
  // App & Logic
  [CoreKeys.APP_ERROR.UNEXPECTED]: "Beklenmeyen bir hata olu\u015Ftu.",
  [CoreKeys.VALIDATION.INVALID_EMAIL]: "Ge\xE7ersiz e-posta format\u0131."
};
export {
  AggregateRoot,
  ApiResponse,
  AppConfigSchema,
  AppError,
  ApplicationError,
  AsyncState,
  AuthConfigSchema,
  AuthenticationMiddleware,
  AuthorizationMiddleware,
  BaseQueryBuilder,
  BaseUnitOfWork,
  CancellationToken,
  CircuitBreaker,
  CircuitState,
  Color,
  ConfigValidator,
  ConflictError,
  Container,
  CoreKeys,
  CorsMiddleware,
  DatabaseConfigSchema,
  DateRange,
  DomainEvents,
  Email,
  EmailConfigSchema,
  Entity,
  ErrorHandlingMiddleware,
  EventBus,
  EventTypes,
  ForbiddenError,
  FormValidator,
  Guard,
  HttpStatus,
  INJECTABLE_METADATA_KEY,
  INJECT_METADATA_KEY,
  InMemoryAdapter,
  LocalStorageAdapter,
  LocalizationService,
  LoggingMiddleware,
  Mapper,
  MiddlewareContext,
  MiddlewarePipeline,
  Money,
  NativeWebSocketAdapter,
  NotFoundError,
  NotImplementedError,
  NotificationChannel,
  PermissionDeniedError,
  PhoneNumber,
  QueryBuilderExtensions,
  QueryHelpers,
  RateLimitAlgorithm,
  RateLimitMiddleware,
  RateLimiter,
  RedisAdapter,
  RegexPatterns,
  Result,
  ServerConfigSchema,
  ServiceLifetime,
  ServiceTokens,
  ServiceUnavailableError,
  SocketIOClientAdapter,
  SocketIOServerAdapter,
  TenantId,
  TimeoutMiddleware,
  TokenBucketRateLimiter,
  TransactionIsolationLevel,
  URL2 as URL,
  UnauthorizedError,
  UnexpectedError,
  UniqueEntityID,
  ValidationError,
  ValidationMiddleware,
  ValueObject,
  alpha,
  alphanumeric,
  asyncUnique,
  confirmed,
  creditCard,
  custom,
  deepEqual,
  email,
  en,
  fileType,
  futureDate,
  iban,
  ipv4,
  isError,
  isIdle,
  isLoading,
  isSuccess,
  jsonString,
  macAddress,
  max,
  maxFileSize,
  maxLength,
  min,
  minAge,
  minLength,
  numeric,
  pastDate,
  pattern,
  phone,
  required,
  strongPassword,
  tr,
  url
};
