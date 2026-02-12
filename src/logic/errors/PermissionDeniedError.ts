import { ApplicationError } from "./ApplicationError";
import { LocalizationService } from "../../localization/LocalizationService";

export class PermissionDeniedError extends ApplicationError {
  constructor(message?: string) {
    super(
      message || LocalizationService.t("PERMISSION_DENIED"), 
      "PERMISSION_DENIED_ERROR"
    );
  }
}