import { ValueObject } from "../ValueObject";
import { Result } from "../../logic/Result";
import { Guard } from "../../logic/Guard";

interface ColorProps {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Color Value Object
 * RGB/RGBA color manipulation
 */
export class Color extends ValueObject<ColorProps> {
  
  private constructor(props: ColorProps) {
    super(props);
  }

  /**
   * Get red component (0-255)
   */
  public getRed(): number {
    return this.props.r;
  }

  /**
   * Get green component (0-255)
   */
  public getGreen(): number {
    return this.props.g;
  }

  /**
   * Get blue component (0-255)
   */
  public getBlue(): number {
    return this.props.b;
  }

  /**
   * Get alpha component (0-1)
   */
  public getAlpha(): number {
    return this.props.a;
  }

  /**
   * To HEX string (#RRGGBB)
   */
  public toHex(): string {
    const r = this.props.r.toString(16).padStart(2, '0');
    const g = this.props.g.toString(16).padStart(2, '0');
    const b = this.props.b.toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
  }

  /**
   * To RGB string (rgb(r, g, b))
   */
  public toRgb(): string {
    return `rgb(${this.props.r}, ${this.props.g}, ${this.props.b})`;
  }

  /**
   * To RGBA string (rgba(r, g, b, a))
   */
  public toRgba(): string {
    return `rgba(${this.props.r}, ${this.props.g}, ${this.props.b}, ${this.props.a})`;
  }

  /**
   * To HSL
   */
  public toHsl(): { h: number; s: number; l: number } {
    const r = this.props.r / 255;
    const g = this.props.g / 255;
    const b = this.props.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) {
      return { h: 0, s: 0, l: Math.round(l * 100) };
    }

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    let h = 0;
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Lighten color
   */
  public lighten(amount: number): Result<Color> {
    const hsl = this.toHsl();
    const newL = Math.min(100, hsl.l + amount);
    return Color.fromHsl(hsl.h, hsl.s, newL, this.props.a);
  }

  /**
   * Darken color
   */
  public darken(amount: number): Result<Color> {
    const hsl = this.toHsl();
    const newL = Math.max(0, hsl.l - amount);
    return Color.fromHsl(hsl.h, hsl.s, newL, this.props.a);
  }

  /**
   * Set opacity
   */
  public withOpacity(alpha: number): Result<Color> {
    if (alpha < 0 || alpha > 1) {
      return Result.fail('Alpha must be between 0 and 1');
    }
    return Color.fromRgba(this.props.r, this.props.g, this.props.b, alpha);
  }

  /**
   * Create from RGB
   */
  public static fromRgb(r: number, g: number, b: number): Result<Color> {
    return Color.fromRgba(r, g, b, 1);
  }

  /**
   * Create from RGBA
   */
  public static fromRgba(r: number, g: number, b: number, a: number): Result<Color> {
    // Validate
    if (r < 0 || r > 255) return Result.fail('Red must be 0-255');
    if (g < 0 || g > 255) return Result.fail('Green must be 0-255');
    if (b < 0 || b > 255) return Result.fail('Blue must be 0-255');
    if (a < 0 || a > 1) return Result.fail('Alpha must be 0-1');

    return Result.ok(new Color({ 
      r: Math.round(r), 
      g: Math.round(g), 
      b: Math.round(b), 
      a 
    }));
  }

  /**
   * Create from HEX (#RRGGBB or #RGB)
   */
  public static fromHex(hex: string): Result<Color> {
    const guardResult = Guard.againstNullOrUndefined(hex, 'hex');
    if (guardResult.isFailure) {
      return Result.fail<Color>(guardResult.error!);
    }

    // Remove #
    hex = hex.replace('#', '');

    // Expand shorthand (#RGB -> #RRGGBB)
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }

    // Validate
    if (hex.length !== 6) {
      return Result.fail('Invalid hex color format');
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return Result.fail('Invalid hex color values');
    }

    return Color.fromRgba(r, g, b, 1);
  }

  /**
   * Create from HSL
   */
  public static fromHsl(h: number, s: number, l: number, a: number = 1): Result<Color> {
    // Normalize
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return Color.fromRgba(
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255),
      a
    );
  }

  /**
   * Predefined colors
   */
  public static get WHITE(): Color {
    return new Color({ r: 255, g: 255, b: 255, a: 1 });
  }

  public static get BLACK(): Color {
    return new Color({ r: 0, g: 0, b: 0, a: 1 });
  }

  public static get RED(): Color {
    return new Color({ r: 255, g: 0, b: 0, a: 1 });
  }

  public static get GREEN(): Color {
    return new Color({ r: 0, g: 255, b: 0, a: 1 });
  }

  public static get BLUE(): Color {
    return new Color({ r: 0, g: 0, b: 255, a: 1 });
  }

  public static get TRANSPARENT(): Color {
    return new Color({ r: 0, g: 0, b: 0, a: 0 });
  }
}