# Vercel Function Duration Audit

**Date:** 2026-08-21  
**Purpose:** Preserve the investigation into the unexpected Vercel free-plan function-duration usage and track the most urgent fixes.

## Executive Summary

The strongest explanation for the high function-duration usage is repeated browser polling of the weather and GFA endpoints. The API handlers proxy requests to NavCanada and remain active while those upstream requests complete. Several client components poll independently, sometimes once per minute per airport.

The current code can therefore generate many long-running serverless invocations from a single open browser tab. Multiple tabs, users, or public/bot traffic multiply the cost.

Vercel function duration is affected by both execution time and allocated memory. A reported usage of approximately 300 GB-hours against a 100 GB-hour allowance means the project used roughly three times the included amount. This is not necessarily a 300 GB data-transfer problem.

## API Inventory

### `/api/weather`

**File:** `src/app/api/weather/route.ts`

- Calls `getWeather()` and waits for the NavCanada weather API.
- Requests METAR, TAF, and NOTAM data together.
- The upstream request has a 10-second abort timeout in `weatherService.ts`.
- Normal response headers now use `public, s-maxage=60, stale-while-revalidate=30`; explicit manual refreshes remain `no-store`.
- The `force=true` query option bypasses the in-memory cache.
- Every request consumes a serverless invocation while the upstream request and JSON processing complete.

### Weather changes implemented

- Normal weather responses are cacheable at the Vercel edge for 60 seconds, with 30 seconds of stale-while-revalidate.
- Routine client requests use stable `/api/weather?code=...` URLs; timestamp query parameters and routine `force=true` requests were removed.
- The API validates four-character airport codes before contacting NavCanada.
- The active weather card refreshes visible airports every two minutes, which checks METAR/SPECI updates and catches TAF AMDs between scheduled TAF releases.
- Hidden tabs skip background refreshes; Quick Search and the legacy routing client use the same two-minute interval.
- The existing combined METAR/TAF/NOTAM response shape is preserved, so current weather, NOTAM, and TAF rendering continues to work.

This is a freshness policy, not a real-time guarantee: an upstream report can appear after the previous check. With the current two-minute client interval and short edge cache, an active visible tab normally receives the latest available response within approximately two to three minutes. A future product-specific API can use separate METAR, TAF, and NOTAM cache intervals to reduce payload size further without changing this freshness target.

### Weather freshness requirements

Weather products should not all use the same refresh interval:

| Product | Normal issuance or update behavior | Practical client policy |
|---|---|---|
| METAR/SPECI | Can be reported whenever observations change | Refresh frequently for active airports and show report age |
| TAF | Scheduled at `00:00Z`, `06:00Z`, `12:00Z`, and `18:00Z` | Refresh around scheduled releases, then use a moderate interval |
| TAF AMD | Issued dynamically at any time when significant or unexpected weather changes | Continue periodic TAF checks between scheduled releases; do not rely only on the four scheduled times |
| NOTAM | Can be amended or issued outside a fixed four-times-daily schedule | Use a separate moderate refresh policy and show fetched age |

The TAF schedule cannot be used as the only refresh trigger. A TAF AMD may arrive at any time, so a release-aware implementation should combine scheduled-release refreshes with periodic checks between releases. The interval should be long enough to avoid repeated function invocations but short enough for the dispatch operation's risk tolerance. A practical starting point is a shared TAF check every 5--10 minutes for active airports, with a faster check around `00:00Z`, `06:00Z`, `12:00Z`, and `18:00Z`.

The UI should retain and display the last successful TAF, its issue or amendment time when supplied by the source, and the application's fetched time. If an upstream request fails, keep the last successful report visible and mark it as stale rather than replacing it with empty data.

### `/api/gfa`

**File:** `src/app/api/gfa/route.ts`

- Calls NavCanada directly.
- Has a 10-second timeout.
- Adds a five-minute cache header to the response, but client timestamp query strings and request behavior reduce the value of that cache.
- Always requests both `GFA/CLDWX` and `GFA/TURBC`, even when only one type was requested.
- Parses the returned items before responding.

### `/api/runways`

**File:** `src/app/api/runways/route.ts`

- Reads and parses the entire local runway CSV on every request.
- The CSV is approximately 3.6 MB.
- This is synchronous work and can be wasteful, but requests are user-triggered and this is not the main runaway-duration pattern.
- The route now honors the `airport` query parameter and returns only that airport while preserving the existing `{ [airport]: string[] }` response shape used by x-wind.
- The parsed runway map is cached at module scope for the lifetime of a warm function instance, so the 3.6 MB CSV is not reparsed on every request.
- Airport-specific responses use `s-maxage=86400` and `stale-while-revalidate=3600` cache headers.
- A no-query request still returns the complete map for backward compatibility, but the application caller supplies an airport code.

### `/api/latlong`

**File:** `src/app/api/latlong/route.ts`

