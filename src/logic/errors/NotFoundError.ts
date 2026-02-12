import { ApplicationError } from "./ApplicationError";
import { LocalizationService } from "../../localization/LocalizationService";
import { CoreKeys } from "../../constants/CoreKeys";

export class NotFoundError extends ApplicationError {
  constructor(resource: string) {
    super(
      // DÜZELTME: Elle string yazmak yerine CoreKeys kullanıyoruz
      LocalizationService.t(CoreKeys.ERRORS.NOT_FOUND, { resource }), 
      "NOT_FOUND_ERROR"
    );
  }
}