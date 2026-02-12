import { Mapper } from '../Mapper';

// Mock Domain, DTO
class UserEntity { name: string; constructor(name: string) { this.name = name; } }
interface UserDTO { full_name: string; }

// Mapper Implementasyonu
class UserMapper extends Mapper<UserEntity, UserDTO> {
  public toDTO(entity: UserEntity): UserDTO {
    return { full_name: entity.name };
  }
  public toDomain(raw: any): UserEntity {
    return new UserEntity(raw.full_name);
  }
}

describe('Mapper', () => {
  it('should map entity to DTO', () => {
    const mapper = new UserMapper();
    const entity = new UserEntity("Ahmet");
    const dto = mapper.toDTO(entity);

    expect(dto.full_name).toBe("Ahmet");
  });

  it('should map raw/DTO to Domain', () => {
    const mapper = new UserMapper();
    const dto = { full_name: "Mehmet" };
    const entity = mapper.toDomain(dto);

    expect(entity).toBeInstanceOf(UserEntity);
    expect(entity.name).toBe("Mehmet");
  });
});