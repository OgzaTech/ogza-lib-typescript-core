import { ApplicationError } from "./ApplicationError";
import { LocalizationService } from "../../localization/LocalizationService";

export class NotImplementedError extends ApplicationError {
  constructor(methodName?: string) {
    super(
      `Method ${methodName || ''} not implemented.`, 
      "NOT_IMPLEMENTED_ERROR"
    );
  }
}