# Next.js Migration - Deployment Checklist

## Environment Variables Required in Vercel

Before deploying, ensure these environment variables are set in the Vercel dashboard:

### Production Environment Variables
Navigate to: Vercel Dashboard → Project → Settings → Environment Variables

```bash
# Database (Supabase)
DATABASE_URL=<Supabase connection pooler URL with ?pgbouncer=true>
DIRECT_URL=<Supabase direct connection URL port 5432>

# Supabase Auth & API
SUPABASE_URL=<Supabase project URL>
SUPABASE_ANON_KEY=<Supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<Supabase service role key>

# Frontend (Public - NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SUPABASE_URL=<Same as SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Same as SUPABASE_ANON_KEY>

# OpenAI
OPENAI_API_KEY=<OpenAI API key>

# Optional (auto-set by Vercel)
NODE_ENV=production
VERCEL_URL=<auto-set by Vercel>
```

## Pre-Deployment Checklist

- [x] ✅ Phase 1: Project Setup Complete
- [x] ✅ Phase 2: Frontend Migration Complete
- [x] ✅ Phase 3: API Migration Complete
- [x] ✅ Phase 4: Local Testing Complete
- [x] ✅ Build succeeds (`pnpm build`)
- [x] ✅ All API endpoints respond correctly locally
- [x] ✅ Auth middleware works
- [x] ✅ Changes committed to git
- [ ] ⏳ Environment variables set in Vercel
- [ ] ⏳ Push to main branch
- [ ] ⏳ Monitor Vercel deployment
- [ ] ⏳ Test production endpoints

## Deployment Steps

### Step 1: Verify Environment Variables
1. Go to Vercel Dashboard
2. Select project: `executive-marketops-dashboard`
3. Go to Settings → Environment Variables
4. Verify all 8 required variables are set for **Production** environment

### Step 2: Push to Trigger Deployment
```bash
git push origin master
```

This will trigger automatic deployment via Vercel Git integration.

### Step 3: Monitor Deployment
- Watch build logs in Vercel dashboard
- Check for any build errors
- Wait for deployment URL

### Step 4: Production Verification
Once deployed, test these endpoints:

```bash
# Replace <deployment-url> with actual Vercel URL

# 1. Health check (no auth required)
curl https://<deployment-url>/api/health

# Expected: {"status":"ok","timestamp":"...","environment":"production"}

# 2. Reports endpoint (requires auth - should return 401)
curl https://<deployment-url>/api/reports

# Expected: {"error":"Unauthorized","message":"Missing or invalid Authorization header"}

# 3. Homepage (should redirect to /login)
curl -I https://<deployment-url>/

# Expected: HTTP 307, Location: /login

# 4. Login page (should load)
curl https://<deployment-url>/login | grep "<title>"

# Expected: <title>Executive MarketOps Dashboard</title>
```

## Success Criteria

✅ All endpoints return expected responses (not 404)  
✅ Health endpoint returns 200  
✅ Protected endpoints return 401 without auth  
✅ Frontend loads and redirects to login  
✅ No console errors in browser  
✅ Network tab shows API calls to `/api/*` routes (not 404)

## Rollback Plan

If deployment fails:
1. Check Vercel build logs for errors
2. Fix locally and push again
3. If critical: Revert to previous deployment in Vercel dashboard

## Post-Deployment

After successful deployment:
- [ ] Document deployment URL in kontekst
- [ ] Update Phase 5 status to "completed"
- [ ] Proceed with Phase 6 (Cleanup old /api directory)

---

**Critical Success Factor**: All `/api/*` endpoints must return 200 or 401 (with auth), NOT 404.
This was the blocker we fixed with the Next.js migration.
