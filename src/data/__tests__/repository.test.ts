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

  it('throws a descriptive error on a non-2xx response', async () => {
    mockJson({}, false, 500);

    await expect(productRepository.getProducts(0)).rejects.toThrow(/failed with status 500/);
  });
});
