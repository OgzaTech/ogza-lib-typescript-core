import { CoreKeys } from "../../constants/CoreKeys";

export const en = {
  [CoreKeys.RESULT.SUCCESS_WITH_ERROR]: "InvalidOperation: A result cannot be successful and contain an error",
  [CoreKeys.RESULT.FAIL_WITHOUT_ERROR]: "InvalidOperation: A failing result needs to contain an error message",
  [CoreKeys.RESULT.VALUE_ON_ERROR]: "Can't get the value of an error result. Use 'error' property.",
  [CoreKeys.GUARD.NULL_OR_UNDEFINED]: "{name} is null or undefined",
  [CoreKeys.GUARD.EMPTY_STRING]: "{name} is empty",

  // Domain Errors
  [CoreKeys.ERRORS.VALIDATION]: "Validation failed.",
  [CoreKeys.ERRORS.UNAUTHORIZED]: "Authentication required.",
  [CoreKeys.ERRORS.FORBIDDEN]: "Access denied.",
  [CoreKeys.ERRORS.NOT_FOUND]: "{resource} not found.",
  [CoreKeys.ERRORS.CONFLICT]: "Resource conflict occurred.",
  [CoreKeys.ERRORS.SERVICE_UNAVAILABLE]: "Service is currently unavailable.",
  [CoreKeys.ERRORS.NOT_IMPLEMENTED]: "This feature is not implemented yet.",
  [CoreKeys.ERRORS.UNEXPECTED]: "An unexpected error occurred.",
  // Infra Errors
  [CoreKeys.INFRA.NETWORK_ERROR]: "A network error occurred. Please check your connection.",
  [CoreKeys.INFRA.TIMEOUT_ERROR]: "The request timed out.",
  [CoreKeys.INFRA.ENCRYPTION_FAILED]: "Encryption process failed.",
  [CoreKeys.INFRA.DECRYPTION_FAILED]: "Decryption process failed.",
  [CoreKeys.INFRA.HASHING_FAILED]: "Hashing process failed.",
  [CoreKeys.INFRA.INVALID_CIPHER_FORMAT]: "Invalid cipher text format.",

  // App & Logic
  [CoreKeys.APP_ERROR.UNEXPECTED]: "An unexpected error occurred.",
  [CoreKeys.VALIDATION.INVALID_EMAIL]: "Invalid email format.",
  
};