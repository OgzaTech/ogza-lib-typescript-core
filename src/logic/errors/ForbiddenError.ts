import { ApplicationError } from "./ApplicationError";
import { LocalizationService } from "../../localization/LocalizationService";
import { CoreKeys } from "../../constants/CoreKeys";

// YENİ EKLENEN: ForbiddenError (403)
export class ForbiddenError extends ApplicationError {
  constructor(message?: string) {
    super(
      message || LocalizationService.t(CoreKeys.ERRORS.FORBIDDEN), 
      "FORBIDDEN_ERROR"
    );
  }
}