import { IRepository } from '../IRepository';
import { Entity } from '../../domain/Entity';
import { UniqueEntityID } from '../../domain/UniqueEntityID';
import { Result } from '../../logic/Result';
import { AppError } from '../../application/AppError';
import { LocalizationService } from '../../localization/LocalizationService';
import { en } from '../../localization/locales/en';

LocalizationService.setLocaleData(en);

// 1. Domain Entity
interface UserProps { name: string; }
class User extends Entity<UserProps> {
  constructor(props: UserProps, id?: UniqueEntityID) { super(props, id); }
}

// 2. Fake Repository Implementasyonu (InMemory Database)
class InMemoryUserRepository implements IRepository<User> {
  private users: User[] = [];

  async save(user: User): Promise<Result<void>> {
    const exists = this.users.find(u => u.equals(user));
    if (!exists) {
      this.users.push(user);
    }
    return Result.ok<void>();
  }

  async delete(id: string | number): Promise<Result<void>> {
    // Basit filtreleme
    this.users = this.users.filter(u => u['_id'].getValue() !== id);
    return Result.ok<void>();
  }

  async getById(id: string | number): Promise<Result<User>> {
    const user = this.users.find(u => u['_id'].toString() === id.toString());
    if (!user) {
      // Burada 404 dönüyoruz.
      // Gerçek projede LocalizationService.t(CoreKeys.NOT_FOUND) kullanırsın
      return Result.fail<User>("User not found");
    }
    return Result.ok<User>(user);
  }
}

// 3. Testler
describe('Repository Interface', () => {
  let repo: IRepository<User>;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
  });

  it('should save and retrieve a user', async () => {
    const newUser = new User({ name: 'Ahmet' });
    await repo.save(newUser);

    const userId = newUser['_id'].toString();
    const found = await repo.getById(userId);

    expect(found.isSuccess).toBe(true);
    expect(found.getValue().props.name).toBe('Ahmet');
  });

  it('should return fail when user not found', async () => {
    const result = await repo.getById('non-existing-id');
    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('User not found');
  });
});