import { DtoMapper } from '../DtoMapper';

class UserEntity {
  constructor(public readonly name: string) {}
}
interface UserDTO {
  full_name: string;
}

class UserDtoMapper extends DtoMapper<UserEntity, UserDTO> {
  public toDTO(entity: UserEntity): UserDTO {
    return { full_name: entity.name };
  }
}

describe('DtoMapper', () => {
  const mapper = new UserDtoMapper();

  it('should map entity to DTO', () => {
    expect(mapper.toDTO(new UserEntity('Ahmet'))).toEqual({ full_name: 'Ahmet' });
  });

  it('should map entity list to DTO list', () => {
    const dtos = mapper.toDTOList([new UserEntity('Ahmet'), new UserEntity('Mehmet')]);
    expect(dtos).toEqual([{ full_name: 'Ahmet' }, { full_name: 'Mehmet' }]);
  });
});
