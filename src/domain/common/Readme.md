URL ValueObject:

import { URL } from '@ogza/core';

// Create
const url = URL.create('https://api.example.com/users?page=1&limit=10');

if (url.isSuccess) {
  const urlObj = url.getValue();
  
  console.log(urlObj.getDomain());        // api.example.com
  console.log(urlObj.getProtocol());      // https
  console.log(urlObj.isSecure());         // true
  console.log(urlObj.getQueryParams());   // { page: '1', limit: '10' }
  
  // Add query param
  const newUrl = urlObj.withQueryParam('sort', 'name');
  console.log(newUrl.getValue().getValue()); 
  // https://api.example.com/users?page=1&limit=10&sort=name
}

// Build from parts
const apiUrl = URL.fromParts(
  'https',
  'api.example.com',
  '/v1/users',
  { page: '1', limit: '20' }
);

-------
Color ValueObject:
import { Color } from '@ogza/core';

// From HEX
const primary = Color.fromHex('#3B82F6');
console.log(primary.getValue().toRgb());        // rgb(59, 130, 246)
console.log(primary.getValue().toHsl());        // { h: 217, s: 91, l: 60 }

// Manipulate
const lighter = primary.getValue().lighten(10);
const darker = primary.getValue().darken(10);
const transparent = primary.getValue().withOpacity(0.5);

console.log(transparent.getValue().toRgba());  // rgba(59, 130, 246, 0.5)

// Predefined
const red = Color.RED;
const white = Color.WHITE;

// From RGB
const custom = Color.fromRgb(100, 150, 200);

------
DateRange ValueObject:

import { DateRange } from '@ogza/core';

// Create
const range = DateRange.create(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);

if (range.isSuccess) {
  const dr = range.getValue();
  
  console.log(dr.getDurationDays());     // 30
  console.log(dr.format());               // 01/01/2024 - 01/31/2024
  
  // Check if contains date
  const date = new Date('2024-01-15');
  console.log(dr.contains(date));        // true
  
  // Split into days
  const days = dr.splitIntoDays();
  console.log(days.length);              // 31
}

// Predefined ranges
const today = DateRange.today();
const thisWeek = DateRange.thisWeek();
const thisMonth = DateRange.thisMonth();
const last7Days = DateRange.lastDays(7);

// Check overlaps
const range1 = DateRange.create(new Date('2024-01-01'), new Date('2024-01-15'));
const range2 = DateRange.create(new Date('2024-01-10'), new Date('2024-01-20'));
console.log(range1.getValue().overlaps(range2.getValue())); // true