- Reads and parses the same full CSV on every request.
- This is also secondary compared with weather polling.
- The route ignores the `airport` query parameter and returns the complete latitude/longitude map.

## Highest-Risk Request Amplification

### 1. Per-airport weather polling in `WeatherCardsClient`

**File:** `src/app/dashboard/weather/WeatherCardsClient.jsx`

- Initial and normal refreshes now use a stable `/api/weather?code=...` URL.
- A separate interval is created per airport.
- The refresh interval is now two minutes for visible tabs.
- Hidden tabs skip background refreshes.
- The Vercel edge can reuse normal responses for 60 seconds and revalidate them for another 30 seconds.

With 10 tracked airports, this path now schedules about 5 checks per minute, or about 300 per hour, before edge-cache reuse. The edge cache can reduce origin function executions further.

### 2. Duplicate one-minute weather polling in the main weather component

**File:** `src/app/dashboard/weather/client-component.jsx`

- `fetchAllWeatherData()` fetches every airport from saved routings.
- It runs immediately and then every two minutes.
- This can overlap with `WeatherCardsClient` polling the same airports.
- The weather page renders `WeatherCardsClient`, so both implementations can be active in the same workflow.

This is the most important duplication to remove: one shared polling owner should update weather for a given airport.

### 3. GFA fetch duplication

**Files:**

- `src/app/dashboard/weather/client-component.jsx`
- `src/app/dashboard/weather/WeatherCardsClient.jsx`

The previous implementation had duplicate GFA effects in the legacy weather client and a separate per-airport refresh implementation in `WeatherCardsClient`.

Consequences:

- Duplicate initial GFA requests.
- Independent polling intervals per active airport.
- Timestamp query strings defeat normal cache reuse.
- Each GFA request fetches both GFA products upstream.

### GFA changes implemented

The release-aware GFA implementation now includes:

- `src/app/lib/services/gfaReleaseSlot.js`, which calculates the latest and next UTC release slots at `05:30Z`, `11:30Z`, `17:30Z`, and `23:30Z`.
- `src/app/lib/services/gfaReleaseSlot.test.js`, with tests immediately before, at, and after the release boundaries.
- `releaseSlot`, `gfaType`, and `fetchedAt` metadata on each GFA response and persisted card result.
- Server-side raw and selected-result caches keyed by airport, GFA type, and release slot, with in-flight upstream deduplication.
- A delayed next-release timer in `WeatherCardsClient` instead of five-minute or peak-window GFA intervals.
- A small deterministic airport jitter after each release to avoid synchronized request spikes.
- Removal of normal GFA timestamp query parameters.
- Removal of the duplicate GFA effects from the legacy weather client; `WeatherCardsClient` is now the active GFA fetch owner.
- Cacheable GFA responses using `s-maxage` and `stale-while-revalidate` headers.

The existing GFA payload shape remains `{ data: [{ type: 'gfa', text: '...' }] }`; metadata is additive, so `GfaCardDisplay` continues to parse the same text and render the same image frames. On each new payload it now selects the frame whose `sv`/`ev` validity window contains the current UTC time, while retaining all validity-frame buttons for manual review. Previously stored GFA entries without release metadata are treated as stale and fetched once so they become release-aware.

The release-slot tests pass with `npm run test:gfa`. Browser DevTools verification remains a deployment check: one airport/type should issue an initial request, no repeated GFA requests between release slots, and one request after the next release plus the configured delay.

### 4. Explicit cache bypassing

The following patterns defeat caching:

```text
/api/weather?...&force=true
/api/weather?...&t=${Date.now()}
/api/gfa?...&t=${Date.now()}
Cache-Control: no-store, must-revalidate
```

These should be reserved for an intentional manual refresh, not normal background polling.

For TAF specifically, stable cacheable URLs and server-side in-flight deduplication should be used for both scheduled-release checks and between-release AMD checks. A manual refresh may bypass the cache, but routine AMD detection should not use `force=true` and `Date.now()` on every card.

### 5. Server-side timer risk in `weatherService`

**File:** `src/app/lib/services/weatherService.ts`

`weatherService.ts` contains `scheduleAutoRefresh()` and a `setInterval()` implementation. Current server actions pass `autoRefresh: false`, so this does not appear to be the primary current cause. It remains dangerous because a future caller could start a timer inside a serverless runtime. Serverless functions should not be used as indefinite background workers.

## Secondary Findings

### Local CSV reparsing

`runwayService.ts` and `latLongService.ts` synchronously read and parse the full 3.6 MB CSV for every request. Cache the parsed maps at module scope, or generate smaller airport-specific data at build time.

### Large response payloads

The lat/long route still returns the complete map even when the caller requests one airport. The runway route has been optimized to return only the requested airport. In local runtime verification, `/api/runways?airport=CYUL` returned 38 bytes and the legacy full-map response returned 765,279 bytes, while the keyed runway data remained identical for the caller.

### GFA type and upstream response

