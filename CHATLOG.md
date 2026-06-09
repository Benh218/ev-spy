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

### 9. Connector mutation bug on re-seed
- **Root cause:** `mock_data.py:seed_stations` called `s.pop("connectors")` which permanently mutated the module-level `MOCK_STATIONS` dict. Any subsequent re-seed (via refresh button or restart) lost all connectors.
- **Fix:** Use `copy.deepcopy()` before popping so the original list is preserved.

### 10. Suggestions overlay covering the Search button
- **Root cause:** The suggestions dropdown used `className="absolute top-full mt-1 left-0 right-14"`. `right-14` (56px) left only 56px uncovered on the right, but the Search + Location buttons needed ~148px. The suggestions overlay covered the Search button, intercepting click events.
- **Fix:** Moved the suggestions dropdown inside the input's wrapper div (`relative flex-1`) with `left-0 right-0` so it is exactly as wide as the input and never overlaps the buttons.

### 11. Input text invisible in dark mode
- **Root cause:** The `.dark` class on `<html>` set `color-scheme: dark`, which makes browsers render `<input>` text as white by default. The input had `bg-white/95` (light background) but no explicit text color — white text on white = invisible.
- **Fix:** Added `text-gray-900 dark:text-gray-100` to the input, and `text-gray-800 dark:text-gray-200` to suggestion items.

### 12. Nominatim API silently failing
- **Root cause:** The `fetchSuggestions` catch block called `setSuggestions([])` with no logging. Non-200 responses or network errors were silently swallowed. Also, no `res.ok` check meant error pages were parsed as valid JSON.
- **Fix:** Added `if (!res.ok) throw new Error(...)` before parsing.

### 13. Zombie `next-server` process serving stale build (CRITICAL)
- **Root cause:** The original `next start` process (PID 7274) was never killed. `fuser -k 3000/tcp` silently failed (container permissions), and `killall -9 node` didn't match the process name `next-server`. Every subsequent "rebuild and restart" deployed new code to disk, but the zombie server continued serving the very first build's HTML with wrong chunk hashes (`page-230d120cabeb2a1e.js` referenced in HTML but `page-16d38e43310abffe.js` on disk — 400 error). Every browser request for the page chunk failed silently, breaking all interactivity.
- **Root cause discovered via:** Build ID mismatch — running server had `em9n83MkxVlyxDGh803jS` (old) while `.next/BUILD_ID` was `p92e7STC2UF3q7kTtIMa4` (current). Pre-rendered `index.html` on disk had correct hashes, but the server generated fresh HTML with old hashes from its in-memory build manifest.
- **Fix:** Found the zombie via `/proc/7274/exe` → `next-server (v14.2.35)`, killed with `kill -9 7274`. Rebuilt clean (`rm -rf .next && npm run build`) and restarted on port 3000. All chunk hashes now match, all JS files return 200.
- **Lesson:** Never trust `fuser -k` in container environments. Always verify with `cat /proc/*/cmdline | grep next` or a direct build ID comparison.

## Root Cause Summary
Despite 8+ rounds of fixes, the core search functionality never worked because **the server serving port 3000 was a zombie process from the first build**. Every code change (CORS fix, text color, suggestions overlay, Nominatim headers) was applied to disk but never served to the browser. The user was testing the same broken first build for the entire session.

## Running Services
- **Frontend:** `http://localhost:3000` (Next.js production mode, fresh build)
- **Backend:** `http://localhost:8000` (FastAPI, 25 seed stations)
- **API proxy:** All `/api/*` requests on port 3000 proxy to port 8000
- **Service Worker:** v2, static-assets-only cache strategy

## Files Modified (this session)
- `backend/app/services/mock_data.py` — deepcopy before pop
- `frontend/src/components/SearchBar.tsx` — text colors, suggestions positioning, Nominatim error handling
- `CHATLOG.md` — this entry

---

# ChargeSpot Development Session — 2026-06-09

## Problems Fixed

### 14. `loadingRef` guard silently dropped concurrent searches
- **Root cause:** `page.tsx:loadStations` used a `useRef(false)` boolean guard. If the user typed and submitted a search during the initial `useEffect` load (or any concurrent filter change), `loadingRef.current` was `true` and the search was silently dropped. The user pressed Enter, nothing happened, and no error was shown.
- **Fix:** Replaced the boolean guard with a request-counter pattern (`reqIdRef`). Each `loadStations` call gets a unique incrementing ID. Only the response matching the current ID updates state. If a newer request supersedes an older one, the stale response is ignored. No request is ever dropped.
- **Impact:** Searches are never silently discarded. Rapid filter changes or overlapping API calls resolve correctly — the latest call always wins.

