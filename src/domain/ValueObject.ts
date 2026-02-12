import { shallowEqual } from "../utils/shallowEqual"; // Birazdan oluşturacağız

interface ValueObjectProps {
  [index: string]: any;
}

/**
 * @desc ValueObjects are objects that we determine their
 * equality through their structrual property.
 */
export abstract class ValueObject<T extends ValueObjectProps> {
  public readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.props === undefined) {
      return false;
    }
    // Sığ karşılaştırma (Shallow comparison) yapar.
    // Eğer iç içe objeler varsa 'deep equal' gerekebilir ama ValueObject'ler genelde düzdür.
    return shallowEqual(this.props, vo.props);
  }
}