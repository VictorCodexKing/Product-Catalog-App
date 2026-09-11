# Product Catalog App

A small mobile product catalog built with React Native (Expo). It browses the
free [DummyJSON](https://dummyjson.com) products API with pagination, debounced
search, a detail screen, and clearly distinguished loading / error / empty /
success states.

## Features

- **Product list** — each row shows the thumbnail, title, price, remaining
  stock, an **availability pill** ("In Stock" / "Out of Stock"), a **discount
  badge** on the thumbnail, and the product's **tags** (e.g. `beauty`,
  `mascara`) instead of a single colour swatch.
- **Status & Category filters** — two dropdown-style filter chips below the
  search box (modelled on the reference design). Status filters by availability
  (All / In Stock / Out of Stock); Category filters by the categories present in
  the loaded products. Filtering is pure, client-side, and unit-tested.
- **Pagination** — additional pages load automatically as you scroll, using the
  DummyJSON `skip` parameter (20 items per page).
- **Product detail** — tap a product to see its image gallery, availability
  pill, price (with the original pre-discount price struck through and the
  discount %), rating (stars + numeric + review count), brand/category, tags,
  the **full description**, a **dimensions** grid (width/height/depth/weight),
  and the **full list of reviews** (reviewer, star rating, comment, date).
- **Distinct states** — visually separated loading (blue spinner), error (red
  panel with a **Retry** button), empty (neutral), and success views, on both
  the list and the detail screen.
- **Debounced search** — a search box (400 ms debounce) queries the API and
  resets pagination for the new query.

### Design reference

The list layout is inspired by the provided reference mock but intentionally
not a pixel copy. Per the brief it swaps the generic "Active" status for a real
**In Stock / Out of Stock** availability pill, adds a **discount percentage**
badge on each item, and shows the product's **tags** in place of the colour
swatch.

## How to run

Requires Node 18+ (developed on Node 22) and npm.

```bash
npm install          # install dependencies
npx expo start       # start the Expo dev server
```

Then open the app on a device/emulator via the Expo Go app or a simulator
(press `a` for Android, `i` for iOS, or scan the QR code).

>
> ```bash
> npx tsc --noEmit     # or: npm run typecheck
> npm run lint
> npm test
> ```

## Stack

- **Expo** (SDK ~57, managed workflow)
- **React Native** 0.86 with **React** 19
- **TypeScript**
- **React Navigation** (native stack) for list → detail navigation
- **Jest** with the **jest-expo** preset for unit tests
- **ESLint** (`eslint-config-expo`) for linting

## Architecture

The code is split into three layers under `src/`, each with a single
responsibility. Dependencies flow inward: `presentation` depends on `data`,
`data` depends on `domain`, and `domain` depends on nothing.

- **`src/domain`** — Framework-agnostic models and pure business logic. Contains
  the `Product` / `Review` / `Dimensions` / `ProductListResponse` types, the
  `PAGE_SIZE` constant, a standalone `debounce` utility, and the pure product
  helpers `isInStock`, `availabilityLabel`, `originalPrice`, `filterProducts`,
  and `uniqueCategories`. No React and no network code here — this is where the
  stock/discount/filter rules live so they can be unit tested in isolation.
- **`src/data`** — The transport and repository layer. `api.ts` performs the raw
  `fetch` calls to DummyJSON (`/products`, `/products/{id}`, `/products/search`);
  `productRepository.ts` maps raw responses into domain models, hides the
  pagination arithmetic (`skip = page * PAGE_SIZE`), and is the single entry
  point the UI reads product data through.
- **`src/presentation`** — Everything UI. Organized into `navigation` (stack
  routes and param types), `screens` (`ProductListScreen`, `ProductDetailScreen`),
  `components` (`ProductCard`, `FilterBar`, `RemoteImage`, and the `LoadingState` /
  `ErrorState` / `EmptyState` views), and `hooks` (`useProducts`,
  `useProductDetail`, `useDebounce`) that own the fetch state machines. The
  screens read stock/discount/filter behaviour from the pure `domain` helpers
  rather than embedding those rules in components.

Keeping the fetch/state logic in hooks and the pure logic in `domain` keeps the
screens thin and makes the data/business logic straightforward to unit test
without a renderer.

## Search decision: server-side endpoint

**Search uses the server-side DummyJSON `/products/search?q=` endpoint, not
client-side filtering.** Reasons:

- **Consistent pagination.** The search path returns the same paginated
  `{ products, total, skip, limit }` shape as the browse path, so the existing
  `skip`-based "load more" pagination works identically for search results.
- **Lower client memory.** We never need to download the entire catalog into
  memory just to filter it locally; only the current page is held.
- **API-provided relevance.** We rely on the server's search ranking rather than
  reimplementing (and having to maintain) a matching/ranking heuristic on the
  client.

Search input is debounced by 400 ms so we issue at most one request per pause in
typing, and changing the query resets the list to the first page.

### Filter decision: client-side

The **Status** and **Category** filter chips are applied **client-side** to the
products already loaded, not via extra API calls. Reasons:

- DummyJSON has no combined "status + category" query parameter, so honoring
  both filters server-side would mean multiple round-trips and reconciling
  pagination across them.
- The filters are cheap set/predicate operations over the in-memory page, so
  they respond instantly with no network latency.
- The rules are pure functions (`filterProducts`, `uniqueCategories`,
  `isInStock`) that are straightforward to unit test.

The trade-off is documented below: because filtering is client-side, it only
narrows the products already fetched, not the entire remote catalog.

## Bonus items implemented

- **Pull-to-refresh** on the product list (via `RefreshControl`).
- **Image placeholder / error handling** — the shared `RemoteImage` component
  shows a spinner while an image loads and a neutral "No image" fallback on
  error. It is reused by both the list thumbnails and the detail gallery.
- **Unit tests** for the business/data logic: the `debounce` utility, the
  `productRepository` mapping/pagination (including the extended `tags` /
  `dimensions` / `reviews` fields), the pagination reducer, and the new domain
  helpers `isInStock` / `availabilityLabel` / `originalPrice` / `filterProducts`
  / `uniqueCategories` (41 tests across 4 suites via Jest).

## What I didn't finish (TODOs)

- **No on-device run in the sandbox.** No emulator/device was available, so the
  app was validated only via `tsc`, ESLint, and Jest — not by launching it.
- **No UI component tests.** `react-test-renderer` currently has a peer-dependency
  conflict with this project's React version (it wants React `^19.3.0` while the
  app pins `19.2.3`), so component/render tests were skipped in favor of the
  data/business-logic unit tests. This could be revisited by pinning
  `react-test-renderer@19.2.x` or adopting `@testing-library/react-native`.
- **Filters are client-side only.** The Status/Category chips narrow the
  products already loaded into memory, not the full remote catalog. A product
  that matches a filter but hasn't been paged in yet won't appear until you
  scroll far enough to load it. Moving category filtering server-side (DummyJSON
  exposes `/products/category/{slug}`) is a possible follow-up.
- **No offline caching / persistence.** Data is always fetched fresh; there is no
  local cache or optimistic offline support.
- **No retry/backoff or request cancellation at the network layer** beyond the
  in-hook stale-response guards; failed requests simply surface the error state.
