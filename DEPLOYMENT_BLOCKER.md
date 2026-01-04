# Deployment Blocker: Vite + Vercel Serverless Functions Incompatibility

## Problem

The current project uses **Vite** as the frontend framework, but Vercel serverless functions (API routes in `/api`) are **not deploying**. All API endpoints return 404 in production.

## Root Cause

According to the PLAN.md (from kontekst-fase9.md), the original architecture specified:
- Frontend: **Next.js** (App Router) + TypeScript + Tailwind + shadcn/ui
- Backend: **Next.js Route Handlers** / API

However, the actual implementation used:
- Frontend: **Vite** 6.2 + React 19 + TypeScript

### Why This Matters

- **Next.js**: Has built-in support for API routes in `/api` directory that automatically become Vercel serverless functions
- **Vite**: Does NOT have automatic API route support; Vercel treats it as a static site builder

## Attempted Fixes (All Failed)

1. ✗ Flattened API structure (removed subdirectories)
2. ✗ Converted to CommonJS (`module.exports` instead of `export default`)
3. ✗ Added `api/package.json` with `type: commonjs`
4. ✗ Created `vercel.json` with explicit builds/routes configuration
5. ✗ Simplified `vercel.json` to minimal config
6. ✗ Created simple JavaScript test endpoints

**Result**: All API endpoints continue to return 404 in production.

## Evidence

```bash
# Simple test endpoint
$ curl https://executive-marketops-dashboard-pgxoskmvx-arti-consults-projects.vercel.app/api/simple-test
The page could not be found
NOT_FOUND

# Health endpoint
$ curl https://executive-marketops-dashboard-pgxoskmvx-arti-consults-projects.vercel.app/api/health
The page could not be found
NOT_FOUND

# All TypeScript endpoints
$ curl https://executive-marketops-dashboard-pgxoskmvx-arti-consults-projects.vercel.app/api/reports
The page could not be found
NOT_FOUND
```

## Options Forward

### Option A: Migrate to Next.js (Recommended - Aligns with Original Plan)

**Pros:**
- Aligns with original PLAN.md architecture
- Native API route support
- Better TypeScript integration
- Server components for better performance
- Proven Vercel integration

**Cons:**
- Significant refactoring required
- Need to migrate Vite config to Next.js config
- Need to convert React components to Next.js App Router structure
- Estimated effort: 8-12 hours

**Migration Steps:**
1. Create new Next.js 15 project with App Router
2. Move `/src` pages to `/app` directory with Next.js conventions
3. Keep `/api` structure (Next.js will detect it automatically)
4. Update imports and routing
5. Test locally
6. Deploy

### Option B: Keep Vite + Separate API Deployment

**Pros:**
- Keep existing Vite frontend (no refactor)
- API can be deployed independently
- Can use any serverless platform (Vercel Functions as separate project, AWS Lambda, etc.)

**Cons:**
- Need to manage two separate deployments
- CORS configuration required
- More complex CI/CD
- Frontend and API URLs will be different

**Implementation Options:**
- **B1**: Create separate Vercel project just for API functions
- **B2**: Use Vercel's monorepo support (requires restructuring)
- **B3**: Deploy API to different platform (AWS Lambda, Google Cloud Functions, Railway, etc.)

### Option C: Convert to Static Site + External Backend

**Pros:**
- Simplest deployment (static site hosting)
- Can use any backend service

**Cons:**
- Requires external backend infrastructure
- Most work to set up
- Doesn't leverage Vercel's serverless capabilities

## Recommendation

**Choose Option A: Migrate to Next.js**

Rationale:
1. Original plan specified Next.js
2. Vercel is optimized for Next.js
3. Better long-term maintainability
4. Native TypeScript + API routes support
5. All current code (API endpoints, components) can be migrated with minimal changes

## Current Status

- ❌ Production deployment broken (API routes 404)
- ✅ Local development works (with `vite dev` + `vercel dev` separately)
- ❌ Cannot test AI chat feature in production
- ❌ Phase 4 completion blocked

## Next Steps

**Awaiting user decision:**
1. Which option to proceed with (A, B, or C)?
2. If Option A (Next.js): Approve migration effort
3. If Option B: Decide on deployment strategy (B1/B2/B3)

**Once decided, I will:**
- Update PLAN.md with chosen approach
- Execute migration/refactor
- Redeploy and verify
- Resume Phase 4 testing (AI chat with OpenAI)
