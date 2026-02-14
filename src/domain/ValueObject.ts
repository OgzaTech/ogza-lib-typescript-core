import { deepEqual } from "../utils/deepEqual";

interface ValueObjectProps {
  [index: string]: any;
}

/**
 * Value Object Base Class
 * 
 * Value Object'ler kimlik yerine değer ile tanımlanır.
 * İki Value Object, tüm property'leri aynıysa eşittir (structural equality).
 * 
 * Immutable'dır - props değiştirilemez.
 */
export abstract class ValueObject<T extends ValueObjectProps> {
  public readonly props: T;

  constructor(props: T) {
    // Immutability için freeze
    this.props = Object.freeze(props);
  }

  /**
   * Deep structural equality kontrolü
   * Nested object'leri de karşılaştırır
   * 
   * ÖNEMLI: shallowEqual yerine deepEqual kullanıyoruz çünkü:
   * - Address gibi nested property'li ValueObject'ler için gerekli
   * - Money gibi complex ValueObject'ler için güvenli
   * 
   * @param vo - Karşılaştırılacak Value Object
   * @returns true if structurally equal
   */
  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    
    if (vo.props === undefined) {
      return false;
    }

    // Deep equality comparison (nested objects için)
    return deepEqual(this.props, vo.props);
  }
}