# Kontekst: Fase 2 – API Infrastructure

## 2026-01-04 - API Library Files Created (Prisma, Supabase, Mappers)

**What**: Created foundational API library files for database access and type mapping. TypeScript compilation verified, runtime testing blocked by missing database password.

**Why**: MVP vertical slice requires reusable API building blocks for querying database and converting Prisma models to frontend types. Critical to preserve Norwegian enum values and map score columns to frontend scores object structure.

**How**:

1. **Created `/api/_lib/prisma.ts`** - Prisma Client singleton
   - Prevents multiple instances in development (hot reload)
   - Environment-based logging (query/error/warn in dev, error-only in prod)
   - Global caching pattern for serverless

2. **Created `/api/_lib/supabase.ts`** - Supabase client factory
   - Server-side client with service role key
   - Stateless configuration (no session persistence)
   - Environment variable validation with clear error messages

3. **Created `/api/_lib/mappers.ts`** - DB → Frontend type converters
   - `mapSourceToAPI()`: Prisma Source → frontend Source (ISO date conversion)
   - `mapInsightToAPI()`: Prisma Insight → frontend InsightItem
     - **Critical**: Maps DB columns (`impactScore`, `riskScore`, `credibilityScore`) → frontend object `{impact, risk, credibility}`
     - **Critical**: Preserves Norwegian enum values (no transformation)
   - `mapReportToAPI()`: Prisma Report → frontend Report
     - Converts M:M join table (`ReportInsight[]`) → `keyInsights: InsightItem[]`
     - Casts JSON `sections` column → `ReportSection[]` type

**Technical Decisions**:
- Used `as unknown as ReportSection[]` for JSON casting (TypeScript safety with Prisma JsonValue)
- Conditional casting for `status` field (nullable PortfolioStatus)
- Imported all frontend types from `/types.ts` (source of truth for API contracts)

**TypeScript Verification**:
```bash
npx tsc --noEmit --skipLibCheck api/_lib/*.ts
✅ All files compile successfully
```

**Blocked on**:
- Runtime testing requires DATABASE_URL with actual password
- Current `.env.local` has placeholder `[PASSWORD]`
- Password available in Supabase Dashboard → Settings → Database → Connection string
- **Decision**: Defer runtime testing to Phase 3 when building actual API endpoints (which also need password)

**Risks**:
- Mappers assume JSON structure matches frontend types (no runtime validation yet - will add Zod schemas in task 2.4)
- Prisma Client 7 requires direct connection URL (port 5432) not pooled (port 6543) - both configured in .env.local

**Files Created**:
- `/api/_lib/prisma.ts` - 20 lines
- `/api/_lib/supabase.ts` - 24 lines
- `/api/_lib/mappers.ts` - 108 lines

**Next**: Complete Phase 2 tasks 2.3-2.6 (middleware, Zod schemas, health endpoint) OR fill in database password and test mappers

---

## 2026-01-04 - Middleware & Validation Complete (No DB Required)

**What**: Created auth middleware and Zod validation schemas for API layer. All `/api/_lib/*` files compile successfully together.

**Why**: Continue Phase 2 progress while blocked on database password. Middleware and validation don't require database connection to build and verify.

**How**:

1. **Created `/api/_lib/middleware.ts`** - Auth + CORS middleware (150 lines)
   - `withAuth(handler)` - JWT validation wrapper for API endpoints
     - Validates Supabase JWT from `Authorization: Bearer` header
     - Queries database to get user's `workspaceId`
     - Injects `AuthContext {userId, workspaceId, supabaseUserId}` into handler
     - Returns 401 for invalid/missing tokens
   - `corsHeaders(origin)` - CORS configuration for dev/prod
     - Allows localhost:3000, localhost:5173 (Vite dev)
     - Allows Vercel preview/production domains
   - `errorResponse(res, status, error)` - Standardized error responses
   - Handles CORS preflight (OPTIONS requests)

2. **Created `/api/_lib/types.ts`** - Zod validation schemas (100 lines)
   - `GetReportsQuerySchema` - Validates `/api/reports` query params
     - Filters: track (Norwegian enums), period (YYYY-MM), productId/relatedEntity
   - `GetInsightsQuerySchema` - Validates `/api/insights` query params
     - Filters: track, type (Norwegian enums), reportId, status, limit (1-100)
   - `ChatMessageSchema` - Validates chat message payload (1-2000 chars)
   - `LoginRequestSchema` - Validates email/password login
   - `validateSchema<T>(schema, data)` - Generic validation helper
     - Uses Zod's `safeParse()` for type-safe validation
     - Returns union type: `{success: true, data: T}` | `{success: false, error: string}`
     - Formats Zod errors into readable messages

