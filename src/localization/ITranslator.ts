export interface ITranslator {
  translate(key: string, args?: Record<string, any>): string;
}