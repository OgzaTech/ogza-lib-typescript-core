import { ApplicationError } from "./ApplicationError";
import { LocalizationService } from "../../localization/LocalizationService";
import { CoreKeys } from "../../constants/CoreKeys";

export class UnauthorizedError extends ApplicationError {
  constructor(message?: string) {
    super(
      message || LocalizationService.t(CoreKeys.ERRORS.UNAUTHORIZED),
      "UNAUTHORIZED_ERROR"
    );
  }
}