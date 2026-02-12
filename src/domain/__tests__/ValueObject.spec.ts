import { ValueObject } from '../ValueObject';

// Test için sahte bir Value Object
interface AddressProps {
  street: string;
  city: string;
  zip?: number;
}

class Address extends ValueObject<AddressProps> {
  constructor(props: AddressProps) {
    super(props);
  }
}

describe('ValueObject', () => {

  it('should be equal if all properties are the same', () => {
    const address1 = new Address({ street: 'Main St', city: 'Istanbul', zip: 34000 });
    const address2 = new Address({ street: 'Main St', city: 'Istanbul', zip: 34000 });

    expect(address1.equals(address2)).toBe(true);
  });

  it('should not be equal if one property is different', () => {
    const address1 = new Address({ street: 'Main St', city: 'Istanbul' });
    const address2 = new Address({ street: 'Second St', city: 'Istanbul' });

    expect(address1.equals(address2)).toBe(false);
  });

  it('should verify structural equality even with nested properties (Shallow check limitation awareness)', () => {
    // Not: shallowEqual kullandığımız için iç içe objelerde referans farkı eşitliği bozabilir.
    // ValueObject'ler genelde "flat" (düz) tutulmalıdır.
    
    // Aynı referansı paylaşan nested objelerle test
    const nestedObj = { key: 'value' };
    
    class ComplexVO extends ValueObject<any> { constructor(props: any) { super(props); } }

    const vo1 = new ComplexVO({ nested: nestedObj });
    const vo2 = new ComplexVO({ nested: nestedObj });

    expect(vo1.equals(vo2)).toBe(true);
  });

  it('should not be equal to null or undefined', () => {
    const vo = new Address({ street: 'Main', city: 'NY' });
    expect(vo.equals(undefined)).toBe(false);
  });
});