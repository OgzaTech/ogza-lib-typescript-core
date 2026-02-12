import { HttpMethod } from "./HttpMethod";

export interface IHttpRequest {
  url: string;
  method: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}