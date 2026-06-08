# ChargeSpot Development Session — 2026-06-08

## Problems Fixed

### 1. SearchBar: Non-functional submit button
- **Root cause:** The magnifying glass icon inside the search input was purely decorative (`pointer-events: none`) and was not a submit button. Users clicking the icon expected search to trigger, but nothing happened.
- **Fix:** Replaced with a visible green "Search" button (icon + text) as a proper `<button type="submit">` outside the input field with a large hit target.

### 2. Dark mode map broken (inverted colors broke label readability)
- **Root cause:** CSS used `filter: invert(0.9) hue-rotate(180deg)` on `.dark .leaflet-container` to force dark mode. This inverted all map elements including text labels, making them unreadable.
- **Fix:** Removed the CSS filter hack entirely. The Map component now accepts a `dark` prop and swaps between CARTO `light_all` and `dark_all` tile layers at the source.

### 3. Zombie processes causing port conflicts
- **Root cause:** `npm run dev` spawned processes that survived shell session termination, blocking ports on subsequent starts.
- **Fix:** Used `setsid` to properly detach production servers. Killed zombie `next-server` and `next dev` processes before restarting.

### 4. Service worker caching stale HTML/JS
- **Root cause:** The original SW used a cache-first strategy for all same-origin requests, including HTML pages and JS bundles. After fixes were deployed, the browser served the old cached version.
- **Fix:** Rewrote `/sw.js` to cache only static assets (manifest.json, icons). HTML pages and JS/CSS are never cached. Added `skipWaiting()` and `clients.claim()` for immediate activation. Registration uses `updateViaCache: 'none'`.

### 5. CORS misconfiguration
- **Root cause:** The `.env` file had `CHARGESPOT_CORS_ORIGINS=http://localhost:3000` (single port), overriding the config.py default. After the frontend moved to port 3001/3002, cross-origin requests were blocked.
- **Fix:** Expanded `.env` to include `http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005`.

### 6. API calls used cross-origin direct fetches instead of Next.js proxy
- **Root cause:** `api.ts` set `API_BASE = "http://localhost:8000"`, making the browser fetch directly from port 8000 (cross-origin). The Next.js rewrite rule (`/api/*` → `http://localhost:8000/api/*`) sat unused for client-side calls.
- **Fix:** Changed `API_BASE` to empty string `""`. All API calls now use relative URLs (`/api/stations?q=Sydney`), hitting the same-origin Next.js proxy. This eliminates CORS entirely.

### 7. Text search didn't pan the map
- **Root cause:** In `page.tsx`, the `loadStations` function only called `setCenter`/`setZoom` when coordinates (`lat,lng`) were provided, not for plain text queries like "Melbourne". Results loaded but the map stayed at the previous location.
- **Fix:** Added `setCenter`/`setZoom` call for text searches, panning to the first result's coordinates.

### 8. Production build vs dev server conflict
- **Root cause:** `npm run build` and `npm run dev` share the `.next/` directory. Running dev after a production build corrupted the cache.
- **Fix:** Separated concerns. Production uses `npm run build` + `npm run start` on port 3000. Dev mode is not used for live serving.

## Running Services
- **Frontend:** `http://localhost:3000` (Next.js production mode)
- **Backend:** `http://localhost:8000` (FastAPI, 25 seed stations)
- **API proxy:** All `/api/*` requests on port 3000 proxy to port 8000
- **Service Worker:** v2, static-assets-only cache strategy

## Files Modified
- `backend/.env` — expanded CORS origins
- `backend/app/config.py` — default CORS origins (multi-port)
- `frontend/public/sw.js` — rewritten: no HTML/JS cache
- `frontend/src/app/layout.tsx` — SW registration with `updateViaCache: 'none'`
- `frontend/src/app/globals.css` — removed dark mode invert filter
- `frontend/src/app/page.tsx` — added map pan on text search
- `frontend/src/components/Map.tsx` — `dark` prop for CARTO dark tiles
- `frontend/src/components/SearchBar.tsx` — decorative icon → proper submit button
- `frontend/src/lib/api.ts` — relative URLs via Next.js proxy
- `frontend/next.config.js` — removed `output: "standalone"`
