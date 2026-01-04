// MarketOps Dashboard - Database Seed Script
// Seeds October 2024 Proponent Product Status Report

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: 'demo-workspace' },
    update: {},
    create: {
      id: 'demo-workspace',
      name: 'Pharma Nordic Demo',
    },
  });
  console.log('✅ Workspace created:', workspace.name);

  // Create product: Proponent
  const proponent = await prisma.product.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.id,
        name: 'Proponent'
      }
    },
    update: {},
    create: {
      name: 'Proponent',
      description: 'Ledende respiratorisk behandling',
      workspaceId: workspace.id,
    },
  });
  console.log('✅ Product created:', proponent.name);

  // Create sources
  const source1 = await prisma.source.create({
    data: {
      title: 'Nye refusjonsretningslinjer i Danmark favoriserer vår profil',
      url: 'https://sundhedsdatastyrelsen.dk/da/nyheder/2024/refusion-update',
      publisher: 'Danish Health Authority',
      publishedAt: new Date('2024-10-15'),
      workspaceId: workspace.id,
    },
  });

  const source2 = await prisma.source.create({
    data: {
      title: 'Konkurrent lanserer aggressiv priskampanje i Sverige',
      url: 'https://tlv.se/press/2024/pricing-competition',
      publisher: 'TLV (Swedish Pricing Authority)',
      publishedAt: new Date('2024-10-10'),
      workspaceId: workspace.id,
    },
  });
  console.log('✅ Sources created: 2');

  // Create insights
  const insight1 = await prisma.insight.create({
    data: {
      title: 'Proponent: Nye refusjonsretningslinjer i Danmark favoriserer vår profil',
      type: 'Mulighet',
      track: 'Produkter',
      relatedProducts: ['Proponent'],
      markets: ['DK'],
      significanceScore: 92,
      impactScore: 9,
      riskScore: 2,
      credibilityScore: 9,
      whyBullets: [
        'Nye retningslinjer favoriserer vår virkningsmekanisme',
        'Estimert 15% økning i refusjonsberettigede pasienter',
        'First-mover advantage hvis vi handler innen 30 dager',
      ],
      recommendedNextSteps: [
        'Oppdater markedsføringsstrategi for Danmark Q4',
        'Brief Key Account Managers om nye muligheter',
        'Vurder prisposisjonering mot konkurrenter',
      ],
      workspaceId: workspace.id,
    },
  });

  await prisma.insightSource.create({
    data: {
      insightId: insight1.id,
      sourceId: source1.id,
    },
  });

  const insight2 = await prisma.insight.create({
    data: {
      title: 'Proponent: Konkurrent lanserer aggressiv priskampanje',
      type: 'Risiko',
      track: 'Produkter',
      relatedProducts: ['Proponent'],
      markets: ['SE'],
      significanceScore: 89,
      impactScore: 8,
      riskScore: 7,
      credibilityScore: 9,
      whyBullets: [
        'Konkurrent X reduserer pris med 20% i Sverige',
        'Kan påvirke markedsandel Q4 2024',
        'Må respondere strategisk for å beholde posisjon',
      ],
      recommendedNextSteps: [
        'Analyser konkurransedyktig prisposisjonering',
        'Vurder value-based messaging vs. priskrig',
        'Møte med Commercial team innen 7 dager',
      ],
      workspaceId: workspace.id,
    },
  });

  await prisma.insightSource.create({
    data: {
      insightId: insight2.id,
      sourceId: source2.id,
    },
  });
  console.log('✅ Insights created: 2');

  // Create report: Proponent Oktober 2024
  const report = await prisma.report.create({
    data: {
      title: 'Proponent: Oktober Statusrapport',
      date: '2024-10',
      track: 'Produkter',
      relatedEntity: 'Proponent',
      summary: 'Proponent viser sterk fremgang i Danmark grunnet nye refusjonsvilkår, men møter økt priskonkurranse i Sverige.',
      score: 78,
      trend: 'up',
      aiSummary: 'Hovedfokuset denne måneden er å kapitalisere på den danske markedsendringen. Risikoen i Sverige vurderes som håndterbar med målrettede tiltak.',
      sections: [
        {
          title: 'Executive Summary',
          content: 'Proponent har hatt en sterk måned med betydelige positive utviklinger i Danmark. Nye refusjonsretningslinjer favoriserer vår virkningsmekanisme og åpner for økt markedspenetrasjon. Samtidig møter vi økt priskonkurranse i Sverige som krever strategisk respons.',
        },
        {
          title: 'Markedsdynamikk',
          content: '**Danmark:** Nye refusjonsretningslinjer trer i kraft fra november 2024. Dette gir oss et vesentlig konkurransefortrinn og estimert 15% økning i pasientgrunnlag.\n\n**Sverige:** Konkurrent X har lansert aggressiv priskampanje med 20% prisreduksjon. Vi må vurdere respons innen 30 dager for å unngå markedsandelstap.\n\n**Norge:** Stabil posisjon uten vesentlige endringer.',
        },
        {
          title: 'Strategiske anbefalinger',
          content: '1. **Danmark (Høy prioritet):** Akselerere markedsføringsinnsats for å kapitalisere på nye retningslinjer\n2. **Sverige (Medium prioritet):** Utvikle value-based respons på priskonkurranse\n3. **Nordisk koordinering:** Sikre konsistent messaging på tvers av markeder',
        },
      ],
      productId: proponent.id,
      workspaceId: workspace.id,
    },
  });
  console.log('✅ Report created:', report.title);

  // Link insights to report
  await prisma.reportInsight.createMany({
    data: [
      { reportId: report.id, insightId: insight1.id },
      { reportId: report.id, insightId: insight2.id },
    ],
  });
  console.log('✅ Report-Insight links created');

  // ===== MARKET LANDSCAPE REPORT (Track: Landskap) =====

  // Create landscape-specific sources
  const landscapeSource1 = await prisma.source.create({
    data: {
      title: 'Nordic Pharma Market Report Q3 2024',
      url: 'https://nordic-pharma-association.org/reports/2024-q3',
      publisher: 'Nordic Pharmaceutical Association',
      publishedAt: new Date('2024-10-01'),
      workspaceId: workspace.id,
    },
  });

  const landscapeSource2 = await prisma.source.create({
    data: {
      title: 'Swedish Regulatory Changes: Digital Health Integration',
      url: 'https://lakemedelsverket.se/digital-health-2024',
      publisher: 'Swedish Medical Products Agency',
      publishedAt: new Date('2024-10-12'),
      workspaceId: workspace.id,
    },
  });

  const landscapeSource3 = await prisma.source.create({
    data: {
      title: 'Norwegian Price Transparency Initiative',
      url: 'https://helfo.no/pricing-transparency-2024',
      publisher: 'HELFO Norway',
      publishedAt: new Date('2024-10-08'),
      workspaceId: workspace.id,
    },
  });
  console.log('✅ Landscape sources created: 3');

  // Create landscape insights
  const landscapeInsight1 = await prisma.insight.create({
    data: {
      title: 'Regulatorisk endring: Sverige åpner for digital helseplattformer',
      type: 'Mulighet',
      track: 'Landskap',
      relatedProducts: [], // Cross-product opportunity
      markets: ['SE'],
      significanceScore: 88,
      impactScore: 8,
      riskScore: 3,
      credibilityScore: 9,
      whyBullets: [
        'Nye retningslinjer letter godkjenning av digitale helseløsninger',
        'Mulighet for integrert diagnostikk og behandlingsoppfølging',
        'First-mover advantage hvis vi bygger digital strategi nå',
      ],
      recommendedNextSteps: [
        'Utforsk partnerskap med digital health tech-selskaper',
        'Kartlegg hvilke produkter kan dra nytte av digital integrasjon',
        'Workshop med R&D og Commercial teams innen 30 dager',
      ],
      workspaceId: workspace.id,
    },
  });

  await prisma.insightSource.create({
    data: {
      insightId: landscapeInsight1.id,
      sourceId: landscapeSource2.id,
    },
  });

  const landscapeInsight2 = await prisma.insight.create({
    data: {
      title: 'Trend: Økt prispress og transparenskrav i hele Norden',
      type: 'Trend',
      track: 'Landskap',
      relatedProducts: [], // Affects all products
      markets: ['NO', 'SE', 'DK'],
      significanceScore: 91,
      impactScore: 7,
      riskScore: 6,
      credibilityScore: 9,
      whyBullets: [
        'Norge innfører nye transparenskrav for legemiddelprising',
        'Økt offentlig fokus på legemiddelkostnader i hele Norden',
        'Kan påvirke forhandlingsposisjon og margin fremover',
      ],
      recommendedNextSteps: [
        'Forbered value-based pricing dokumentasjon for alle produkter',
        'Styrk health economics team',
        'Proaktiv stakeholder engagement med myndigheter',
      ],
      workspaceId: workspace.id,
    },
  });

  await prisma.insightSource.createMany({
    data: [
      { insightId: landscapeInsight2.id, sourceId: landscapeSource1.id },
      { insightId: landscapeInsight2.id, sourceId: landscapeSource3.id },
    ],
  });

  const landscapeInsight3 = await prisma.insight.create({
    data: {
      title: 'Evidens: Biosimilar-markedet vokser 25% årlig i Norden',
      type: 'Evidens',
      track: 'Landskap',
      relatedProducts: [],
      markets: ['NO', 'SE', 'DK'],
      significanceScore: 85,
      impactScore: 8,
      riskScore: 7,
      credibilityScore: 9,
      whyBullets: [
        'Biosimilarer tar markedsandeler på tvers av terapiområder',
        'Myndighetene incentiverer biosimilar-bruk aktivt',
        'Må vurdere biosimilar-strategi for egne produkter',
      ],
      recommendedNextSteps: [
        'Analyser eksponering mot biosimilar-konkurranse per produkt',
        'Vurder eget biosimilar-program',
        'Styrk differensieringsstrategier basert på value, ikke bare pris',
      ],
      workspaceId: workspace.id,
    },
  });

  await prisma.insightSource.create({
    data: {
      insightId: landscapeInsight3.id,
      sourceId: landscapeSource1.id,
    },
  });
  console.log('✅ Landscape insights created: 3');

  // Create Market Landscape Report
  const landscapeReport = await prisma.report.create({
    data: {
      title: 'Nordisk Markedsrapport: Oktober 2024',
      date: '2024-10',
      track: 'Landskap',
      relatedEntity: null, // No specific product - Nordic market overview
      summary: 'Det nordiske legemiddelmarkedet preges av økt digitalisering, prispress og vekst i biosimilarer. Sverige leder an med nye digitale helseplattformer.',
      score: 72,
      trend: 'down', // Cautious due to pricing pressure
      aiSummary: 'Hovedtrendene i oktober er positive (digital health) og negative (prispress). Anbefaler proaktiv strategi på begge fronter for å bevare konkurranseposisjon.',
      sections: [
        {
          title: 'Executive Summary',
          content: 'Det nordiske legemiddelmarkedet gjennomgår betydelige strukturelle endringer. Positive faktorer inkluderer Sveriges åpning for digitale helseløsninger, som gir nye muligheter for produktintegrasjon. Samtidig møter vi økende prispress og transparenskrav på tvers av Norden, samt kraftig vekst i biosimilar-markedet (25% årlig).',
        },
        {
          title: 'Regulatoriske endringer',
          content: '**Sverige - Digital Health:** Nye retningslinjer fra oktober 2024 letter godkjenning av digitale helseløsninger integrert med legemidler. Dette åpner for companion diagnostics og remote patient monitoring.\n\n**Norge - Pristransparens:** HELFO innfører nye krav til dokumentasjon av prissetting. Gjelder fra Q1 2025.\n\n**Danmark:** Ingen vesentlige regulatoriske endringer i oktober.',
        },
        {
          title: 'Markedsdynamikk',
          content: '**Biosimilarer:** Fortsatt sterk vekst (25% YoY) drevet av myndighetsincentiver og kostnadsfokus i helsevesenet. Største påvirkning innen onkologi og autoimmune sykdommer.\n\n**Prispress:** Økende offentlig og politisk fokus på legemiddelkostnader. Krever styrket health economics-dokumentasjon og value-based pricing-strategier.\n\n**Digital integrasjon:** Sverige er først ute i Norden. Forventer Norge og Danmark følger etter i løpet av 2025.',
        },
        {
          title: 'Strategiske anbefalinger',
          content: '1. **Kort sikt (0-3 mnd):** Forbered value-based pricing-dokumentasjon for alle produkter i forkant av norske transparenskrav\n2. **Medium sikt (3-6 mnd):** Utforsk digital health partnerships for svensk marked\n3. **Lang sikt (6-12 mnd):** Utvikle biosimilar-defensiv strategi for eksponerte produkter',
        },
      ],
      productId: null, // No specific product
      workspaceId: workspace.id,
    },
  });
  console.log('✅ Market Landscape report created:', landscapeReport.title);

  // Link insights to landscape report
  await prisma.reportInsight.createMany({
    data: [
      { reportId: landscapeReport.id, insightId: landscapeInsight1.id },
      { reportId: landscapeReport.id, insightId: landscapeInsight2.id },
      { reportId: landscapeReport.id, insightId: landscapeInsight3.id },
    ],
  });
  console.log('✅ Landscape Report-Insight links created');

  // ===== PORTFOLIO REPORT (Track: Portefølje) =====

  // Create portfolio-specific sources
  const portfolioSource1 = await prisma.source.create({
    data: {
      title: 'Nordic Pharma News: NordicBio AS - Breakthrough Inhalation Platform',
      url: 'https://nordic-pharma-news.com/nordicbio-inhalation-2024',
      publisher: 'Nordic Pharma News',
      publishedAt: new Date('2024-10-05'),
      workspaceId: workspace.id,
    },
  });

  const portfolioSource2 = await prisma.source.create({
    data: {
      title: 'Swedish Health Tech Report: Digital Adherence Solutions Market Analysis',
      url: 'https://swedish-healthtech.se/digital-adherence-2024',
      publisher: 'Swedish Health Tech Association',
      publishedAt: new Date('2024-10-08'),
      workspaceId: workspace.id,
    },
  });

  const portfolioSource3 = await prisma.source.create({
    data: {
      title: 'European Biosimilar Association: Nordic Pipeline Review Q3 2024',
      url: 'https://biosimilar-eu.org/nordic-pipeline-q3-2024',
      publisher: 'European Biosimilar Association',
      publishedAt: new Date('2024-10-03'),
      workspaceId: workspace.id,
    },
  });

  const portfolioSource4 = await prisma.source.create({
    data: {
      title: 'Clinical Trials.gov: Oslo Pain Research Phase II Results',
      url: 'https://clinicaltrials.gov/study/NCT05892341',
      publisher: 'ClinicalTrials.gov',
      publishedAt: new Date('2024-10-12'),
      workspaceId: workspace.id,
    },
  });

  const portfolioSource5 = await prisma.source.create({
    data: {
      title: 'Danish Biotech Report: Companion Diagnostics Landscape 2024',
      url: 'https://danish-biotech.dk/companion-dx-2024',
      publisher: 'Danish Biotech Association',
      publishedAt: new Date('2024-10-07'),
      workspaceId: workspace.id,
    },
  });

  const portfolioSource6 = await prisma.source.create({
    data: {
      title: 'EMA Orphan Database & Swedish Life Science: Rare Disease Assets Review',
      url: 'https://ema.europa.eu/orphan-designations-sweden-2024',
      publisher: 'European Medicines Agency / Swedish Life Science',
      publishedAt: new Date('2024-10-10'),
      workspaceId: workspace.id,
    },
  });
  console.log('✅ Portfolio sources created: 6');

  // Create partner candidate insights
  const portfolioInsight1 = await prisma.insight.create({
    data: {
      title: 'NordicBio AS: Innovativ inhalasjonsplattform for respiratoriske behandlinger',
      type: 'Partnerkandidat',
      track: 'Portefølje',
      relatedProducts: [],
      markets: ['NO', 'SE'],
      significanceScore: 87,
      impactScore: 8,
      riskScore: 4,
      credibilityScore: 9,
      fitScore: 87,
      status: 'NEW',
      whyBullets: [
        'Kompatibel med vår respiratoriske portefølje (Proponent m.fl.)',
        'Påvist klinisk data i Phase IIb studier',
        'Sterk IP-posisjon med patenter til 2038',
        'Norsk selskap med etablert regulatory track record',
      ],
      recommendedNextSteps: [
        'Innledende møte med NordicBio management innen 14 dager',
        'Due diligence på IP-portefølje og klinisk data',
        'Vurder kommersiell synergipotensial med eksisterende produkter',
      ],
      workspaceId: workspace.id,
    },
  });

  await prisma.insightSource.create({
    data: {
      insightId: portfolioInsight1.id,
      sourceId: portfolioSource1.id,
    },
  });

  const portfolioInsight2 = await prisma.insight.create({
    data: {
      title: 'Swedish MedTech AB: Digital adherence-løsning med skalerbar SaaS-modell',
      type: 'Partnerkandidat',
      track: 'Portefølje',
      relatedProducts: [],
      markets: ['SE', 'DK', 'NO'],
      significanceScore: 82,
      impactScore: 7,
      riskScore: 3,
      credibilityScore: 8,
      fitScore: 82,
      status: 'NEW',
      whyBullets: [
        'Øker compliance for kroniske behandlinger (dokumentert 40% forbedring)',
        'Skalerbar SaaS-modell med lave marginalkostnader',
        'Regulatorisk godkjent i EU som medisinsk utstyr klasse IIa',
        'Eksisterende integrasjoner med apoteksystemer i Sverige',
      ],
      recommendedNextSteps: [
        'Pilot-studie med ett av våre produkter (Proponent kandidat)',
        'Commercial due diligence: Vurder customer acquisition cost',
        'Technical due diligence: Skalerbarhet og datasikkerhet',
      ],
      workspaceId: workspace.id,
    },
  });

  await prisma.insightSource.create({
    data: {
      insightId: portfolioInsight2.id,
      sourceId: portfolioSource2.id,
    },
  });

  const portfolioInsight3 = await prisma.insight.create({
    data: {
      title: 'BioNordic ApS: Biosimilar-pipeline med 2 assets i Phase III',
      type: 'Partnerkandidat',
      track: 'Portefølje',
      relatedProducts: [],
      markets: ['DK', 'NO', 'SE'],
      significanceScore: 75,
      impactScore: 7,
      riskScore: 5,
      credibilityScore: 8,
      fitScore: 75,
      status: 'NEW',
      whyBullets: [
        'Kompletterer portefølje innen biologics-segment',
        'Lavere utviklingskostnad enn de novo utvikling',
        'Markedsadgang via vår eksisterende nordiske infrastruktur',
        'Phase III data forventet Q2 2025',
      ],
      recommendedNextSteps: [
        'Analyser konkurranselandskap for begge biosimilar-assets',
        'Financial modeling: NPV ved ulike markedsscenarier',
        'Regulatory strategy-møte med vår CMC-avdeling',
      ],
      workspaceId: workspace.id,
    },
  });

  await prisma.insightSource.create({
    data: {
      insightId: portfolioInsight3.id,
      sourceId: portfolioSource3.id,
    },
  });

  const portfolioInsight4 = await prisma.insight.create({
    data: {
      title: 'Oslo Pain Research AS: Novel non-opioid smertebehandling med sterke Phase II-data',
      type: 'Partnerkandidat',
      track: 'Portefølje',
      relatedProducts: [],
      markets: ['NO', 'SE'],
      significanceScore: 91,
      impactScore: 9,
      riskScore: 4,
      credibilityScore: 9,
      fitScore: 91,
      status: 'REVIEW',
      whyBullets: [
        'Differensiert virkningsmekanisme (ikke-opioid, redusert avhengighetsrisiko)',
        'Phase II data viser signifikant effekt vs. placebo (p<0.001)',
        'Stort uoppfylt behov: Kronisk smerte affekterer 20% av befolkningen',
        'Fast-track designation fra FDA og EMA',
      ],
      recommendedNextSteps: [
        'Forhandle term sheet for partnerskapsavtale innen 30 dager',
        'Detaljert scientific due diligence av Phase II-data',
        'Kommersiell strategi-workshop: Pricing, market access, launch sekvens',
      ],
      workspaceId: workspace.id,
    },
  });

  await prisma.insightSource.create({
    data: {
      insightId: portfolioInsight4.id,
      sourceId: portfolioSource4.id,
    },
  });

  const portfolioInsight5 = await prisma.insight.create({
    data: {
      title: 'Copenhagen Diagnostics A/S: Companion diagnostic for presisjonsmedisin',
      type: 'Partnerkandidat',
      track: 'Portefølje',
      relatedProducts: [],
      markets: ['DK', 'SE', 'NO'],
      significanceScore: 79,
      impactScore: 7,
      riskScore: 4,
      credibilityScore: 8,
      fitScore: 79,
      status: 'REVIEW',
      whyBullets: [
        'Muliggjør personalisert medisin for eksisterende produkter',
        'Cross-selling potensial: Diagnostic + therapeutic bundling',
        'Regulatory pathway lettere med companion diagnostic',
        'Dansk selskap med CE-marking allerede på plass',
      ],
      recommendedNextSteps: [
        'Vurder kompatibilitet med vår produktportefølje (især onkologi)',
        'Kommersiell modeling: Bundling vs. separate pricing',
        'Regulatory alignment meeting med EMA-kontakt',
      ],
      workspaceId: workspace.id,
    },
  });

  await prisma.insightSource.create({
    data: {
      insightId: portfolioInsight5.id,
      sourceId: portfolioSource5.id,
    },
  });

  const portfolioInsight6 = await prisma.insight.create({
    data: {
      title: 'Swedish Rare Disease AB: Orphan drug med EU/USA designation',
      type: 'Partnerkandidat',
      track: 'Portefølje',
      relatedProducts: [],
      markets: ['SE'],
      significanceScore: 88,
      impactScore: 8,
      riskScore: 5,
      credibilityScore: 9,
      fitScore: 88,
      status: 'DUE_DILIGENCE',
      whyBullets: [
        'Høy pricing power i orphan drug-segment (premium pricing)',
        'Regulatoriske fordeler: Priority review, market exclusivity',
        'Liten konkurranse i målindikasjon (ultra-orphan)',
        'Sterk IP-posisjon med komposisjon-of-matter patent',
      ],
      recommendedNextSteps: [
        'Fullstendig IP due diligence med eksterne patent-advokater',
        'Epidemiologisk analyse: Patient population sizing per marked',
        'Payer strategy: Early engagement med TLV/Helfo/DKMA',
      ],
      workspaceId: workspace.id,
    },
  });

  await prisma.insightSource.create({
    data: {
      insightId: portfolioInsight6.id,
      sourceId: portfolioSource6.id,
    },
  });

  const portfolioInsight7 = await prisma.insight.create({
    data: {
      title: 'Nordic Vaccine AS: Profylaktisk respiratorisk vaksine med pandemiberedskap-potensial',
      type: 'Partnerkandidat',
      track: 'Portefølje',
      relatedProducts: [],
      markets: ['NO', 'SE', 'DK'],
      significanceScore: 84,
      impactScore: 8,
      riskScore: 6,
      credibilityScore: 8,
      fitScore: 84,
      status: 'DUE_DILIGENCE',
      whyBullets: [
        'Komplementerer terapeutisk portefølje (prevensjon vs. behandling)',
        'Offentlig tender-muligheter (nasjonale vaksineprogrammer)',
        'Pandemiberedskap: Strategisk verdi utover kommersiell NPV',
        'Norsk selskap med GMP-sertifisert produksjonsanlegg',
      ],
      recommendedNextSteps: [
        'Manufactoring due diligence: Kapasitet, yield, COGS',
        'Public health strategy: Møte med Folkehelseinstituttet/Folkhälsomyndigheten',
        'Competitive intelligence: Andre vaksine-aktører i Norden',
      ],
      workspaceId: workspace.id,
    },
  });

  await prisma.insightSource.createMany({
    data: [
      { insightId: portfolioInsight7.id, sourceId: portfolioSource1.id }, // Nordic Pharma News (general coverage)
      { insightId: portfolioInsight7.id, sourceId: portfolioSource4.id }, // Clinical trials reference
    ],
  });
  console.log('✅ Portfolio insights (partner candidates) created: 7');

  // Create Portfolio Report
  const portfolioReport = await prisma.report.create({
    data: {
      title: 'Porteføljescan: Oktober 2024',
      date: '2024-10',
      track: 'Portefølje',
      relatedEntity: null, // No specific product
      summary: 'Sterk måned for porteføljemuligheter med 7 nye partnerkandidater identifisert, inkludert høyt prioriterte nordiske assets innen respiratorisk behandling, smertebehandling og orphan drugs.',
      score: 84,
      trend: 'up',
      aiSummary: 'Oktober 2024 markerer en eksepsjonelt sterk måned for vår partnerstrategi. Tre kandidater (Oslo Pain Research, Swedish Rare Disease, NordicBio) scorer 87+ på fit og bør prioriteres. Geografisk fokus er balansert mellom Norge, Sverige og Danmark.',
      sections: [
        {
          title: 'Executive Summary',
          content: 'Vi har identifisert 7 høykvalitets partnerkandidater i oktober 2024, hvorav 3 er i NEW-status, 2 i REVIEW og 2 i DUE_DILIGENCE. Gjennomsnittlig fit-score er 83, som er vesentlig over vår terskel på 70. Geografisk fordeling er sterkt nordisk-fokusert, med norske, svenske og danske selskaper godt representert. Terapiområdene spenner fra respiratorisk (NordicBio), smerte (Oslo Pain Research), orphan disease (Swedish Rare Disease) til diagnostics (Copenhagen Diagnostics). Vaksinesegmentet (Nordic Vaccine) representerer en strategisk diversifisering.',
        },
        {
          title: 'Høyt prioriterte kandidater',
          content: '**1. Oslo Pain Research AS (Fit: 91, Status: REVIEW)**\nNovel non-opioid smertebehandling med imponerende Phase II-data. Fast-track designation fra FDA/EMA indikerer regulatorisk støtte. Stor markedsmulighet (kronisk smerte: 20% prevalens) og differensiert mekanisme gir sterk strategisk rationale.\n\n**Anbefaling:** Akselerere forhandlinger, sikte på term sheet innen 30 dager.\n\n**2. Swedish Rare Disease AB (Fit: 88, Status: DUE_DILIGENCE)**\nOrphan drug med EU/USA designation. Premium pricing-potensial og lav konkurranse. IP-posisjon ser solid ut, men krever eksterne patent-advokater for full due diligence.\n\n**Anbefaling:** Fullføre IP-gjennomgang, early payer engagement.\n\n**3. NordicBio AS (Fit: 87, Status: NEW)**\nInhalasjonsplattform med synergier til Proponent. Norsk selskap med etablert regulatory track record. Klinisk data fra Phase IIb er lovende.\n\n**Anbefaling:** Innledende møte innen 14 dager, fokus på kommersiell synergi.',
        },
        {
          title: 'Markedsmuligheter',
          content: '**Respiratorisk segment:** NordicBio AS og Nordic Vaccine AS gir oss mulighet til å styrke posisjon i respiratorisk behandling og forebygging.\n\n**Smerte/CNS:** Oslo Pain Research representerer entry i et stort segment med høy unmet need.\n\n**Orphan disease:** Swedish Rare Disease gir oss fotfeste i høymargin orphan-segment.\n\n**Digital health:** Swedish MedTech AB muliggjør digital transformasjon av eksisterende portefølje (adherence, patient engagement).\n\n**Biosimilarer:** BioNordic ApS kompletterer portefølje med lavere-risiko biologics-strategi.',
        },
        {
          title: 'Strategiske anbefalinger',
          content: '1. **Prioriter top 3:** Fokuser ressurser på Oslo Pain Research, Swedish Rare Disease og NordicBio AS.\n2. **Akselerere due diligence:** Dediker team til parallell due diligence på alle DUE_DILIGENCE-kandidater.\n3. **Strategisk team-workshop:** Samle BD, R&D, Commercial og Finance til 2-dagers workshop for å alignere på porteføljestrategi.\n4. **External advisors:** Engager IP-advokater (Swedish Rare Disease), KOLs (Oslo Pain Research) og manufacturing consultants (Nordic Vaccine).\n5. **Timeline:** Sikte på minst 2 signerte avtaler før årets slutt (Q4 2024).',
        },
      ],
      productId: null,
      workspaceId: workspace.id,
    },
  });
  console.log('✅ Portfolio report created:', portfolioReport.title);

  // Link insights to portfolio report
  await prisma.reportInsight.createMany({
    data: [
      { reportId: portfolioReport.id, insightId: portfolioInsight1.id },
      { reportId: portfolioReport.id, insightId: portfolioInsight2.id },
      { reportId: portfolioReport.id, insightId: portfolioInsight3.id },
      { reportId: portfolioReport.id, insightId: portfolioInsight4.id },
      { reportId: portfolioReport.id, insightId: portfolioInsight5.id },
      { reportId: portfolioReport.id, insightId: portfolioInsight6.id },
      { reportId: portfolioReport.id, insightId: portfolioInsight7.id },
    ],
  });
  console.log('✅ Portfolio Report-Insight links created');

  // Create financials
  await prisma.financial.create({
    data: {
      productId: proponent.id,
      period: '2024-10',
      revenue: 45.2,
      marketShare: 18.5,
      targetRevenue: 50.0,
      workspaceId: workspace.id,
    },
  });
  console.log('✅ Financials created for October 2024');

  // ===== ACTION ITEMS =====

  await prisma.actionItem.createMany({
    data: [
      {
        title: 'Godkjenn Q4 kampanjebudsjett for Proponent (DK)',
        description: 'Fra: Proponent Rapport',
        priority: 'HIGH',
        completed: false,
        dueDate: new Date('2024-11-15'),
        workspaceId: workspace.id,
      },
      {
        title: 'Evaluer Oslo Pain Research AS som partnerkandidat',
        description: 'Fra: Porteføljescan',
        priority: 'HIGH',
        completed: false,
        dueDate: new Date('2024-11-20'),
        workspaceId: workspace.id,
      },
      {
        title: 'Forbered styremøte: Q3 markedsrapport',
        description: 'Fra: Markedsrapport',
        priority: 'HIGH',
        completed: false,
        dueDate: new Date('2024-11-10'),
        workspaceId: workspace.id,
      },
      {
        title: 'Review pricing strategy for Nordic markets',
        description: 'Fra: Markedsrapport',
        priority: 'MEDIUM',
        completed: false,
        workspaceId: workspace.id,
      },
    ],
  });
  console.log('✅ ActionItems created: 4');

  // ===== DAILY BRIEFING =====

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyBriefing.create({
    data: {
      date: today,
      totalUpdates: 7,
      requiresAttentionCount: 2,
      content: {
        productUpdates: [
          {
            title: 'Proponent: Positiv fase III data publisert',
            summary: 'Resultatene viser 23% bedre effekt enn placebo (p<0.001)',
            priority: 'HIGH',
            sourceReportId: productReport.id,
          },
          {
            title: 'Regulatorisk godkjenning i Sverige forventet Q1 2025',
            summary: 'Basert på dialog med Läkemedelsverket',
            priority: 'MEDIUM',
          },
        ],
        marketSignals: [
          {
            title: 'Prispress øker i Norge',
            summary: 'HELFO varsler strengere transparenskrav',
            priority: 'HIGH',
            sourceReportId: landscapeReport.id,
          },
          {
            title: 'Biosimilar-konkurranse intensiveres',
            summary: '3 nye biosimilarer godkjent i oktober',
            priority: 'MEDIUM',
          },
        ],
        portfolioUpdates: [
          {
            title: 'Oslo Pain Research: Phase II klar for review',
            summary: 'Due diligence kan starte neste uke',
            priority: 'HIGH',
            sourceReportId: portfolioReport.id,
          },
          {
            title: 'Swedish Rare Disease AB: Positivt EMA orphan designation',
            summary: 'Øker strategisk verdi betydelig',
            priority: 'MEDIUM',
            sourceReportId: portfolioReport.id,
          },
          {
            title: 'NordicBio AS: Innledende møte booket',
            summary: 'Teknisk due diligence 14. november',
            priority: 'MEDIUM',
          },
        ],
      },
      workspaceId: workspace.id,
    },
  });
  console.log('✅ DailyBriefing created for today');

  console.log('\n🎉 Seeding complete!');
  console.log('\nSummary:');
  console.log('- Workspace: Pharma Nordic Demo');
  console.log('- Products: 1 (Proponent)');
  console.log('- Reports: 3 (1 Product Status, 1 Market Landscape, 1 Portfolio)');
  console.log('- Insights: 12 (2 product-specific, 3 landscape, 7 portfolio/candidates)');
  console.log('- Sources: 11 (2 product, 3 landscape, 6 portfolio)');
  console.log('- Financials: October 2024');
  console.log('- ActionItems: 4');
  console.log('- DailyBriefing: 1 (today)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
