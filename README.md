# VLADCASE

A local CS2-inspired case-opening simulator. Currency and items are fictional; generated illustrations are not exact game previews.

## Run and verify

Use Node.js 22.12+ (verified on Node 24) and npm.

```sh
npm ci
npm run dev -- --hostname 127.0.0.1
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests start the production server on loopback port 3100. Build before running them. Tests use isolated browser contexts, not your everyday browser profile.

## Progress and transactions

The versioned `vladcase_state_v2` localStorage snapshot contains balance in integer cents, XP, inventory instances, favorites, collection goals, lifetime statistics, and the latest 100 openings. The previous `vladcase_state_v1` snapshot and the oldest `vladcase_*` keys are migrated without deleting the source data. Invalid data is preserved and mutations are blocked until it is repaired.

Every mutation takes the origin-wide Web Lock, re-reads storage, validates the transition, writes one snapshot, and only then updates the UI. Opening saves the charge and reward before its reveal. Leaving or refreshing does not lose that item. Sales use instance IDs and cannot credit a missing item. Browser storage failures leave the previous snapshot intact.

Use HTTPS or localhost: Web Locks are required. Other tabs receive storage updates. This is client-owned simulator state, not a trusted ledger or real-money system.

## Artwork

All 24 generated assets (19 skins and 5 cases) are committed in `public/assets/` as 640-pixel WebP images. They were generated individually with the built-in image generation tool. Exact prompts and original output filenames are recorded in `scripts/art-sources.json`. Old inventory image URLs are mapped to local artwork at display time without rewriting existing saved records.

The committed assets work without generation tools. To re-encode the originals, run:

```sh
npm run assets:prepare -- <directory-containing-original-generated-PNGs>
```

Sharp is a development dependency for reproducible asset compression and a contact sheet. Vitest tests pure transactions; Playwright covers actual browser storage, locks, dialogs, and navigation. Removing these development tools does not change the runtime app.

## Dependency notes

Next.js was upgraded from 14 to the patched 15.5 line because the older line has an unpatched Windows-hosted server vulnerability (GHSA-p293-qw3h-jr36). React 19 and compatible types follow the App Router upgrade guidance. The PostCSS override keeps Next's transitive dependency on the patched version already used by the project; remove it when Next's dependency catches up. ESLint 9 is constrained by the Next 15 lint configuration's supported peer range.

No deployment or backend is required. Reset and remove actions require explicit in-app confirmation.
