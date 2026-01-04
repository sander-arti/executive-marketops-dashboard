# Pharma Nordic — MarketOps Intelligence Platform (PRD)

**Versjon:** 1.0  
**Dato:** 2026-01-03  
**Bruk:** Spesifikasjon for implementasjon i Claude Code (backend + DB + funksjonalitet), i tråd med nåværende Bolt.new-frontend.

---

## 1) Sammendrag

Pharma Nordic MarketOps er et **premium/enterprise “Executive OS”** for strategi, markedsinnsikt og porteføljeutvikling. Plattformen standardiserer innsikt til **månedlige rapporter** (produkter, marked, porteføljescan) og binder dem sammen i en daglig **Oversikt** med agenda og anbefalte handlinger.

Kjernen i produktet er:

1) **Oversikt (ledercockpit)**
- AI-oppsummering av situasjonen
- KPIer: porteføljehelse, kritiske risikoer, nye muligheter
- Strategisk agenda (top fokusområder)
- Anbefalte handlinger (checkliste light)
- Dagens briefing (modal) + Månedens brief

2) **Rapportmotor (3 spor)**
- **Våre produkter:** *Produktstatusrapport per produkt per måned*
- **Markedsrapport:** *Nordisk markedsrapport per måned*
- **Produktradar:** *Månedlig porteføljescan* + operativ dealflow-kanban

Alle rapporter har samme UX-struktur:
- Tabs: **Dashboard** + **Rapportdokument**
- Seksjon: Executive Summary + AI analyse + “Les hele rapporten”
- Seksjon: **Strategiske hendelser** (events) med drilldown drawer (Sammendrag / Hvorfor / Kilder / Neste steg)
- Høyre sidepanel: **AI Assistant** (report-scoped chat)

3) **Bedriftsorakel (global chat)**
- Ad hoc analyse på tvers av alle rapporter + (valgfritt) finanstall
- “Quick prompts” for å starte samtaler
- Krever kildehenvisninger for tillit

Plattformen skal bygges med fokus på **tillit, sporbarhet og enkelhet**, uten å falle tilbake til rolleviews, approvals/MLR eller innholdsproduksjon.

---

## 2) Mål, ikke-mål og suksesskriterier

### 2.1 Mål
- **30 sekunder til overblikk** (Oversikt) og **4 minutter til dypdykk** (rapportdokument).
- Gjøre det trivielt å svare på:
  - *Hva skjer?*
  - *Hvorfor betyr det noe?*
  - *Hva bør vi gjøre nå?*
- Sørge for at alle strategiske påstander i UI kan spores til **kilder**.

### 2.2 Ikke-mål (v1)
- Ingen rollebaserte dashboards/rolle-switching.
- Ingen MLR/approvals, claims-bibliotek eller “innholdsgenerering”.
- Ingen publishing-integrasjoner (CMS/SoMe/e-post).
- Ingen fullverdig CRM (kun enkel kanban-staging og avvis/vurder).
- Ingen krav om sanntid: produktet er primært **daglig + månedlig cadence**.

### 2.3 Suksesskriterier (MVP)
**Bruk:**
- Dagens briefing åpnes og markeres som lest (minst 3 dager per uke).
- Minst én rapport leses (dashboard eller dokument) per uke.
- Minst én anbefalt handling markeres som utført per uke.

**Tillit:**
- 100% av strategiske hendelser har ≥1 kilde.
- Report-scoped AI Assistant og Bedriftsorakel returnerer svar med **referanser** (report sections/sources), ikke bare fritekst.

**Teknisk:**
- Rapportgenerering er idempotent per `type + period (+ product)`.
- Partial failure håndteres: rapport genereres med `issues[]` hvis enkelte kilder feiler.

---

## 3) Brukere

### 3.1 Primærbruker: Ledelse / ledergruppe
- Trenger prioritering, konsekvens og neste steg uten å lese alt.
- Må kunne stole på at påstander er kildebasert.

### 3.2 Sekundærbrukere
- **Commercial/Market:** følger refusjon, pris, konkurrenter, apotekkjeder, markedsposisjon.
- **BD/Portfolio:** bruker Produktradar (scan + dealflow-kanban).

