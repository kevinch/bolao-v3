# Next.js Performance Optimization Plan

**Date**: February 9, 2026
**App**: Bolao v3 - Soccer Betting Groups

## Executive Summary

Performance analysis revealed aggressive no-caching configuration causing every request to hit the server + external APIs. With 7,500 API requests/day available and only 1% used, we can implement smart caching for 3-5x faster page loads.

**Expected Improvements:**

- 3-5x faster page loads on Home, Bolao betting, Results/Standings
- 90%+ reduction in API calls
- Sub-500ms TTFB on first load, <200ms on navigation
- Performance scores 85-95+ on Lighthouse
- **FCP < 1.8s (good) on all pages** - critical for Vercel Analytics red zone

## Critical Issues Discovered

1. **Global no-cache headers** - `no-store, must-revalidate` on all routes blocks browser/CDN/Next.js caching
2. **Aggressive noStore() calls** - Every data fetch bypasses cache unnecessarily
3. **No revalidation strategy** - Missing ISR configuration on pages
4. **Sequential data fetching** - Waterfall patterns in controllers causing delays
5. **Large client bundles** - Unnecessary client components and no code splitting

## Implementation Steps

### Phase 1: Critical Caching Fixes (Quick Wins)

#### ✅ Step 1: Remove Global Cache Blocking

**File**: `next.config.mjs` (lines 13-24)
**Action**: Delete the entire `async headers()` function
**Impact**: Enables browser and CDN caching

#### ✅ Step 2: Remove noStore() Calls

**Files**:

- `app/lib/data.ts` (14 calls removed)
- `app/lib/controllerAdmin.ts` (2 calls removed)
- `app/lib/controllerResults.ts` (1 call removed)
- `app/lib/controllerStandings.ts` (1 call removed)
- `app/lib/controllerLead.ts` (1 call removed)

**Action**: Remove all `noStore()` calls from data fetching functions
**Impact**: Allows Next.js to cache data fetches

#### Step 3: Add Page-Level Revalidation

**Files & Configs**:

- `app/page.tsx` → `export const revalidate = 300` (5 min)
- `app/bolao/[id]/bet/page.tsx` → `export const revalidate = 600` (10 min)
- `app/bolao/[id]/results/page.tsx` → `export const revalidate = 600` (10 min)
- `app/bolao/[id]/standings/page.tsx` → `export const revalidate = 600` (10 min)

**Action**: Add revalidate exports to enable ISR
**Impact**: Pages cached but auto-refresh every 5-10 minutes

#### Step 4: Cache External API Calls

**File**: `app/lib/data.ts` (line ~177)
**Functions**: `fetchLeague()`, `fetchRounds()`, `fetchFixtures()`, `fetchStandings()`

**Action**: Add to fetch options:

```javascript
{
  cache: 'force-cache',
  next: { revalidate: 300 } // 5 minutes
}
```

**Impact**: api-sports.io calls cached, reduces from thousands to ~100/day

### Phase 2: Data Fetching Optimization

#### Step 5: Parallelize Data Fetching

**Files**:

- `app/lib/controllerBet.ts` (lines ~20-31)
- `app/lib/controllerResults.ts`
- `app/lib/controllerStandings.ts`

**Action**: Convert sequential `await` chains to `Promise.all()` where no dependencies exist
**Example**:

```javascript
// Before
const league = await fetchLeague(id)
const rounds = await fetchRounds(id)
const bets = await getBets(id)

// After
const [league, rounds, bets] = await Promise.all([
  fetchLeague(id),
  fetchRounds(id),
  getBets(id),
])
```

**Impact**: Reduces waterfall delays, faster data loading

### Phase 3: Bundle Size Optimization

#### Step 6: Optimize InviteRedirector Loading

**File**: `app/layout.tsx` (lines 35-39)
**Action**: Move `<InviteRedirector />` to conditional rendering or route-specific layout
**Impact**: Reduces client bundle on pages without invite functionality

#### Step 7: Convert Unnecessary Client Components

**File**: `app/ui/news/newsList.tsx`
**Action**: Remove `"use client"` from components without interactivity
**Impact**: Smaller client bundles, more server-side rendering

#### Step 8: Dynamic Import Heavy Components

**Files**:

- `app/components/bolaoEditModal.tsx`
- `app/components/bolaoDeleteModal.tsx`
- Admin panel components

**Action**: Wrap in dynamic imports:

```javascript
const BolaoEditModal = dynamic(() => import("./bolaoEditModal"), {
  ssr: false,
})
```

**Impact**: Code splitting, faster initial page load

### Phase 4: Additional Optimizations

#### ✅ Step 9: Optimize Font Loading

**File**: `app/layout.tsx` (line 13)
**Action**: Added `display: 'swap'` and `preload: true` to IBM_Plex_Sans configuration
**Impact**: Prevents font blocking render (FCP improvement), faster perceived load, font files preloaded

#### Step 10: Enhance On-Demand Revalidation

**File**: `app/api/revalidate/route.ts`
**Action**: Accept path parameter to revalidate specific pages
**Use Case**: Trigger during live games to refresh scores on demand
**Example**: `POST /api/revalidate?path=/bolao/123/results`

## Verification Checklist

- [ ] Run Lighthouse audit on `/` - expect Performance 85-95+, **FCP < 1.8s**
- [ ] Run Lighthouse on `/bolao/[id]/bet` - expect Performance 85-95+, **FCP < 1.8s**
- [ ] Run Lighthouse on `/bolao/[id]/results` - expect Performance 85-95+, **FCP < 1.8s**
- [ ] Check Vercel Analytics - FCP should move from red to green/yellow zone
- [ ] Check Network tab: First load TTFB <500ms
- [ ] Check Network tab: Subsequent navigation <200ms
- [ ] Verify caching: Reload page, see 304 responses and `(cache)` markers
- [ ] Monitor API usage: Should drop to <100 requests/day
- [ ] Test revalidation: Trigger endpoint and verify page updates

## Testing Commands

```bash
# Build and test production
npm run build
npm run start

# Run Lighthouse
npx lighthouse http://localhost:3000 --view
npx lighthouse http://localhost:3000/bolao/1/bet --view

# Check bundle size
npm run build -- --profile

# Monitor API calls (check network tab or API dashboard)
```

## Key Decisions

- **5-10 min revalidation for match data** - Acceptable trade-off since live scores aren't critical; on-demand revalidation available during active games
- **Keep Clerk calls dynamic** - Auth must stay fresh for security, but cached queries for non-auth user data
- **Quick wins first approach** - Steps 1-4 address 90% of performance issues, then tackle bundle optimization
- **Cache invalidation during live games** - Use on-demand revalidation endpoint when matches are active

## Notes

- **API Budget**: 7,500 requests/day, ~1% currently used - plenty of headroom for caching strategy
- **Live Scores**: Not critical, no WebSocket implementation needed
- **User Experience**: Caching acceptable everywhere except during active game periods
- **Priority Pages**: Home, Bolao betting pages, Results/Standings

## Success Metrics

- Performance score: Current baseline → Target 85-95+
- **FCP (First Contentful Paint): Target < 1.8s (good), must avoid > 3.0s (red)**
- TTFB: Target <500ms first load, <200ms navigation
- API calls: Target 90%+ reduction
- User perception: Pages should feel "snappy" on navigation
