# Kontekst: Fase 1 – Database Schema & Seed Data

## 2026-01-04 - Phase 1 Complete: Database Schema with Norwegian Enums + Seed Data

**What**: Created and deployed Supabase PostgreSQL database with Prisma schema matching frontend Norwegian enum values. Seeded with October 2024 Proponent report demo data.

**Why**: MVP vertical slice requires database foundation with realistic data for testing API integration. Critical fix: Frontend uses Norwegian enum values (`Produkter`, `Mulighet`, `Risiko`, etc.) which must be matched exactly in backend to avoid mapping complexity.

**How**:
1. Created Supabase project `pharma-marketops` (ID: fzptyrcduxazplnlmuoh)
2. Designed Prisma schema with:
   - Norwegian enums: `Track {Produkter, Landskap, Portefølje}`, `InsightType {Mulighet, Risiko, Trend, Evidens, Partnerkandidat}`
   - 11 models: Workspace, User, Product, Report, Insight, Source, InsightSource (M:M), ReportInsight (M:M), Financial, ActionItem, DailyBriefing
   - Multi-tenant via `workspaceId` on all models
   - JSON columns for flexible data (Report.sections)
3. Applied migration via Supabase MCP `apply_migration` tool
4. Generated Prisma Client
5. Created seed script (`prisma/seed.ts`) with October 2024 Proponent data
6. Executed seed via Supabase MCP `execute_sql`:
   - 1 Workspace, 1 Product, 2 Sources, 2 Insights (1 Mulighet, 1 Risiko)
   - 1 Report with 3 JSON sections, Report↔Insight links, 1 Financial record
7. Verified with query: confirmed 2 insights, 2 sources linked correctly

**Technical Decisions**:
- Used Supabase MCP tools to bypass needing database password
- Prisma 7 config: removed `url` from datasource block (now in prisma.config.ts)
- Report.date stored as String (YYYY-MM) to match frontend format
- Scores stored as separate columns (significanceScore, impactScore, riskScore, credibilityScore) for queryability

**Verification Query Result**:
```json
{
  "id": "report-proponent-2024-10",
  "title": "Proponent: Oktober Statusrapport",
  "date": "2024-10",
  "track": "Produkter",
  "relatedEntity": "Proponent",
  "score": 78,
  "trend": "up",
  "insight_count": 2,
  "source_count": 2
}
```

**Risks**: None. Schema deployed successfully, seed data verified, Norwegian enums match frontend.

**Files Created**:
- `/prisma/schema.prisma` - Database schema with Norwegian enums
- `/prisma/seed.ts` - Seed script with October 2024 Proponent data
- `/prisma.config.ts` - Prisma 7 configuration
- `/prisma/migrations/[timestamp]_init/migration.sql` - Initial migration

**Files Modified**:
- `/.env.local` - Added Supabase credentials and DATABASE_URL
- `/package.json` - Added prisma seed script configuration

**Next**: Phase 2 - API Infrastructure (create Prisma client singleton, middleware, mappers, health check endpoint)

---
