import { productRepository } from '../productRepository';
import { PAGE_SIZE, type Product, type ProductListResponse } from '../../domain/product';

function makeRawProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    title: 'iPhone 9',
    description: 'An apple mobile which is nothing like apple',
    price: 549,
    rating: 4.69,
    thumbnail: 'https://example.com/thumb.jpg',
    images: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
    brand: 'Apple',
    category: 'smartphones',
    stock: 94,
    discountPercentage: 12.96,
    tags: ['smartphones', 'apple'],
    availabilityStatus: 'In Stock',
    weight: 4,
    dimensions: { width: 15.14, height: 13.08, depth: 22.99 },
    warrantyInformation: '1 year warranty',
    shippingInformation: 'Ships in 3-5 business days',
    reviews: [
      {
        rating: 4,
        comment: 'Great!',
        date: '2025-04-30T09:41:02.053Z',
        reviewerName: 'Jane Doe',
        reviewerEmail: 'jane.doe@x.dummyjson.com',
      },
    ],
    ...overrides,
  };
}

function makeListResponse(products: Product[], skip: number): ProductListResponse {
  return { products, total: 100, skip, limit: PAGE_SIZE };
}

describe('productRepository', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function mockJson(body: unknown, ok = true, status = 200): void {
    fetchMock.mockResolvedValueOnce({
      ok,
      status,
      statusText: ok ? 'OK' : 'Error',
      json: async () => body,
    });
  }

  it('getProducts builds the correct URL with limit/skip and maps the response', async () => {
    const raw = makeListResponse([makeRawProduct()], 40);
    mockJson(raw);

    const result = await productRepository.getProducts(2);

    // page 2 => skip = 2 * PAGE_SIZE
    expect(fetchMock).toHaveBeenCalledWith(
      `https://dummyjson.com/products?limit=${PAGE_SIZE}&skip=${2 * PAGE_SIZE}`,
    );
    expect(result.products).toHaveLength(1);
    const product = result.products[0];
    expect(product.id).toBe(1);
    expect(product.title).toBe('iPhone 9');
    expect(product.images).toEqual([
      'https://example.com/1.jpg',
      'https://example.com/2.jpg',
    ]);
  });

  it('getProduct requests /products/{id} and maps a single product', async () => {
    mockJson(makeRawProduct({ id: 42, title: 'Widget' }));

    const product = await productRepository.getProduct(42);

    expect(fetchMock).toHaveBeenCalledWith('https://dummyjson.com/products/42');
    expect(product.id).toBe(42);
    expect(product.title).toBe('Widget');
  });

  it('search builds the search URL with an encoded query, limit and skip', async () => {
    mockJson(makeListResponse([makeRawProduct({ id: 7 })], 0));

    const result = await productRepository.search('smart phone', 0);

    expect(fetchMock).toHaveBeenCalledWith(
      `https://dummyjson.com/products/search?q=smart%20phone&limit=${PAGE_SIZE}&skip=0`,
    );
    expect(result.products[0].id).toBe(7);
  });

  it('normalises a missing images array to an empty array', async () => {
    const raw = makeListResponse(
      [makeRawProduct({ images: undefined as unknown as string[] })],
      0,
    );
    mockJson(raw);

    const result = await productRepository.getProducts(0);
    expect(result.products[0].images).toEqual([]);
  });

  it('maps the extended fields (tags, availabilityStatus, dimensions, reviews)', async () => {
    mockJson(makeListResponse([makeRawProduct()], 0));

    const result = await productRepository.getProducts(0);
    const product = result.products[0];

    expect(product.tags).toEqual(['smartphones', 'apple']);
    expect(product.availabilityStatus).toBe('In Stock');
    expect(product.weight).toBe(4);
    expect(product.dimensions).toEqual({ width: 15.14, height: 13.08, depth: 22.99 });
    expect(product.reviews).toHaveLength(1);
    expect(product.reviews[0].reviewerName).toBe('Jane Doe');
  });

  it('normalises missing tags and reviews arrays to empty arrays', async () => {
    const raw = makeListResponse(
      [
        makeRawProduct({
          tags: undefined as unknown as string[],
          reviews: undefined as unknown as Product['reviews'],
        }),
      ],
      0,
    );
    mockJson(raw);

    const result = await productRepository.getProducts(0);
    expect(result.products[0].tags).toEqual([]);
    expect(result.products[0].reviews).toEqual([]);
  });

  it('throws a descriptive error on a non-2xx response', async () => {
    mockJson({}, false, 500);

    await expect(productRepository.getProducts(0)).rejects.toThrow(/failed with status 500/);
  });

  it('getProductsByCategory builds the /products/category/{slug} URL with paging', async () => {
    mockJson(makeListResponse([makeRawProduct({ id: 5 })], PAGE_SIZE));

    const result = await productRepository.getProductsByCategory('home-decoration', 1);

    expect(fetchMock).toHaveBeenCalledWith(
      `https://dummyjson.com/products/category/home-decoration?limit=${PAGE_SIZE}&skip=${PAGE_SIZE}`,
    );
    expect(result.products[0].id).toBe(5);
  });

  it('getCategories maps raw categories to { slug, name }', async () => {
    mockJson([
      { slug: 'beauty', name: 'Beauty', url: 'https://x/beauty' },
      { slug: 'home-decoration', name: 'Home Decoration', url: 'https://x/hd' },
    ]);

    const categories = await productRepository.getCategories();

    expect(fetchMock).toHaveBeenCalledWith('https://dummyjson.com/products/categories');
    expect(categories).toEqual([
      { slug: 'beauty', name: 'Beauty' },
      { slug: 'home-decoration', name: 'Home Decoration' },
    ]);
  });

  it('getCategories normalises a non-array response to an empty list', async () => {
    mockJson(null);

    const categories = await productRepository.getCategories();
    expect(categories).toEqual([]);
  });
});
