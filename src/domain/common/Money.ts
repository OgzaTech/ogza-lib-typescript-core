import { ValueObject } from "../ValueObject";
import { Result } from "../../logic/Result";
import { Guard } from "../../logic/Guard";

interface MoneyProps {
  amount: number;
  currency: string;
}

/**
 * Money Value Object
 * Represents monetary value with currency
 * Immutable and type-safe
 */
export class Money extends ValueObject<MoneyProps> {
  
  // Supported currencies
  private static readonly CURRENCIES = [
    'USD', 'EUR', 'GBP', 'TRY', 'JPY', 'CNY', 'CHF', 'AUD', 'CAD'
  ] as const;

  private constructor(props: MoneyProps) {
    super(props);
  }

  /**
   * Get amount
   */
  public getAmount(): number {
    return this.props.amount;
  }

  /**
   * Get currency code
   */
  public getCurrency(): string {
    return this.props.currency;
  }

  /**
   * Format for display
   * Example: $10.50, €20.00, ₺100.00
   */
  public format(locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.props.currency
    }).format(this.props.amount);
  }

  /**
   * Create Money instance
   */
  public static create(amount: number, currency: string): Result<Money> {
    // Guard: null/undefined
    const guardResult = Guard.combine([
      Guard.againstNullOrUndefined(amount, 'amount'),
      Guard.againstNullOrUndefined(currency, 'currency')
    ]);
    
    if (guardResult.isFailure) {
      return Result.fail<Money>(guardResult.error!);
    }

    // Validate: amount cannot be negative
    if (amount < 0) {
      return Result.fail<Money>('Amount cannot be negative');
    }

    // Validate: currency must be supported
    const upperCurrency = currency.toUpperCase();
    if (!Money.CURRENCIES.includes(upperCurrency as any)) {
      return Result.fail<Money>(
        `Currency '${currency}' is not supported. Supported: ${Money.CURRENCIES.join(', ')}`
      );
    }

    // Round to 2 decimal places
    const rounded = Math.round(amount * 100) / 100;

    return Result.ok<Money>(new Money({ 
      amount: rounded, 
      currency: upperCurrency 
    }));
  }

  /**
   * Add money (same currency)
   */
  public add(other: Money): Result<Money> {
    if (this.props.currency !== other.props.currency) {
      return Result.fail<Money>(
        `Cannot add different currencies: ${this.props.currency} and ${other.props.currency}`
      );
    }

    return Money.create(
      this.props.amount + other.props.amount,
      this.props.currency
    );
  }

  /**
   * Subtract money (same currency)
   */
  public subtract(other: Money): Result<Money> {
    if (this.props.currency !== other.props.currency) {
      return Result.fail<Money>(
        `Cannot subtract different currencies: ${this.props.currency} and ${other.props.currency}`
      );
    }

    const result = this.props.amount - other.props.amount;
    if (result < 0) {
      return Result.fail<Money>('Result cannot be negative');
    }

    return Money.create(result, this.props.currency);
  }

  /**
   * Multiply by factor
   */
  public multiply(factor: number): Result<Money> {
    if (factor < 0) {
      return Result.fail<Money>('Factor cannot be negative');
    }

    return Money.create(
      this.props.amount * factor,
      this.props.currency
    );
  }

  /**
   * Divide by divisor
   */
  public divide(divisor: number): Result<Money> {
    if (divisor <= 0) {
      return Result.fail<Money>('Divisor must be positive');
    }

    return Money.create(
      this.props.amount / divisor,
      this.props.currency
    );
  }

  /**
   * Compare with another Money
   */
  public isGreaterThan(other: Money): boolean {
    if (this.props.currency !== other.props.currency) {
      throw new Error('Cannot compare different currencies');
    }
    return this.props.amount > other.props.amount;
  }

  /**
   * Compare with another Money
   */
  public isLessThan(other: Money): boolean {
    if (this.props.currency !== other.props.currency) {
      throw new Error('Cannot compare different currencies');
    }
    return this.props.amount < other.props.amount;
  }

  /**
   * Check if zero
   */
  public isZero(): boolean {
    return this.props.amount === 0;
  }

  /**
   * Static zero factory
   */
  public static zero(currency: string): Result<Money> {
    return Money.create(0, currency);
  }
}