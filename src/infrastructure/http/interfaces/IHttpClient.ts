import { Result } from "../../../logic/Result";
import { IHttpRequest } from "../models/IHttpRequest";
import { IHttpResponse } from "../models/IHttpResponse";

export interface IHttpClient {
  // En genel çağrı metodu
  request<T>(options: IHttpRequest): Promise<Result<IHttpResponse<T>>>;

  // Helper metodlar
  get<T>(url: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<Result<IHttpResponse<T>>>;
  
  post<T>(url: string, body: any, headers?: Record<string, string>): Promise<Result<IHttpResponse<T>>>;
  
  put<T>(url: string, body: any, headers?: Record<string, string>): Promise<Result<IHttpResponse<T>>>;
  
  delete<T>(url: string, headers?: Record<string, string>): Promise<Result<IHttpResponse<T>>>;
}