---

## 4) Begreper og objekter

- **Report**: månedlig rapportobjekt (dashboard + dokument).
- **Event (Strategisk hendelse)**: kuratert funn i en rapport, med scoring og kilder.
- **Source**: kilde som støtter event/rapport (URL eller intern filref).
- **DailyBriefing**: daglig oppsummering av nye oppdateringer.
- **MonthlyBrief**: månedens executive brief på tvers av alle spor.
- **ActionItem**: anbefalt handling (checkliste light), kan markeres som utført.
- **Candidate**: partner-/innlisensieringskandidat i Produktradar dealflow.
- **AI Assistant (Report-scoped)**: chat som kun bruker en rapport som kontekst.
- **Bedriftsorakel**: global chat på tvers av rapportkorpus.

---

## 5) Produktstruktur (IA) — som frontend nå viser

### 5.1 Navigasjon
- Oversikt
- Bedriftsorakel
- Våre produkter
- Markedsrapport
- Produktradar
- Innstillinger

### 5.2 Rapporttyper
1) **Produktstatusrapport** (`PRODUCT_STATUS`)
- Nøkkelmetrikker (f.eks. finansiell ytelse, markedsposisjon) + tidsserier
- Strategiske hendelser (mulighet/risiko)
- Rapportdokument (longform)

2) **Nordisk markedsrapport** (`MARKET_LANDSCAPE`)
- Executive summary + strategiske hendelser (trend/risiko/evidens/mulighet)
- Rapportdokument (makro/trender/konkurrenter)

3) **Månedlig porteføljescan** (`PORTFOLIO_SCAN`)
- Executive summary + kandidat-hendelser med “match %”
- Rapportdokument (inkl. scanningparametre)

### 5.3 Produktradar: to moduser
- **Månedlig scan** (rapport)
- **Deal Flow & Radar** (kanban): `NEW` → `REVIEW` → `DUE_DILIGENCE` (+ `REJECTED`)

---

## 6) Brukerflyter

### 6.1 Daglig ritual: Dagens briefing
1) Bruker åpner Oversikt.
2) Åpner “Dagens briefing”.
3) Ser grupper:
   - Produktnyheter
   - Markedssignaler
   - Porteføljeradar (kandidater)
4) Klikker seg videre til relevant rapport/radar.
5) Marker som lest.

**Akseptkriterier**
- Briefing har `totalUpdates` og `requiresAttentionCount` (om dere ønsker).
- “Markér som lest” lagrer per bruker (minst `lastReadAt`).

### 6.2 Månedlig ritual: Månedens brief
1) Bruker klikker “Les Månedens brief” fra Oversikt.
2) Leser cross-portfolio brief:
   - 3–5 hovedpoeng
   - topp risikoer og muligheter
   - anbefalt fokus
   - lenker til underliggende rapporter/events.

**Akseptkriterier**
- Brief er knyttet til `period=YYYY-MM`.
- Hvert hovedpoeng kan spores til minst én report/event.

### 6.3 Rapportlesing: Dashboard → event drilldown
1) Bruker åpner en rapport.
2) Ser Executive Summary.
3) Klikker en strategisk hendelse.
4) Drawer åpner med tabs: Sammendrag/Hvorfor/Kilder/Neste steg.

**Akseptkriterier**
- Drawer viser score (betydning/risiko/troverdighet).
- Kilder-tab viser minst én kilde.

### 6.4 Produktradar dealflow
1) Bruker åpner Produktradar → Deal Flow & Radar.
2) Ser kanban med kandidater.
3) Åpner kandidat-drawer.
4) Klikker “Start vurdering” → flytter `NEW` → `REVIEW`.
5) “Avvis kandidat” → flytter til `REJECTED`.

**Akseptkriterier**
- Staging er idempotent og audit-logges (minst who/when).

### 6.5 AI Assistant (report-scoped) og Bedriftsorakel
- Report-scoped: svar skal baseres på valgt rapport og dens kilder.
- Orakel: svar baseres på hele rapportkorpus (+ evt. finansdata).

**Akseptkriterier**
- Hvert svar inkluderer “Kilder brukt” (report + sections + source links).

