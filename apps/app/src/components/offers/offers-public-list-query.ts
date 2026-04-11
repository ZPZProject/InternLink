/** Input for public `offers.list` — keep in sync with RSC prefetch on `/offers`. */
export function offersPublicListInput(search?: string, location?: string) {
  return {
    search: search ? search : undefined,
    location: location ? location : undefined,
    limit: 20,
    offset: 0,
  };
}
