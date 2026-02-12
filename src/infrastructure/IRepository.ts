import { Result } from "../logic/Result";

export interface IRepository<T> {
  save(entity: T): Promise<Result<void>>;
  delete(id: string | number): Promise<Result<void>>;
  getById(id: string | number): Promise<Result<T>>;
  // Diğer özel sorgular (findByEmail vb.) IUserRepository gibi alt interfacelerde tanımlanır.
}