---

## 7) Funksjonelle krav (MVP)

### 7.1 Oversikt
**Data som vises:**
- AI-oppsummering (headline + kort analyse)
- KPI cards:
  - porteføljehelse (score + label)
  - kritiske risikoer (count + SLA, f.eks. “innen 30 dager”)
  - nye muligheter (count + høy prioritet count)
- Strategisk agenda (top 3 fokusområder)
  - hvert agenda-kort har “source” (fra produkt-/markeds-/porteføljerapport)
  - CTA til underliggende side
- Anbefalte handlinger (liste)
  - prioritet (høy/middels)
  - “fra: <kilde>”
  - actions: marker som utført, dismiss

**Krav:**
- Oversikt må bygges som en **aggregert view** over månedens report-data + open action items + briefing status.

### 7.2 Våre produkter (produktstatusrapport)
- Produktvelger (Proponent/Bentrio/…)
- Periodevelger (YYYY-MM)
- Dashboard-tab:
  - executive summary + ai analysis
  - metrikker/tidsserier (i MVP: kan være seed data)
  - strategiske hendelser (events)
- Rapportdokument-tab:
  - longform markdown/sections
- AI Assistant (report-scoped chat)

### 7.3 Markedsrapport (nordisk landskap)
- Samme rapportpattern som over.
- Strategiske hendelser med typer: trend/risiko/evidens/mulighet.
- Rapportdokument med seksjoner (makro/trender/konkurrenter).
- AI Assistant.

### 7.4 Produktradar
**A) Månedlig scan (rapport)**
- Samme rapportpattern.
- Strategiske hendelser er “partnerkandidater” med match %.

**B) Deal Flow & Radar (kanban)**
- Kolonner: NEW, REVIEW, DUE_DILIGENCE.
- Candidate-kort: navn, one-liner, match%.
- Drawer: tabs + kilder + CTA “Start vurdering”, “Avvis”.

### 7.5 Bedriftsorakel
- Chat UI med:
  - quick prompts (salgstrend, konkurranse, strategi, risiko)
  - input + send
  - (valgfritt) vedlegg/filopplasting senere
- Må kunne svare med kilder.

### 7.6 Innstillinger (v1: view-only)
- Workspace info
- Liste over produkter
- Liste over markeder
- (valgfritt) “Datakilder” og “Policy” som placeholder

---

## 8) Datamodell (anbefalt)

> Målet er en enkel, robust modell som matcher UI 1:1. Felter kan lagres som JSON der det gir fleksibilitet.

### 8.1 Kjerneentiteter

#### Workspace
- `id`, `name`

#### User
- `id`, `workspaceId`, `email`, `name`

#### Product
- `id`, `workspaceId`, `name`, `tags[]`, `active`

#### Report
- `id`, `workspaceId`
- `type`: `PRODUCT_STATUS | MARKET_LANDSCAPE | PORTFOLIO_SCAN | EXEC_MONTHLY_BRIEF`
- `period`: `YYYY-MM`
- `productId?` (kun for PRODUCT_STATUS)
- `title`
- `executiveSummaryTitle`, `executiveSummaryBody`
- `aiAnalysis` (kort tekst)
- `readTimeMinutes?`
- `dashboardJson` (metrics, charts data, counters)
- `documentJson` (sections: title + markdown)
- `generatedAt`, `sourceVersion` (hvilket datasett/kjøring)
- `issuesJson[]` (f.eks. missing_sources)

#### Event
- `id`, `reportId`, `workspaceId`
- `eventType`: `OPPORTUNITY | RISK | TREND | EVIDENCE | PARTNER_CANDIDATE`
- `title`
- `tagsJson` (produkt/land/marked)
- `scoresJson`: `{ significance: 0-10, risk: 0-10, credibility: 0-10, matchPercent?: 0-100 }`
- `drawerJson`:
  - `summaryText`
  - `keyPoint`
  - `whyBullets[]`
  - `nextSteps[]`
- `createdAt`

#### Source
- `id`, `workspaceId`
- `title`, `url`, `publisher`, `publishedAt`
- `sourceType`: `NEWS | STUDY | GUIDELINE | REGULATORY | INTERNAL | OTHER`
- `snippet?` (utdrag)

