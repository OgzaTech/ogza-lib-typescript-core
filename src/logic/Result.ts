import { CoreKeys } from "../constants/CoreKeys";
import { LocalizationService } from "../localization/LocalizationService";

export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error: string | null;
  private _value: T;

  private constructor(isSuccess: boolean, error?: string | null, value?: T) {
    if (isSuccess && error) {
      throw new Error(LocalizationService.t(CoreKeys.RESULT.SUCCESS_WITH_ERROR));
    }
    if (!isSuccess && !error) {
      throw new Error(LocalizationService.t(CoreKeys.RESULT.FAIL_WITHOUT_ERROR));
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error || null;
    this._value = value as T;

    Object.freeze(this);
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error(LocalizationService.t(CoreKeys.RESULT.VALUE_ON_ERROR));
    }
    return this._value;
  }
}