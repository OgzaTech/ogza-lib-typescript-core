/**
 * Specification Pattern
 * 
 * Domain logic'i encapsulate eder ve yeniden kullanılabilir hale getirir.
 * Business rule'ları açık ve test edilebilir şekilde ifade eder.
 * 
 * @template T - Specification'ın uygulanacağı tip
 */
export abstract class Specification<T> {
  /**
   * Candidate'in specification'ı satisfy edip etmediğini kontrol eder
   */
  abstract isSatisfiedBy(candidate: T): boolean;

  /**
   * AND combination - Her iki specification da sağlanmalı
   */
  and(other: Specification<T>): Specification<T> {
    return new AndSpecification<T>(this, other);
  }

  /**
   * OR combination - En az bir specification sağlanmalı
   */
  or(other: Specification<T>): Specification<T> {
    return new OrSpecification<T>(this, other);
  }

  /**
   * NOT - Specification'ın tersi
   */
  not(): Specification<T> {
    return new NotSpecification<T>(this);
  }
}

/**
 * AND Specification
 */
class AndSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }
}

/**
 * OR Specification
 */
class OrSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }
}

/**
 * NOT Specification
 */
class NotSpecification<T> extends Specification<T> {
  constructor(private readonly spec: Specification<T>) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }
}

/**
 * Composite Specification - Liste bazlı kombinasyon
 */
export class CompositeSpecification<T> extends Specification<T> {
  private readonly specs: Specification<T>[] = [];

  constructor(...specs: Specification<T>[]) {
    super();
    this.specs = specs;
  }

  /**
   * Tüm specification'lar sağlanmalı (AND)
   */
  isSatisfiedBy(candidate: T): boolean {
    return this.specs.every(spec => spec.isSatisfiedBy(candidate));
  }

  /**
   * Add specification to composite
   */
  add(spec: Specification<T>): this {
    this.specs.push(spec);
    return this;
  }
}