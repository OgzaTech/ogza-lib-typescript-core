import { CoreKeys } from "../constants/CoreKeys";
import { LocalizationService } from "../localization/LocalizationService";

/**
 * Result Monad Pattern
 * @template T - Başarılı durumda dönen değer tipi
 * @template E - Hata durumunda dönen hata tipi (varsayılan: string)
 */
export class Result<T, E = string> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly error: E | null;
  private readonly _value: T | undefined;

  private constructor(isSuccess: boolean, error?: E | null, value?: T) {
    if (isSuccess && error) {
      throw new Error(LocalizationService.t(CoreKeys.RESULT.SUCCESS_WITH_ERROR));
    }
    if (!isSuccess && !error) {
      throw new Error(LocalizationService.t(CoreKeys.RESULT.FAIL_WITHOUT_ERROR));
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error || null;
    this._value = value;

    Object.freeze(this);
  }

  /**
   * Başarılı sonuç oluşturur
   */
  public static ok<U>(value?: U): Result<U, never> {
    return new Result<U, never>(true, null, value);
  }

  /**
   * Başarısız sonuç oluşturur
   */
  public static fail<U, E = string>(error: E): Result<U, E> {
    return new Result<U, E>(false, error);
  }

  /**
   * Değeri döner. Hata durumunda exception fırlatır.
   */
  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error(LocalizationService.t(CoreKeys.RESULT.VALUE_ON_ERROR));
    }
    return this._value!;
  }

  /**
   * Hatayı döner. Başarılı durumda null döner.
   */
  public getError(): E | null {
    return this.error;
  }

  /**
   * Type-safe değer erişimi (Option pattern)
   */
  public getValueOrDefault(defaultValue: T): T {
    return this.isSuccess ? this._value! : defaultValue;
  }

  /**
   * Functional map - Başarılı durumda değeri transform eder
   */
  public map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFailure) {
      return Result.fail<U, E>(this.error!);
    }
    return Result.ok<U>(fn(this._value!));
  }

  /**
   * Functional flatMap/bind - Başarılı durumda Result dönen fonksiyon uygular
   */
  public flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isFailure) {
      return Result.fail<U, E>(this.error!);
    }
    return fn(this._value!);
  }
}