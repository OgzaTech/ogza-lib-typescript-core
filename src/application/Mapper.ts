/**
 * Base Mapper Class
 * Domain Entity ↔ DTO ↔ Persistence Model dönüşümleri
 * 
 * @template DomainEntity - İş mantığını içeren Entity
 * @template DTO - Frontend/API için sade veri transfer objesi
 * @template PersistenceModel - Veritabanı satır modeli (ORM)
 */
export abstract class Mapper<DomainEntity, DTO, PersistenceModel = unknown> {
  
  /**
   * Domain Entity'yi DTO'ya çevir (API Response için)
   */
  public abstract toDTO(entity: DomainEntity): DTO;

  /**
   * Raw data'dan Domain Entity oluştur
   * @param raw - Persistence model veya DTO (any yerine union type)
   */
  public abstract toDomain(raw: PersistenceModel | DTO): DomainEntity;

  /**
   * Domain Entity'yi Persistence formatına çevir (DB kayıt için)
   * Opsiyonel - Sadece DB kullanan projeler implement eder
   */
  public toPersistence?(entity: DomainEntity): PersistenceModel;

  /**
   * Bulk transformation: Entity listesini DTO listesine çevir
   */
  public toDTOList(entities: DomainEntity[]): DTO[] {
    return entities.map(entity => this.toDTO(entity));
  }

  /**
   * Bulk transformation: Raw data listesini Domain Entity listesine çevir
   */
  public toDomainList(raws: (PersistenceModel | DTO)[]): DomainEntity[] {
    return raws.map(raw => this.toDomain(raw));
  }

  /**
   * Bulk transformation: Entity listesini Persistence listesine çevir
   * Sadece toPersistence implement edilmişse kullanılabilir
   */
  public toPersistenceList(entities: DomainEntity[]): PersistenceModel[] {
    if (!this.toPersistence) {
      throw new Error('toPersistence method is not implemented');
    }
    return entities.map(entity => this.toPersistence!(entity));
  }
}