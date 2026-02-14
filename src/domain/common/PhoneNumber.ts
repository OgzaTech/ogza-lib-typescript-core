import { ValueObject } from "../ValueObject";
import { Result } from "../../logic/Result";
import { Guard } from "../../logic/Guard";

interface PhoneNumberProps {
  value: string;
}

/**
 * Phone Number Value Object
 * E.164 format: +[country code][number]
 * Example: +905551234567, +12125551234
 */
export class PhoneNumber extends ValueObject<PhoneNumberProps> {
  
  private constructor(props: PhoneNumberProps) {
    super(props);
  }

  /**
   * Get formatted phone number
   */
  public getValue(): string {
    return this.props.value;
  }

  /**
   * Get country code
   */
  public getCountryCode(): string {
    // Extract country code (first 1-3 digits after +)
    const match = this.props.value.match(/^\+(\d{1,3})/);
    return match ? match[1] : '';
  }

  /**
   * Get number without country code
   */
  public getNumber(): string {
    const code = this.getCountryCode();
    return this.props.value.substring(code.length + 1);
  }

  /**
   * Format for display (with spaces)
   * Example: +90 555 123 45 67
   */
  public format(): string {
    const code = this.getCountryCode();
    const number = this.getNumber();
    
    // Format based on length
    if (number.length === 10) {
      // Turkish format: +90 555 123 45 67
      return `+${code} ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6, 8)} ${number.substring(8)}`;
    }
    
    // Default: +XX XXX XXX XXXX
    return `+${code} ${number}`;
  }

  /**
   * Create PhoneNumber from string
   * Accepts various formats and normalizes to E.164
   */
  public static create(phone: string): Result<PhoneNumber> {
    // Guard: null/undefined
    const guardResult = Guard.againstNullOrUndefined(phone, 'phone');
    if (guardResult.isFailure) {
      return Result.fail<PhoneNumber>(guardResult.error!);
    }

    // Normalize: remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If doesn't start with +, assume it's a local number (needs country code)
    if (!cleaned.startsWith('+')) {
      return Result.fail<PhoneNumber>(
        'Phone number must include country code (start with +)'
      );
    }

    // Remove + for digit-only validation
    const digitsOnly = cleaned.substring(1);
    
    // Validate length (E.164: 1-15 digits)
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return Result.fail<PhoneNumber>(
        'Phone number must be between 10 and 15 digits'
      );
    }

    // Validate: only digits
    if (!/^\d+$/.test(digitsOnly)) {
      return Result.fail<PhoneNumber>(
        'Phone number can only contain digits'
      );
    }

    return Result.ok<PhoneNumber>(new PhoneNumber({ value: cleaned }));
  }

  /**
   * Create from parts (country code + number)
   */
  public static fromParts(countryCode: string, number: string): Result<PhoneNumber> {
    const fullNumber = `+${countryCode}${number}`;
    return PhoneNumber.create(fullNumber);
  }
}