import { ApplicationError } from "./ApplicationError";
import { LocalizationService } from "../../localization/LocalizationService";

export class ConflictError extends ApplicationError {
  constructor(message?: string) {
    super(
      message || LocalizationService.t("RESOURCE_CONFLICT"), 
      "CONFLICT_ERROR"
    );
  }
}