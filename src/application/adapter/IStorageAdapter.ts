import { Result } from '../../logic/Result';

export interface IStorageAdapter {
  get<T>(key: string): T | null;
  set(key: string, value: any): void;
  remove(key: string): void;
  clear(): void;
}