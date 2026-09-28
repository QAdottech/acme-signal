# ACME Signal

A CRM platform for managing contacts, organizations, and collections.

This project is a demo CRM application with standard automated tests and PR browser-testing workflows.

## Development

Use Node 22.22.0 and pnpm 10.33.4.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

## Organization maps

Organization pages link to their location in Google Maps. To also show an embedded map, enable the Google Maps Embed API in Google Cloud and set `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY` in `.env.local`. Restrict this public browser key to your site's HTTP referrers and the Maps Embed API. Locations are city-level, so the map does not indicate an exact office address.

## Testing

```sh
pnpm exec playwright install chromium
pnpm test           # Vitest unit tests
pnpm test:e2e       # Playwright journeys against a managed production build
pnpm test:all       # Test typecheck, unit coverage, and E2E
```

See [tests/README.md](tests/README.md) for coverage, isolation, CI, debugging, and browser scenario contracts.
