# PLAN.md – MarketOps Dashboard Backend Integration

**Dato opprettet**: 2026-01-04
**Sist oppdatert**: 2026-01-04

---

## Formål

Integrere fullstack backend (Vercel Functions + Supabase PostgreSQL) med eksisterende Vite+React frontend. Målet er produksjonsklar plattform med autentisering, database, API og AI-chat.

---

## Faser og milepæler

### MVP Scope (Fase 1-6): Vertical Slice
**Mål**: Én komplett rapporttype (Proponent Produktstatusrapport Oktober 2024) fra DB til UI til AI-chat.

| Fase | Navn | Varighet | Status |
|------|------|----------|--------|
| 0 | Setup & Dependencies | 1-2t | ✅ Fullført (20 min) |
| 1 | Database Schema & Seed | 2-3t | ✅ Fullført (1.5t) |
| 2 | API Infrastructure | 2-3t | ✅ Fullført (2.5t) |
| 3 | Vertical Slice (Proponent) | 4-5t | ✅ Fullført (2.5t) |
| 4 | AI Chat (Report-Scoped) | 3-4t | 🔜 Pending |
| 5 | Authentication | 2-3t | ✅ Fullført (2t) |
| 6 | Deployment | 1-2t | ✅ Fullført (1.5t) ⚠️ |

**Total MVP**: 16-22 timer (2-3 arbeidsdager)
**Spent so far**: ~10.5 timer (Fase 0-3, 5-6)
**Remaining**: Fase 4 (~3-4 timer)

---

### Future Scope (Post-MVP)
Ekspandere etter MVP er verifisert i produksjon:

| Fase | Navn | Prioritet |
|------|------|-----------|
| 7 | Market Landscape Report | Høy |
| 8 | Portfolio Scan + Kanban | Høy |
| 9 | Overview Page (Aggregation) | Medium |
| 10 | Action Items CRUD | Medium |
| 11 | Daily Briefing | Medium |
| 12 | Company Oracle (Global Chat) | Lav |
| 13 | Financials API | Lav |

---

## Teknologivalg

**Backend**:
- Vercel Serverless Functions (API routes i `/api`)
- Supabase PostgreSQL (hosted DB + Auth + RLS)
- Prisma ORM (type-safe queries + migrations)

**Frontend Integration**:
- React Query (server state management)
- Supabase Auth SDK (autentisering client-side)
- Existing useState (UI state)

**AI**:
- OpenAI GPT-4 Turbo (konfigurerbar model)
- Report-scoped RAG (fetcher kontekst fra DB)

---

## Kritiske designbeslutninger

### 1. Enum Values (KRITISK!)
Frontend bruker **norske enum-verdier**:
- `Track.PRODUCT = 'Produkter'` (ikke 'PRODUCT')
- `InsightType.OPPORTUNITY = 'Mulighet'` (ikke 'OPPORTUNITY')

**Løsning**: Prisma schema bruker norske verdier direkte → ingen mapping layer.

### 2. Report.keyInsights
Frontend embedder insights i Report-objektet.
Backend: normalisert m:m tabell `ReportInsight` (reportId ↔ insightId).
API mapper: join og returner som array i `keyInsights`.

### 3. Auth Strategy
Supabase Auth JWT valideres i middleware (`withAuth`).
Workspace isolation via Row Level Security (RLS) policies på alle tabeller.

---

## Nåværende Status

**Aktiv fase**: Authentication Complete - Ready for Phase 4 (AI Chat)
**Siste milepæl**: Fase 5 fullført - Authentication deployed to production ✅
**Production URL**: https://executive-marketops-dashboard-labjhw49u-arti-consults-projects.vercel.app

**Demo Credentials**:
- Email: demo@pharmanordic.com
- Password: PharmaNordic2026!

**Neste steg**:
- **Anbefalt**: Manuell testing av authentication flow i browser
- **Deretter**: Fase 4 - AI Chat (krever OpenAI API key)
- **Alternativ**: Fix TypeScript warnings (cleaner builds)

**MVP Status**: ~85% complete (Faser 0-3, 5-6 ✅ | Fase 4 🔜)

**Known Issues**:
- ⚠️ TypeScript warnings in API layer (non-blocking, inherited from Phase 6)
- ⚠️ API endpoints not manually verified with authentication yet
- ⚠️ Workspace isolation not tested in production

---

## Suksesskriterier (MVP)

- [x] Bruker kan logge inn med demo-credentials ✅ (Phase 5)
- [x] Proponent Oktober 2024 rapport laster fra database ✅
- [x] Rapport vises korrekt (dashboard + document tabs) ✅
- [x] Strategiske hendelser (insights) vises med kilder ✅
- [ ] AI chat svarer på spørsmål om rapporten (Phase 4)
- [ ] Chat-svar siterer kilder korrekt (Phase 4)
- [x] Ingen hardkodet data i ProductRadar-siden ✅
- [x] Deployment vellykket, tilgjengelig på prod-URL ✅
- [ ] API endpoints verifisert i production med authentication (manual testing required)

---

## Risikoer og mitigasjon

| Risiko | Sannsynlighet | Konsekvens | Mitigasjon |
|--------|---------------|------------|------------|
| Enum mismatch (norsk vs. engelsk) | ~~Høy~~ Løst | Kritisk | Verifisert i types.ts, bruker norske verdier |
| CORS issues (dev/prod) | Medium | Høy | Konfigurer i middleware for begge miljøer |
| Auth token expiry | Medium | Medium | Implementer refresh logic i AuthContext |
| OpenAI rate limits | Lav | Medium | Error handling + fallback messages |
| DB migration conflicts | Lav | Høy | Test lokalt før prod deploy |
| Cold start latency | Lav | Lav | Akseptabelt for MVP (Vercel varmer opp) |

---

## Referanser

- Detaljert implementasjonsplan: `/Users/sanderhelmers-olsen/.claude/plans/wise-juggling-fog.md`
- Produktkrav: [PRD.md](PRD.md:1)
- Utviklingsinstrukser: [claude.md](claude.md:1)
