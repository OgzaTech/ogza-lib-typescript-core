import { Result } from "./Result";
import { CoreKeys } from "../constants/CoreKeys";
import { LocalizationService } from "../localization/LocalizationService";

export interface IGuardArgument {
  argument: any;
  argumentName: string;
}

export type GuardResponse = Result<void>;

export class Guard {
  public static should(rule: boolean, message: string): Result<void> {
    if (!rule) {
      return Result.fail<void>(message);
    }
    return Result.ok<void>();
  }
  
  public static againstNullOrUndefined(argument: any, argumentName: string): GuardResponse {
    if (argument === null || argument === undefined) {
      return Result.fail<void>(
        LocalizationService.t(CoreKeys.GUARD.NULL_OR_UNDEFINED, { name: argumentName })
      );
    }
    return Result.ok<void>();
  }

  public static againstNullOrUndefinedBulk(args: IGuardArgument[]): GuardResponse {
    for (const arg of args) {
      const result = this.againstNullOrUndefined(arg.argument, arg.argumentName);
      if (result.isFailure) return result;
    }
    return Result.ok<void>();
  }

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
  public static combine(results: Result<any>[]): Result<any> {
    for (let result of results) {
      if (result.isFailure) return result;
    }
    return Result.ok();
  }
  public static againstAtLeast(numChars: number, text: string, argumentName: string = "Text"): Result<any> {
    if (text === null || text === undefined) {
        return Result.fail(`${argumentName} is null or undefined`);
    }
    if (text.length < numChars) {
      return Result.fail<any>(`${argumentName} is not at least ${numChars} chars.`);
    }
    return Result.ok<any>();
  }
  public static againstAtMost(numChars: number, text: string, argumentName: string = "Text"): Result<any> {
    if (text === null || text === undefined) {
        return Result.fail(`${argumentName} is null or undefined`);
    }
    if (text.length > numChars) {
      return Result.fail<any>(`${argumentName} is greater than ${numChars} chars.`);
    }
    return Result.ok<any>();
  }
}