import { Result } from "../../../logic/Result";

export interface ISoapClient {
  call<T>(methodName: string, args: Record<string, any>): Promise<Result<T>>;
  addHeader(name: string, content: any): void;
}