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

  console.log('\n🎉 Seeding complete!');
  console.log('\nSummary:');
  console.log('- Workspace: Pharma Nordic Demo');
  console.log('- Products: 1 (Proponent)');
  console.log('- Reports: 2 (1 Product Status, 1 Market Landscape)');
  console.log('- Insights: 5 (2 product-specific, 3 landscape)');
  console.log('- Sources: 5 (2 product, 3 landscape)');
  console.log('- Financials: October 2024');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