The GFA route still requests both products from NavCanada because the upstream response is shared and then selects the requested type locally. The combined upstream response is cached once per airport/release slot, while selected responses are cached by airport/type/release slot.

### Public endpoint exposure

If these routes are reachable without authentication, bots or external clients can call them directly. Review Vercel Function Logs and request paths for traffic that does not correspond to real users. Add authentication, rate limiting, or an allowlisted access pattern as appropriate.

### Quick Search

The Quick Search component polls every minute for its selected airport, but it is conditionally mounted by the dashboard layout only when the Quick Search modal is open. It is not always active, but it contributes while users leave that modal open.

### NOAA declination

The x-wind page calls the NOAA declination endpoint directly from the browser. This does not consume a Vercel function invocation, although it is still worth debouncing or caching for usability and upstream courtesy.

## Most Urgent Fix Checklist

### Immediate containment

- [ ] Temporarily disable automatic weather and GFA polling in production, or increase intervals substantially.
- [x] Remove `force=true` from normal weather refreshes.
- [x] Remove timestamp query parameters from normal weather requests.
- [x] Use cacheable normal weather responses; retain `no-store` only for explicit manual refreshes.
- [ ] Check Vercel logs for bots, repeated IPs, unexpected user agents, and unusually slow NavCanada responses.
- [ ] Add authentication or rate limiting to the proxy routes if they are publicly callable.

### Remove duplicate work

- [ ] Choose one component as the owner of weather polling.
- [ ] Remove the duplicate one-minute `fetchAllWeatherData()` polling path or make it consume shared state.
- [ ] Remove the duplicate initial GFA effect.
- [ ] Choose one GFA polling owner per airport/type.
- [ ] Prevent a new interval from being created when an existing airport interval already exists.
- [ ] Confirm all intervals are cleared when an airport is removed, a view closes, or a component unmounts.

### Improve server-side behavior

- [ ] Replace process-local caching with a cache that works across Vercel instances, or use appropriate Vercel/CDN caching.
- [ ] Keep request timeouts, but avoid making every normal request wait up to 10 seconds when the upstream is unhealthy.
- [ ] Request only the required GFA product.
- [x] Cache parsed runway data at module scope and return airport-specific runway data.
- [ ] Cache parsed lat/long data at module scope and return airport-specific lat/long data.
- [ ] Do not use server-side `setInterval()` as a background worker.

## Recommended Target Behavior

A conservative first target:

- One weather request per airport on initial display.
- One shared METAR/SPECI refresh policy for active airports, with report age displayed.
- One shared TAF refresh every 5--10 minutes for active airports, plus checks around `00:00Z`, `06:00Z`, `12:00Z`, and `18:00Z` to catch scheduled releases and any TAF AMD between them.
- One shared NOTAM refresh policy for active airports, with fetched age displayed.
- One GFA request per active airport/type every 15 minutes, unless a user explicitly refreshes.
- Normal requests use cacheable URLs without `Date.now()` query parameters.
- Manual refresh is the only path allowed to bypass cache.
- API routes are protected from unauthenticated abuse.
- Local airport metadata is parsed once per warm instance and returned selectively.

## Request-Volume Example

For 10 airports and one open weather page:

| Source | Current approximate rate |
|---|---:|
| `WeatherCardsClient` weather polling | 10 requests/minute |
| Main weather component routing polling | 10 requests/minute |
| GFA polling, if active | 1 per active airport/interval |
| Initial loads and user actions | Additional bursts |

The first two rows now represent about 10 scheduled checks per minute at most, before edge-cache reuse and multiple tabs or users. Because these requests proxy external APIs and may take seconds to complete, Vercel logs should still be monitored after deployment.

## Validation After Fixes

After deploying changes:

1. Open one production tab and track requests for 15 minutes in browser DevTools.
2. Verify that each airport has only one weather request owner.
3. Verify that closing a view removes its polling requests.
4. Verify that normal URLs no longer contain `force=true` or timestamp query parameters.
5. Review Vercel Function Logs for invocation count and duration.
6. Compare function GB-hours before and after the deployment.
7. Test with multiple tabs because per-tab polling multiplies traffic.

## Important Documentation Drift

The existing `WEATHER_OPTIMIZATION.md` describes two-minute caching and three-minute polling. The current implementation contains one-minute cache/poll constants and additional one-minute client polling paths. Treat the current code and production logs as authoritative until the implementation and documentation are reconciled.

## Relevant Files

- `src/app/api/weather/route.ts`
- `src/app/api/gfa/route.ts`
- `src/app/api/runways/route.ts`
- `src/app/api/latlong/route.ts`
- `src/app/lib/services/weatherService.ts`
- `src/app/lib/services/runwayService.ts`
- `src/app/lib/services/latLongService.ts`
- `src/app/dashboard/weather/client-component.jsx`
- `src/app/dashboard/weather/WeatherCardsClient.jsx`
- `src/app/dashboard/quickSearch/client-component.jsx`
- `src/app/dashboard/layout.tsx`
