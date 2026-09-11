import {
  availabilityLabel,
  filterProducts,
  isInStock,
  originalPrice,
  uniqueCategories,
  type Product,
} from '../product';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    title: 'Test Product',
    description: 'A product for tests',
    price: 100,
    rating: 4,
    thumbnail: 'https://example.com/thumb.jpg',
    images: [],
    tags: [],
    reviews: [],
    ...overrides,
  };
}

describe('isInStock', () => {
  it('uses availabilityStatus when present, treating "out" as out of stock', () => {
    expect(isInStock({ availabilityStatus: 'In Stock', stock: 0 })).toBe(true);
    expect(isInStock({ availabilityStatus: 'Low Stock', stock: 3 })).toBe(true);
    expect(isInStock({ availabilityStatus: 'Out of Stock', stock: 50 })).toBe(false);
  });

  it('falls back to the numeric stock when no status is given', () => {
    expect(isInStock({ stock: 5 })).toBe(true);
    expect(isInStock({ stock: 0 })).toBe(false);
    expect(isInStock({})).toBe(false);
  });
});

describe('availabilityLabel', () => {
  it('returns the API status verbatim when present', () => {
    expect(availabilityLabel({ availabilityStatus: 'Low Stock', stock: 2 })).toBe('Low Stock');
  });

  it('derives a label from stock when no status is present', () => {
    expect(availabilityLabel({ stock: 10 })).toBe('In Stock');
    expect(availabilityLabel({ stock: 0 })).toBe('Out of Stock');
  });
});

describe('originalPrice', () => {
  it('computes the pre-discount price from price and discount percentage', () => {
    // 9.99 after a 10% discount => 9.99 / 0.9 = 11.10
    expect(originalPrice(9.99, 10)).toBeCloseTo(11.1, 2);
  });

  it('returns null when there is no meaningful discount', () => {
    expect(originalPrice(50, 0)).toBeNull();
    expect(originalPrice(50, undefined)).toBeNull();
    expect(originalPrice(50, -5)).toBeNull();
  });
});

describe('filterProducts', () => {
  const products = [
    makeProduct({ id: 1, category: 'beauty', availabilityStatus: 'In Stock' }),
    makeProduct({ id: 2, category: 'beauty', availabilityStatus: 'Out of Stock' }),
    makeProduct({ id: 3, category: 'fragrances', stock: 0 }),
    makeProduct({ id: 4, category: 'fragrances', stock: 8 }),
  ];

  it('is a no-op for status "all" and null category', () => {
    expect(filterProducts(products, 'all', null)).toHaveLength(4);
  });

  it('filters to in-stock products', () => {
    expect(filterProducts(products, 'in-stock', null).map((p) => p.id)).toEqual([1, 4]);
  });

  it('filters to out-of-stock products', () => {
    expect(filterProducts(products, 'out-of-stock', null).map((p) => p.id)).toEqual([2, 3]);
  });

  it('filters by category case-insensitively', () => {
    expect(filterProducts(products, 'all', 'BEAUTY').map((p) => p.id)).toEqual([1, 2]);
  });

  it('combines status and category filters', () => {
    expect(filterProducts(products, 'in-stock', 'fragrances').map((p) => p.id)).toEqual([4]);
  });
});

describe('uniqueCategories', () => {
  it('returns the distinct, sorted categories', () => {
    const products = [
      makeProduct({ id: 1, category: 'fragrances' }),
      makeProduct({ id: 2, category: 'beauty' }),
      makeProduct({ id: 3, category: 'beauty' }),
      makeProduct({ id: 4 }),
    ];
    expect(uniqueCategories(products)).toEqual(['beauty', 'fragrances']);
  });
});
