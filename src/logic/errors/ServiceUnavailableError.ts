import { ApplicationError } from "./ApplicationError";
import { CoreKeys } from "../../constants/CoreKeys";
import { LocalizationService } from "../../localization/LocalizationService";

export class ServiceUnavailableError extends ApplicationError {
  constructor(message?: string) {
    super(
      message || LocalizationService.t(CoreKeys.ERRORS.SERVICE_UNAVAILABLE),
      "SERVICE_UNAVAILABLE_ERROR"
    );
  }
}