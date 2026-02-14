/**
 * Deep equality comparison
 * Nested object'leri recursive olarak karşılaştırır
 * 
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns true if deeply equal
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  // Referans eşitliği (aynı obje)
  if (obj1 === obj2) {
    return true;
  }

  // Null/undefined kontrolü
  if (obj1 == null || obj2 == null) {
    return false;
  }

  // Tip kontrolü
  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  // Primitive tipler için
  if (typeof obj1 !== 'object') {
    return obj1 === obj2;
  }

  // Array kontrolü
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    return obj1.every((item, index) => deepEqual(item, obj2[index]));
  }

  // Bir array diğeri değilse
  if (Array.isArray(obj1) || Array.isArray(obj2)) {
    return false;
  }

  // Date kontrolü
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  }

  // RegExp kontrolü
  if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
    return obj1.toString() === obj2.toString();
  }

  // Object karşılaştırması
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  // Recursive karşılaştırma
  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }
    if (!deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}