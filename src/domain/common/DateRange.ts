import { ValueObject } from "../ValueObject";
import { Result } from "../../logic/Result";
import { Guard } from "../../logic/Guard";

interface DateRangeProps {
  startDate: Date;
  endDate: Date;
}

/**
 * Date Range Value Object
 * Tarih aralığı validation ve manipulation
 */
export class DateRange extends ValueObject<DateRangeProps> {
  
  private constructor(props: DateRangeProps) {
    super(props);
  }

  /**
   * Get start date
   */
  public getStartDate(): Date {
    return new Date(this.props.startDate);
  }

  /**
   * Get end date
   */
  public getEndDate(): Date {
    return new Date(this.props.endDate);
  }

  /**
   * Duration in milliseconds
   */
  public getDurationMs(): number {
    return this.props.endDate.getTime() - this.props.startDate.getTime();
  }

  /**
   * Duration in days
   */
  public getDurationDays(): number {
    return Math.floor(this.getDurationMs() / (1000 * 60 * 60 * 24));
  }

  /**
   * Duration in hours
   */
  public getDurationHours(): number {
    return Math.floor(this.getDurationMs() / (1000 * 60 * 60));
  }

  /**
   * Duration in minutes
   */
  public getDurationMinutes(): number {
    return Math.floor(this.getDurationMs() / (1000 * 60));
  }

  /**
   * Contains date?
   */
  public contains(date: Date): boolean {
    const time = date.getTime();
    return time >= this.props.startDate.getTime() && 
           time <= this.props.endDate.getTime();
  }

  /**
   * Overlaps with another range?
   */
  public overlaps(other: DateRange): boolean {
    return this.props.startDate <= other.props.endDate && 
           this.props.endDate >= other.props.startDate;
  }

  /**
   * Is before another range?
   */
  public isBefore(other: DateRange): boolean {
    return this.props.endDate < other.props.startDate;
  }

  /**
   * Is after another range?
   */
  public isAfter(other: DateRange): boolean {
    return this.props.startDate > other.props.endDate;
  }

  /**
   * Extend range
   */
  public extend(days: number): Result<DateRange> {
    const newEndDate = new Date(this.props.endDate);
    newEndDate.setDate(newEndDate.getDate() + days);
    return DateRange.create(this.props.startDate, newEndDate);
  }

  /**
   * Split range into chunks
   */
  public splitIntoDays(): Date[] {
    const dates: Date[] = [];
    const current = new Date(this.props.startDate);
    
    while (current <= this.props.endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }

  /**
   * Format range
   */
  public format(separator: string = ' - '): string {
    const start = this.props.startDate.toLocaleDateString();
    const end = this.props.endDate.toLocaleDateString();
    return `${start}${separator}${end}`;
  }

  /**
   * Create DateRange
   */
  public static create(startDate: Date, endDate: Date): Result<DateRange> {
    // Guard
    const startGuard = Guard.againstNullOrUndefined(startDate, 'startDate');
    if (startGuard.isFailure) {
      return Result.fail<DateRange>(startGuard.error!);
    }

    const endGuard = Guard.againstNullOrUndefined(endDate, 'endDate');
    if (endGuard.isFailure) {
      return Result.fail<DateRange>(endGuard.error!);
    }

    // Validate
    if (startDate > endDate) {
      return Result.fail('Start date must be before end date');
    }

    return Result.ok(new DateRange({ startDate, endDate }));
  }

  /**
   * Create from ISO strings
   */
  public static fromStrings(startDate: string, endDate: string): Result<DateRange> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime())) {
        return Result.fail('Invalid start date');
      }

      if (isNaN(end.getTime())) {
        return Result.fail('Invalid end date');
      }

      return DateRange.create(start, end);
    } catch (error) {
      return Result.fail(`Invalid date format: ${error}`);
    }
  }

  /**
   * Create range for today
   */
  public static today(): DateRange {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    return new DateRange({ startDate: start, endDate: end });
  }

  /**
   * Create range for this week
   */
  public static thisWeek(): DateRange {
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return new DateRange({ startDate: start, endDate: end });
  }

  /**
   * Create range for this month
   */
  public static thisMonth(): DateRange {
    const now = new Date();
    
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    
    return new DateRange({ startDate: start, endDate: end });
  }

  /**
   * Create range for this year
   */
  public static thisYear(): DateRange {
    const now = new Date();
    
    const start = new Date(now.getFullYear(), 0, 1);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(now.getFullYear(), 11, 31);
    end.setHours(23, 59, 59, 999);
    
    return new DateRange({ startDate: start, endDate: end });
  }

  /**
   * Last N days
   */
  public static lastDays(days: number): DateRange {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    
    return new DateRange({ startDate: start, endDate: end });
  }
}