#### EventSource (m:m)
- `eventId`, `sourceId`

#### ActionItem
- `id`, `workspaceId`
- `title`
- `priority`: `HIGH | MEDIUM | LOW`
- `status`: `OPEN | DONE | DISMISSED`
- `sourceRefJson`: `{ kind: 'report'|'event'|'candidate', id: string, label?: string }`
- `dueDate?`
- `completedAt?`, `completedByUserId?`
- `createdAt`

#### DailyBriefing
- `id`, `workspaceId`, `date` (YYYY-MM-DD)
- `headline`, `summary`
- `sectionsJson`:
  - productUpdates[]
  - marketSignals[]
  - portfolioAlerts[]
- `generatedAt`, `issuesJson[]`

#### DailyBriefingRead
- `id`, `briefingId`, `userId`, `readAt`

### 8.2 Produktradar (dealflow)

#### Candidate
- `id`, `workspaceId`
- `name`, `country`
- `oneLiner`
- `matchPercent`
- `stage`: `NEW | REVIEW | DUE_DILIGENCE | REJECTED`
- `scoresJson`: `{ significance, risk, credibility }`
- `drawerJson` (samme struktur som Event.drawerJson)
- `createdAt`, `updatedAt`

#### CandidateSource (m:m)
- `candidateId`, `sourceId`

#### CandidateAuditLog (minimal)
- `id`, `candidateId`, `userId`, `fromStage`, `toStage`, `createdAt`

---

## 9) AI/LLM-krav (for implementasjon)

### 9.1 Prinsipp: “Kilder først”
- LLM skal aldri produsere en strategisk påstand uten å knytte den til minst én kilde.
- Hvis kilder mangler: generer event/rapport med `issuesJson` og lav troverdighet.

### 9.2 Structured outputs (anbefalt)
Bruk schema-validering (Zod eller tilsvarende) for:
- Report generation (`Report` + `Event[]`)
- Daily briefing
- Monthly brief
- Chat responses (inkl. citations)

### 9.3 Chat med kilder (to moduser)
- **Report-scoped chat:** kontekst = report + events + sources + document sections.
- **Global orakel:** kontekst = siste N reports + index av dokumenter (+ evt. finans).

**Krav til svar:**
- `answerMarkdown`
- `citations[]`: `{ type: 'report_section'|'source', id, label, url? }`

### 9.4 Sikkerhets-/kvalitetsguardrails
- Ingen PII/pasientdata.
- Ikke hallusinér kilder: hvis ikke funnet i corpus → si “ikke funnet i rapportene” og foreslå hva som må lastes opp.

---

## 10) Datainnhenting og generering (MVP → senere)

### 10.1 MVP (realistisk)
- Start med **seed/manuell data** (mock) for å få hele platformen funksjonell.
- Legg inn en enkel “Admin/Jobs”-trigger for å generere rapporter/briefing (manuelt kall).

### 10.2 Etter MVP (connectors)
- Nyheter/RSS
- PubMed/EuropePMC
- Clinical trials registries
- Regulatoriske kilder (EMA/FDA/nasjonalt)
- Interne dokumenter (PDF, CSV)

### 10.3 Job-system (anbefalt)
- `JobRun` + `JobTask` for:
  - generate_product_report(period, productId)
  - generate_market_report(period)
  - generate_portfolio_scan(period)
  - generate_daily_briefing(date)
  - generate_monthly_brief(period)

Krav:
- retries
- idempotens
- logging av tokenbruk

---

## 11) Sikkerhet, compliance og tilgang

### 11.1 Dataprinsipper
- Lagre kun business data; unngå persondata utover bruker-konto.
- Ikke lagre hemmeligheter i DB (API keys i env/secrets manager).

### 11.2 Auth (anbefalt)
- Supabase Auth eller tilsvarende (SSO kan komme senere).

### 11.3 Audit (MVP-minimum)
- Candidate stage endringer logges.
- ActionItem completion lagres med hvem/når.

---

## 12) Observability og produktmåling

