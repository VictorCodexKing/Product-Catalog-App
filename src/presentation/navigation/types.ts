/**
 * Typed route parameters for the app's native stack navigator.
 *
 * Keeping this in its own module lets screens import the param list without a
 * circular dependency on the navigator component itself.
 */
export type RootStackParamList = {
  ProductList: undefined;
  ProductDetail: { id: number };
  Checkout: { productId: number; title: string; unitPrice: number; quantity: number };
};
