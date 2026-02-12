import { ApplicationError } from "./ApplicationError";
import { LocalizationService } from "../../localization/LocalizationService";
import { CoreKeys } from "../../constants/CoreKeys";

export class UnexpectedError extends ApplicationError {
  constructor(message?: string, details?: any) {
    super(
      message || LocalizationService.t(CoreKeys.ERRORS.UNEXPECTED), 
      "UNEXPECTED_ERROR",
      details
    );
  }
}