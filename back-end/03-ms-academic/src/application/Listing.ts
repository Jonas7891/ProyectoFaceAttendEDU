import type { PageOptions } from '../domain/ports/out/ICrudRepository';

/** A query a use case allows: the route decides whether to page it. */
export interface Listing<T> {
  list(page: PageOptions): Promise<T[]>;
  count(): Promise<number>;
}

/** An empty result, for a caller that may see nothing. */
export function emptyListing<T>(): Listing<T> {
  return { list: async () => [], count: async () => 0 };
}

/** A result already filtered in memory. */
export function listingOf<T>(items: T[]): Listing<T> {
  return {
    list: async ({ limit, offset = 0 }) => (limit === undefined ? items.slice(offset) : items.slice(offset, offset + limit)),
    count: async () => items.length,
  };
}
