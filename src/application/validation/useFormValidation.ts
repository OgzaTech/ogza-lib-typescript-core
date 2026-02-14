import { ref, reactive } from 'vue';
import { FormValidator } from './FormValidator';
import { FormSchema } from './IFormValidator';

/**
 * Vue Composable for Form Validation
 * 
 * Usage:
 * const { validate, errors, clearErrors } = useFormValidation(schema);
 */
export function useFormValidation(schema: FormSchema) {
  const validator = new FormValidator();
  const errors = reactive<Record<string, string[]>>({});
  const isValidating = ref(false);

  const validate = async (formData: Record<string, any>) => {
    isValidating.value = true;
    
    const result = await validator.validate(formData, schema);
    
    // Update reactive errors
    Object.keys(errors).forEach(key => delete errors[key]);
    Object.assign(errors, validator.getErrors());
    
    isValidating.value = false;
    
    return result.isSuccess;
  };

  const validateField = async (
    fieldName: string,
    value: any,
    formData?: Record<string, any>
  ) => {
    const fieldSchema = schema[fieldName];
    if (!fieldSchema) return true;

    const result = await validator.validateField(
      fieldName,
      value,
      fieldSchema.rules,
      formData
    );

    // Update reactive errors for this field
    if (errors[fieldName]) {
      delete errors[fieldName];
    }
    
    const fieldErrors = validator.getFieldErrors(fieldName);
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
    }

    return result.isSuccess;
  };

  const clearErrors = (fieldName?: string) => {
    if (fieldName) {
      delete errors[fieldName];
    } else {
      Object.keys(errors).forEach(key => delete errors[key]);
    }
    validator.clearErrors(fieldName);
  };

  const getFirstError = () => {
    return validator.getFirstError();
  };

  return {
    validate,
    validateField,
    errors,
    clearErrors,
    getFirstError,
    isValidating,
    isValid: () => validator.isValid()
  };
}