import { UniqueEntityID } from "./UniqueEntityID";

const isEntity = (v: any): v is Entity<any> => {
  return v instanceof Entity;
};

export abstract class Entity<T> {
  protected readonly _id: UniqueEntityID;
  public readonly props: T;

  // ID dışarıdan verilebilir (DB'den okurken) veya yeni oluşturulabilir (New User)
  constructor(props: T, id?: UniqueEntityID) {
    this._id = id ? id : new UniqueEntityID();
    this.props = props;
  }

  // Entity'nin eşitlik kontrolü (Referans DEĞİL, Kimlik kontrolü)
  public equals(object?: Entity<T>): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!isEntity(object)) {
      return false;
    }

    // İki entity'nin ID'leri eşitse, kendileri de eşittir.
    return this._id.equals(object._id);
  }
}