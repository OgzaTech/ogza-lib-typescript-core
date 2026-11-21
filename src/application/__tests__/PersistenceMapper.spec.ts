import { PersistenceMapper } from '../PersistenceMapper';

class UserEntity {
  constructor(public readonly name: string) {}
}
interface UserRow {
  full_name: string;
}

class UserPersistenceMapper extends PersistenceMapper<UserEntity, UserRow> {
  public toDomain(raw: UserRow): UserEntity {
    return new UserEntity(raw.full_name);
  }
  public toPersistence(entity: UserEntity): UserRow {
    return { full_name: entity.name };
  }
}

describe('PersistenceMapper', () => {
  const mapper = new UserPersistenceMapper();

  it('should map row to entity and back', () => {
    const entity = mapper.toDomain({ full_name: 'Ayşe' });
    expect(entity.name).toBe('Ayşe');
    expect(mapper.toPersistence(entity)).toEqual({ full_name: 'Ayşe' });
  });

  it('should map lists in both directions', () => {
    const entities = mapper.toDomainList([{ full_name: 'A' }, { full_name: 'B' }]);
    expect(entities.map((e) => e.name)).toEqual(['A', 'B']);
    expect(mapper.toPersistenceList(entities)).toEqual([{ full_name: 'A' }, { full_name: 'B' }]);
  });
});