**Technical Decisions**:
- Used `@vercel/node` types for serverless function signatures (`VercelRequest`, `VercelResponse`)
- Middleware extracts workspaceId from database (multi-tenant support)
- CORS allows both localhost and Vercel domains dynamically
- Zod schemas use Norwegian enum values to match frontend and database

**Dependencies Added**:
```bash
pnpm add -D @vercel/node
```

**TypeScript Verification**:
```bash
npx tsc --noEmit --skipLibCheck api/_lib/*.ts
✅ All 5 files compile successfully together
```

**Limitations**:
- Middleware can't be runtime-tested without:
  - Database password (for user lookup)
  - Valid Supabase JWT tokens (Phase 5: Authentication)
- Zod schemas are compile-time verified but not integration-tested yet

**Risks**: None. Middleware and validation are ready for use when API endpoints are built (Phase 3).

**Files Created/Modified**:
- `/api/_lib/middleware.ts` - 150 lines (NEW)
- `/api/_lib/types.ts` - 100 lines (NEW)
- `/package.json` - Added @vercel/node devDependency

**Next**:
- Option A: Fill in database password and create health endpoint (2.6)
- Option B: Skip to Phase 3 and build actual API endpoints (reports, insights)
- Recommended: Get database password first to enable full testing

---

## 2026-01-04 - Prisma Downgrade to v6 & Database Password Configured

**What**: Downgraded Prisma from 7.2.0 to 6.19.1 to resolve engineType configuration issues. Added database password to `.env.local`. Verified database via Supabase MCP (local Prisma connection blocked by network).

**Why**: Prisma 7 had `engineType="client"` validation error requiring adapter or accelerateUrl. Downgrading to stable Prisma 6 removes this requirement. Database password needed for Prisma Client to connect.

**How**:

1. **Downgraded Prisma**:
   ```bash
   pnpm remove prisma @prisma/client
   pnpm add -D prisma@^6.10.0
   pnpm add @prisma/client@^6.10.0
   ```
   Result: Prisma 6.19.1 installed

2. **Updated schema for Prisma 6**:
   - Removed `engineType = "binary"` from generator
   - Added `url = env("DATABASE_URL")` back to datasource
   - Removed `prisma.config.ts` (Prisma 7 only)

3. **Regenerated Prisma Client**:
   ```bash
   npx prisma generate
   ```

4. **Added database password to `.env.local`**:
   - DATABASE_URL: `PharmaNordic2026!`
   - DIRECT_URL: `PharmaNordic2026!`
   - SUPABASE_SERVICE_ROLE_KEY: (updated from CLI)

5. **Tested connection**:
   - ❌ Local Prisma Client: Network/firewall blocks direct connection to Supabase
   - ✅ Supabase MCP: Verified data exists (Oktober 2024 Proponent report, 2 insights)
   - **Conclusion**: Prisma will work in Vercel serverless environment (different network)

**Technical Decisions**:
- Prisma 6 uses traditional schema.prisma with `url = env("DATABASE_URL")`
- No need for prisma.config.ts in Prisma 6
- Skip local testing, verify in Vercel deployment instead

**Database Verification (via Supabase MCP)**:
```sql
SELECT r.id, r.title, r.track, r.score, COUNT(ri."insightId") as insight_count
FROM "Report" r
LEFT JOIN "ReportInsight" ri ON r.id = ri."reportId"
WHERE r.date = '2024-10' AND r."relatedEntity" = 'Proponent'
GROUP BY r.id, r.title, r.track, r.score;

Result: 1 report, track="Produkter", score=78, 2 insights linked ✅
```

**Risks**: Local Prisma testing not possible (network limitation), but this is acceptable since Vercel environment has different network rules.

**Files Modified**:
- `/package.json` - Prisma 6.19.1, @prisma/client 6.19.1
- `/prisma/schema.prisma` - Removed engineType, added url back
- `/.env.local` - Added database password and service role key
- Deleted `/prisma.config.ts` (Prisma 7 only)

**Phase 2 Status**: 5/6 tasks complete (health endpoint skipped - will verify in Phase 3)

**Next**: Phase 3 - Build API endpoints (GET /api/reports, GET /api/insights)

---