### 15. NearbyAmenities NaN distances (C1)
- **Root cause:** `NearbyAmenities.tsx:49` used `el.lng` to read longitude from the Overpass API response. Overpass returns `lon`, not `lng`. `el.lng` is `undefined`, causing `haversine(lat, lng, el.lat, undefined)` to compute `NaN` for every distance.
- **Impact:** All amenity distances displayed as "NaNkm" or "NaNkm".
- **Fix:** Changed `el.lng` to `el.lon`.

### 16. Connector compatibility always returned true (C2)
- **Root cause:** `StationDetail.tsx:176` called `isConnectorCompatible(c.type, { connector_types: [c.type] } as any)`. The second argument is a fake vehicle object containing the connector's own type — the function checks "does this connector match itself?", which is always true. The `as any` cast bypassed TypeScript entirely.
- **Fix:** Imported `getVehicle` from `@/lib/vehicles`, looked up the real vehicle by `vehicleId`, and passed the actual vehicle profile to `isConnectorCompatible`.

### 17. Android keyboard swallowed first keystroke / invisible input text
- **Root cause:** Two compounding issues on mobile (Opera/Brave on Android):
  1. React's controlled input (`value={query}` + `onChange`) fought the Android virtual keyboard's autocomplete/autocorrect engine, causing the first character to be dropped and subsequent text to behave erratically.
  2. In dark mode, `bg-white/95` (nearly white background) with `dark:text-gray-100` (light gray text) made input text nearly invisible on the user's device.
- **Fix (round 1):** Added `dark:bg-gray-800`, `dark:border-gray-700`, placeholder color, and `autoComplete="off"`/`autoCapitalize="off"`/`autoCorrect="off"`/`spellCheck="false"`.
- **Fix (round 2):** Switched to uncontrolled input with inline styles (`color: #000000`, `backgroundColor: #ffffff`) — no Tailwind classes, no dark mode interference, always visible.
- **Fix (round 3 — final):** Completely removed React's event system from the search input. The form now uses a native `addEventListener("submit")` attached in a `useEffect`. The `<input>` has no `value` prop, no `onChange`, no `onInput` — zero React involvement. Suggestions (Nominatim) were removed entirely to eliminate state updates that could interrupt typing. Buttons are compact 48px icons for maximum input width on mobile.
- **Impact:** Typing works normally on Android. Every keystroke is captured. Text is always black on white.

### 18. `fuser -k` silently failed in container (recurring)
- **Root cause:** `fuser` is not available in this container environment. Every `fuser -k 3000/tcp` call throughout the session silently did nothing. Zombie `next-server` processes accumulated, and the user was served stale builds.
- **Fix:** Discovered that `pkill -9 -f next-server` and Node.js `process.kill(pid, 'SIGKILL')` work. Final zombie kill used Node.js directly.
- **Lesson:** Verify process-kill tools exist before relying on them. `which fuser` or `command -v fuser` first. Use `pkill -f` or Node.js `process.kill` as fallbacks.

## Current State
- **Frontend:** `page-55a69d4a874beec3.js` on disk and served. Uncontrolled search input with native event listeners.
- **Backend:** Port 8000, 25 seeded stations, all 12 API endpoints working.
- **Search:** Functional. User confirmed "it works."
- **Known remaining issues (from audit):**
  - M1: `estimateChargeTime` ignores `max_ac_kw` for AC connectors
  - M4: FilterPanel missing dark mode classes
  - Missing: navigation integration (Google Maps / Apple Maps deep link), sort by price, list view
  - Suggestions (Nominatim) removed intentionally — can be restored as enhancement

## Running Services
- **Frontend:** `http://localhost:3000` (Next.js production)
- **Backend:** `http://localhost:8000` (FastAPI, 25 seed stations)
- **API proxy:** All `/api/*` on port 3000 → port 8000

## Files Modified (this session)
- `frontend/src/app/page.tsx` — loadingRef → reqIdRef request counter pattern
- `frontend/src/components/NearbyAmenities.tsx` — el.lng → el.lon (NaN fix)
- `frontend/src/components/StationDetail.tsx` — actual vehicle data for connector compatibility
- `frontend/src/components/SearchBar.tsx` — complete rewrite: native event listeners, inline styles, uncontrolled input, no suggestions, compact mobile layout
- `CHATLOG.md` — this entry
