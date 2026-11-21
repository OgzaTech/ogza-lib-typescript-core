/**
 * DtoMapper — Domain Entity → DTO dönüşümleri (application katmanı).
 *
 * Kalıcı model (ORM/DB satırı) bilgisi içermez; o dönüşümler PersistenceMapper ile
 * altyapı (repository) katmanında yapılır.
 *
 * @template DomainEntity - İş mantığını içeren Entity
 * @template DTO - API / ön yüz için sade veri transfer objesi
 */
export abstract class DtoMapper<DomainEntity, DTO> {
  /** Domain Entity'yi DTO'ya çevir (API yanıtı için). */
  public abstract toDTO(entity: DomainEntity): DTO;

  /** Entity listesini DTO listesine çevir. */
  public toDTOList(entities: readonly DomainEntity[]): DTO[] {
    return entities.map((entity) => this.toDTO(entity));
  }
}