### 12.1 Logging
- Job runs: status, varighet, error cause.
- LLM calls: model, tokens, cost-estimate (valgfritt), latency.

### 12.2 Metrikker
- DAU/WAU
- Briefing read rate
- Report open rate
- Action completion rate
- Chat usage + citations rate

---

## 13) Ikke-funksjonelle krav

- **Ytelse:** Oversikt og rapport-sider må laste “føles raskt” (p95 < 2s på normal bedriftslinje).
- **Robusthet:** rapporter kan vises selv om enkelte kilder feiler (issues vises).
- **Skalerbarhet:** flere workspaces og flere rapporter per måned uten designendring.

---

## 14) MVP Scope og faser (for Claude Code)

### Fase 1 — Fundament
- DB + migrations
- CRUD for workspace, products
- Report + Event + Source (read-only i starten)
- Candidate pipeline (read + stage update)

### Fase 2 — Oversikt
- Aggregert overview endpoint
- Action items (create/update/complete)
- Daily briefing (get/mark read)

### Fase 3 — Generering (minimal)
- Job endpoints (manuelt trigget)
- Generer *dummy* rapporter via templates + seed-data, men gjennom samme pipeline og schema.

### Fase 4 — Chat (kildebasert)
- Report-scoped chat med citations
- Bedriftsorakel (global)

### Fase 5 — Real data (etter behov)
- første connector(e) + dedupe + ingest

---

## 15) Risikoer og mitigering

- **Hallusinasjoner / svake kilder:** enforce citations + schema validation + issues.
- **Scope creep (MLR/content/rolleviews):** hold non-goals harde i v1.
- **Datagrunnlag:** start manual-first; bygg connectors etter at UX og modell sitter.
- **Overkomplisering av pipeline:** hold få stages og tydelige CTAer.

---

## 16) Åpne spørsmål (kan avklares under implementasjon)

1) Perioder: kun `YYYY-MM` i v1, eller også 7D/30D/kvartal?
2) Skal “Månedens brief” være `Report.type=EXEC_MONTHLY_BRIEF` (anbefalt), eller en separat entitet?
3) Skal “Anbefalte handlinger” genereres fra `Event.nextSteps` i MVP, eller kurateres manuelt?
4) Hvor mange måneder historikk skal periodeselector vise (6/12/24)?
5) Hvilke finanstall finnes faktisk, og i hvilket format?

---

## 17) Appendix — anbefalte API-kontrakter (v1)

> Kan implementeres som Next.js Route Handlers, tRPC eller REST. Under er en enkel anbefalt kontrakt.

### Oversikt
- `GET /api/overview?period=YYYY-MM`
  - aiSummary
  - kpis
  - agendaItems[]
  - actionItems[]
  - dailyBriefingMeta

### Reports
- `GET /api/reports?type=PRODUCT_STATUS&period=YYYY-MM&productId=<id>`
- `GET /api/reports?type=MARKET_LANDSCAPE&period=YYYY-MM`
- `GET /api/reports?type=PORTFOLIO_SCAN&period=YYYY-MM`
- `GET /api/reports?type=EXEC_MONTHLY_BRIEF&period=YYYY-MM`
- `GET /api/reports/:id`
- `GET /api/reports/:id/document`
- `GET /api/reports/:id/events`

### Events
- `GET /api/events/:id` (inkl. sources)

### Actions
- `GET /api/actions?status=OPEN&period=YYYY-MM`
- `POST /api/actions` (create)
- `PATCH /api/actions/:id` (mark done/dismiss/update)

### Briefing
- `GET /api/briefing/daily?date=YYYY-MM-DD`
- `POST /api/briefing/daily/:id/read`

### Candidates
- `GET /api/candidates?stage=NEW|REVIEW|DUE_DILIGENCE|REJECTED`
- `GET /api/candidates/:id`
- `PATCH /api/candidates/:id` (stage/reject)

### Chat
- `POST /api/chat/oracle`
- `POST /api/chat/report/:reportId`

### Admin/Jobs (beskyttet)
- `POST /api/jobs/generate-report` body: `{ type, period, productId? }`
- `POST /api/jobs/generate-daily-briefing` body: `{ date }`

