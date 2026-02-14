import { Result } from "../../logic/Result";
import { 
  IFormValidator, 
  FormSchema, 
  FieldRule, 
  FieldError,
  ValidationResult 
} from "./IFormValidator";

/**
 * Form Validator Implementation
 */
export class FormValidator implements IFormValidator {
  private errors: Record<string, string[]> = {};

  async validate(formData: Record<string, any>, schema: FormSchema): Promise<Result<boolean>> {
    this.clearErrors();
    let hasErrors = false;

    // Validate each field
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      const value = formData[fieldName];
      const result = await this.validateField(
        fieldName,
        value,
        fieldSchema.rules,
        formData
      );

      if (result.isFailure) {
        hasErrors = true;
      }
    }

    if (hasErrors) {
      return Result.fail('Form validation failed');
    }

    return Result.ok(true);
  }

  async validateField(
    fieldName: string,
    value: any,
    rules: FieldRule[],
    formData?: Record<string, any>
  ): Promise<Result<boolean>> {
    const fieldErrors: string[] = [];

    for (const rule of rules) {
      try {
        const result = await rule.validator(value, formData);

        if (result === false) {
          // Validation failed
          const message = rule.message || `${fieldName} is invalid`;
          fieldErrors.push(message);
        } else if (typeof result === 'string') {
          // Validation failed with custom message
          fieldErrors.push(result);
        }
        // result === true means validation passed
      } catch (error) {
        fieldErrors.push(`${fieldName} validation error: ${error}`);
      }
    }

    // Store errors
    if (fieldErrors.length > 0) {
      this.errors[fieldName] = fieldErrors;
      return Result.fail(fieldErrors[0]);
    }

    // Clear field errors if validation passed
    delete this.errors[fieldName];
    return Result.ok(true);
  }

  getErrors(): Record<string, string[]> {
    return { ...this.errors };
  }

  getFieldErrors(fieldName: string): string[] {
    return this.errors[fieldName] || [];
  }

  getFirstError(): FieldError | null {
    for (const [field, messages] of Object.entries(this.errors)) {
      if (messages.length > 0) {
        return {
          field,
          message: messages[0]
        };
      }
    }
    return null;
  }

  clearErrors(fieldName?: string): void {
    if (fieldName) {
      delete this.errors[fieldName];
    } else {
      this.errors = {};
    }
  }

  isValid(): boolean {
    return Object.keys(this.errors).length === 0;
  }
}