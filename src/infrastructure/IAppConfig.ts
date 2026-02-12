export interface IAppConfig {
  get(key: string): string;
  getNumber(key: string): number;
  getBoolean(key: string): boolean;
  isProduction(): boolean;
  isDevelopment(): boolean;
}