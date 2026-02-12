import { ApplicationError } from "./ApplicationError";
import { LocalizationService } from "../../localization/LocalizationService";

// 1. ValidationError (Eski BadRequest)
export class ValidationError extends ApplicationError {
  constructor(message?: string, details?: any) {
    super(
      message || LocalizationService.t("VALIDATION_ERROR"), 
      "VALIDATION_ERROR", 
      details
    );
  }
}
