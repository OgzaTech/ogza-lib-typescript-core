import { IRepository } from '../IRepository';
import { Entity } from '../../domain/Entity';
import { UniqueEntityID } from '../../domain/UniqueEntityID';
import { Result } from '../../logic/Result';
import { LocalizationService } from '../../localization/LocalizationService';
import { en } from '../../localization/locales/en';

LocalizationService.setLocaleData(en);

interface UserProps { name: string; age: number; }

class User extends Entity<UserProps> {
  constructor(props: UserProps, id?: UniqueEntityID) { 
    super(props, id); 
  }
}

class InMemoryUserRepository implements IRepository<User> {
  private users: User[] = [];

  async save(user: User): Promise<Result<void>> {
    const index = this.users.findIndex(u => u.equals(user));
    if (index >= 0) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
    return Result.ok<void>();
  }

  async delete(id: string | number): Promise<Result<void>> {
    this.users = this.users.filter(u => u.id.getValue() !== id);
    return Result.ok<void>();
  }

  async getById(id: string | number): Promise<Result<User>> {
    const user = this.users.find(u => u.id.toString() === id.toString());
    if (!user) {
      return Result.fail<User>("User not found");
    }
    return Result.ok<User>(user);
  }

  // ✅ YENİ METODLAR
  async exists(id: string | number): Promise<Result<boolean>> {
    const result = await this.getById(id);
    return Result.ok(result.isSuccess);
  }

  async count(): Promise<Result<number>> {
    return Result.ok(this.users.length);
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<Result<User[], string>> {
    let users = [...this.users];
    
    if (options?.offset) {
      users = users.slice(options.offset);
    }
    
    if (options?.limit) {
      users = users.slice(0, options.limit);
    }
    
    return Result.ok(users);
  }
}

describe('IRepository - Extended Methods', () => {
  let repo: IRepository<User>;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
  });

  describe('exists', () => {
    it('should return true when entity exists', async () => {
      const user = new User({ name: 'John', age: 25 });
      await repo.save(user);

      const result = await repo.exists(user.id.toString());
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(true);
    });

    it('should return false when entity does not exist', async () => {
      const result = await repo.exists('non-existent-id');
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(false);
    });
  });

  describe('count', () => {
    it('should return 0 for empty repository', async () => {
      const result = await repo.count();
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(0);
    });

    it('should return correct count', async () => {
      await repo.save(new User({ name: 'User1', age: 20 }));
      await repo.save(new User({ name: 'User2', age: 25 }));
      await repo.save(new User({ name: 'User3', age: 30 }));

      const result = await repo.count();
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(3);
    });

    it('should update count after delete', async () => {
      const user = new User({ name: 'User1', age: 20 });
      await repo.save(user);
      
      let count = await repo.count();
      expect(count.getValue()).toBe(1);
      
      await repo.delete(user.id.toString());
      
      count = await repo.count();
      expect(count.getValue()).toBe(0);
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // Create 10 users
      for (let i = 0; i < 10; i++) {
        await repo.save(new User({ name: `User${i}`, age: 20 + i }));
      }
    });

    it('should return all entities when no options', async () => {
      const result = await repo.findAll();
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().length).toBe(10);
    });

    it('should limit results', async () => {
      const result = await repo.findAll({ limit: 5 });
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().length).toBe(5);
    });

    it('should skip results', async () => {
      const result = await repo.findAll({ offset: 5 });
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().length).toBe(5);
    });

    it('should combine offset and limit', async () => {
      const result = await repo.findAll({ offset: 3, limit: 4 });
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().length).toBe(4);
      expect(result.getValue()[0].props.name).toBe('User3');
    });

    it('should return empty array for out of range offset', async () => {
      const result = await repo.findAll({ offset: 100 });
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().length).toBe(0);
    });
  });

  describe('Integration - All methods together', () => {
    it('should support full CRUD workflow', async () => {
      // Create
      const user = new User({ name: 'Integration Test', age: 30 });
      await repo.save(user);
      
      // Exists
      const exists = await repo.exists(user.id.toString());
      expect(exists.getValue()).toBe(true);
      
      // Count
      let count = await repo.count();
      expect(count.getValue()).toBe(1);
      
      // Read
      const found = await repo.getById(user.id.toString());
      expect(found.getValue().props.name).toBe('Integration Test');
      
      // FindAll
      const all = await repo.findAll();
      expect(all.getValue().length).toBe(1);
      
      // Delete
      await repo.delete(user.id.toString());
      
      // Verify deletion
      const existsAfterDelete = await repo.exists(user.id.toString());
      expect(existsAfterDelete.getValue()).toBe(false);
      
      count = await repo.count();
      expect(count.getValue()).toBe(0);
    });
  });
});