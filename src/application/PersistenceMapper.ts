/**
 * PersistenceMapper — Kalıcı model ↔ Domain Entity dönüşümleri (altyapı / repository katmanı).
 *
 * Application ve domain katmanları kalıcı model tiplerini görmez; bu sınıfın implementasyonları
 * repository katmanında durur.
 *
 * @template DomainEntity - İş mantığını içeren Entity
 * @template PersistenceModel - Veritabanı satır modeli (ORM)
 */
export abstract class PersistenceMapper<DomainEntity, PersistenceModel> {
  /** Kalıcı modelden Domain Entity oluştur (yeniden yükleme). */
  public abstract toDomain(raw: PersistenceModel): DomainEntity;

  /** Domain Entity'yi kalıcı modele çevir (DB kaydı için). */
  public abstract toPersistence(entity: DomainEntity): PersistenceModel;

  /** Kalıcı model listesini Domain Entity listesine çevir. */
  public toDomainList(raws: readonly PersistenceModel[]): DomainEntity[] {
    return raws.map((raw) => this.toDomain(raw));
  }

  /** Entity listesini kalıcı model listesine çevir. */
  public toPersistenceList(entities: readonly DomainEntity[]): PersistenceModel[] {
    return entities.map((entity) => this.toPersistence(entity));
  }
}
