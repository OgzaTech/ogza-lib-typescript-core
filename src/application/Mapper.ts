/**
 * DomainEntity: İş mantığını içeren Entity
 * DTO: Frontend/API için sade veri
 * PersistenceModel: Veritabanı satırı (ORM modeli)
 */
export abstract class Mapper<DomainEntity, DTO, PersistenceModel = any> {
  
  // Entity'yi DTO'ya çevir (API Response için)
  public abstract toDTO(entity: DomainEntity): DTO;

  // DTO veya Persistence modelden Entity yarat (Domain'e giriş için)
  public abstract toDomain(raw: any): DomainEntity;

  // Entity'yi Veritabanı formatına çevir (ORM kaydı için - Opsiyonel)
  public toPersistence?(entity: DomainEntity): PersistenceModel;
}