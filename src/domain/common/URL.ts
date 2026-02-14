import { ValueObject } from "../ValueObject";
import { Result } from "../../logic/Result";
import { Guard } from "../../logic/Guard";

interface URLProps {
  value: string;
}

/**
 * URL Value Object
 * URL validation ve manipulation
 */
export class URL extends ValueObject<URLProps> {
  
  private constructor(props: URLProps) {
    super(props);
  }

  /**
   * Get raw URL string
   */
  public getValue(): string {
    return this.props.value;
  }

  /**
   * Get URL parts
   */
  public getParts(): {
    protocol: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
  } {
    const url = new globalThis.URL(this.props.value);
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash
    };
  }

  /**
   * Get domain
   */
  public getDomain(): string {
    const url = new globalThis.URL(this.props.value);
    return url.hostname;
  }

  /**
   * Get protocol
   */
  public getProtocol(): string {
    const url = new globalThis.URL(this.props.value);
    return url.protocol.replace(':', '');
  }

  /**
   * Is HTTPS?
   */
  public isSecure(): boolean {
    return this.getProtocol() === 'https';
  }

  /**
   * Get query parameters
   */
  public getQueryParams(): Record<string, string> {
    const url = new globalThis.URL(this.props.value);
    const params: Record<string, string> = {};
    
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  }

  /**
   * Get specific query parameter
   */
  public getQueryParam(key: string): string | null {
    const url = new globalThis.URL(this.props.value);
    return url.searchParams.get(key);
  }

  /**
   * Add query parameter
   */
  public withQueryParam(key: string, value: string): Result<URL> {
    const url = new globalThis.URL(this.props.value);
    url.searchParams.set(key, value);
    return URL.create(url.toString());
  }

  /**
   * Remove query parameter
   */
  public withoutQueryParam(key: string): Result<URL> {
    const url = new globalThis.URL(this.props.value);
    url.searchParams.delete(key);
    return URL.create(url.toString());
  }

  /**
   * Create URL from string
   */
  public static create(url: string): Result<URL> {
    // Guard: null/undefined
    const guardResult = Guard.againstNullOrUndefined(url, 'url');
    if (guardResult.isFailure) {
      return Result.fail<URL>(guardResult.error!);
    }

    // Guard: empty
    const emptyGuard = Guard.againstEmptyString(url, 'url');
    if (emptyGuard.isFailure) {
      return Result.fail<URL>(emptyGuard.error!);
    }

    // Validate URL
    try {
      new globalThis.URL(url);
      return Result.ok<URL>(new URL({ value: url }));
    } catch (error) {
      return Result.fail<URL>('Invalid URL format');
    }
  }

  /**
   * Create from parts
   */
  public static fromParts(
    protocol: string,
    hostname: string,
    pathname?: string,
    queryParams?: Record<string, string>
  ): Result<URL> {
    let urlString = `${protocol}://${hostname}`;
    
    if (pathname) {
      urlString += pathname.startsWith('/') ? pathname : `/${pathname}`;
    }

    if (queryParams) {
      const params = new URLSearchParams(queryParams);
      urlString += `?${params.toString()}`;
    }

    return URL.create(urlString);
  }
}