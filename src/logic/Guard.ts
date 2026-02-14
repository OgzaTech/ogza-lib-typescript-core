import { Result } from "./Result";
import { CoreKeys } from "../constants/CoreKeys";
import { LocalizationService } from "../localization/LocalizationService";

export interface IGuardArgument {
  argument: any;
  argumentName: string;
}

export type GuardResponse = Result<void>;

/**
 * Validasyon guard'ları
 * Tüm metodlar Result<void> döner - başarılı validasyon için ok(), başarısız için fail()
 */
export class Guard {
  
  /**
   * Custom kural kontrolü
   */
  public static should(rule: boolean, message: string): GuardResponse {
    if (!rule) {
      return Result.fail<void>(message);
    }
    return Result.ok<void>();
  }
  
  /**
   * Null veya undefined kontrolü
   */
  public static againstNullOrUndefined(argument: any, argumentName: string): GuardResponse {
    if (argument === null || argument === undefined) {
      return Result.fail<void>(
        LocalizationService.t(CoreKeys.GUARD.NULL_OR_UNDEFINED, { name: argumentName })
      );
    }
    return Result.ok<void>();
  }

  /**
   * Çoklu null/undefined kontrolü
   */
  public static againstNullOrUndefinedBulk(args: IGuardArgument[]): GuardResponse {
    for (const arg of args) {
      const result = this.againstNullOrUndefined(arg.argument, arg.argumentName);
      if (result.isFailure) return result;
    }
    return Result.ok<void>();
  }

  /**
   * Boş string kontrolü
   */
  public static againstEmptyString(argument: any, argumentName: string): GuardResponse {
    const nullCheck = this.againstNullOrUndefined(argument, argumentName);
    if (nullCheck.isFailure) return nullCheck;

    if (typeof argument === 'string' && argument.trim().length === 0) {
      return Result.fail<void>(
        LocalizationService.t(CoreKeys.GUARD.EMPTY_STRING, { name: argumentName })
      );
    }
    return Result.ok<void>();
  }

  /**
   * Minimum karakter uzunluğu kontrolü
   */
  public static againstAtLeast(
    numChars: number, 
    text: string, 
    argumentName: string = "Text"
  ): GuardResponse {
    const nullCheck = this.againstNullOrUndefined(text, argumentName);
    if (nullCheck.isFailure) return nullCheck;

    if (text.length < numChars) {
      return Result.fail<void>(
        LocalizationService.t(CoreKeys.GUARD.AT_LEAST, { 
          name: argumentName, 
          min: numChars.toString() 
        })
      );
    }
    return Result.ok<void>();
  }

  /**
   * Maksimum karakter uzunluğu kontrolü
   */
  public static againstAtMost(
    numChars: number, 
    text: string, 
    argumentName: string = "Text"
  ): GuardResponse {
    const nullCheck = this.againstNullOrUndefined(text, argumentName);
    if (nullCheck.isFailure) return nullCheck;

    if (text.length > numChars) {
      return Result.fail<void>(
        LocalizationService.t(CoreKeys.GUARD.AT_MOST, { 
          name: argumentName, 
          max: numChars.toString() 
        })
      );
    }
    return Result.ok<void>();
  }

  /**
   * Karakter uzunluğu aralığı kontrolü
   */
  public static againstRange(
    minChars: number,
    maxChars: number,
    text: string,
    argumentName: string = "Text"
  ): GuardResponse {
    const nullCheck = this.againstNullOrUndefined(text, argumentName);
    if (nullCheck.isFailure) return nullCheck;

    if (text.length < minChars || text.length > maxChars) {
      return Result.fail<void>(
        LocalizationService.t(CoreKeys.GUARD.RANGE, {
          name: argumentName,
          min: minChars.toString(),
          max: maxChars.toString()
        })
      );
    }
    return Result.ok<void>();
  }

  /**
   * Birden fazla Result'ı birleştirir
   * Herhangi biri başarısız ise ilk hatayı döner
   */
  public static combine(results: Result<any>[]): Result<void> {
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail<void>(result.error!);
      }
    }
    return Result.ok<void>();
  }

  /**
   * Regex pattern kontrolü
   */
  public static againstPattern(
    pattern: RegExp,
    text: string,
    argumentName: string = "Text"
  ): GuardResponse {
    const nullCheck = this.againstNullOrUndefined(text, argumentName);
    if (nullCheck.isFailure) return nullCheck;

    if (!pattern.test(text)) {
      return Result.fail<void>(
        LocalizationService.t(CoreKeys.GUARD.INVALID_PATTERN, { name: argumentName })
      );
    }
    return Result.ok<void>();
  }
}