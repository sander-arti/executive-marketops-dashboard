
import { InsightItem, InsightType, Source, Track, Report, FinancialMetric, MediaMention } from '../types';

export const PRODUCTS = ['Proponent', 'Bentrio', 'Smertebehandling'];
export const MARKETS = ['NO', 'DK', 'SE'];

// ... (Existing SOURCES_POOL and generator functions remain same, omitted for brevity but presumed present in final file. Only adding NEW exports below)

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const SOURCES_POOL: Source[] = [
  { title: "Nordiske Pharma Trender Q2", url: "#", publisher: "PharmaNordic Insights", publishedAt: "2023-10-15" },
  { title: "Regulatorisk oppdatering: Nasal levering", url: "#", publisher: "EMA Monitor", publishedAt: "2023-10-12" },
  { title: "Konkurrentanalyse: Smertebehandling", url: "#", publisher: "GlobalData", publishedAt: "2023-10-10" },
  { title: "Kliniske studieretultater Fase III", url: "#", publisher: "ClinicalTrials.gov", publishedAt: "2023-09-28" },
  { title: "Markedstilgangsrapport Norge", url: "#", publisher: "Legemiddelverket", publishedAt: "2023-10-01" },
  { title: "Helsebudsjett 2024", url: "#", publisher: "Det Danske Sundhedsministerium", publishedAt: "2023-10-05" },
];

const generateInsight = (
  id: string,
  title: string,
  type: InsightType,
  track: Track,
  products: string[],
  markets: string[],
  significance: number,
  createdDaysAgo: number = 0
): InsightItem => {
  return {
    id,
    title,
    type,
    track,
    relatedProducts: products,
    markets,
    scores: {
      impact: Math.floor(Math.random() * 3) + 7,
      risk: type === InsightType.RISK ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 3) + 1,
      credibility: Math.floor(Math.random() * 2) + 8,
    },
    significanceScore: significance,
    whyBullets: [
      "Påvirker direkte omsetningsprognosene for Q4 med estimert 15%.",
      "Samsvarer med strategisk skifte mot ikke-invasive leveringsmetoder.",
      "Mulighet for first-mover advantage hvis vi handler innen 30 dager."
    ],
    recommendedNextSteps: [
      "Planlegg briefing med Medisinsk avdeling angående nye data.",
      "Oppdater presentasjoner for Key Account Managers før Q1-syklusen.",
      "Gjennomgå prisstrategien for det norske markedet."
    ],
    sources: [SOURCES_POOL[Math.floor(Math.random() * SOURCES_POOL.length)], SOURCES_POOL[Math.floor(Math.random() * SOURCES_POOL.length)]],
    createdAt: daysAgo(createdDaysAgo),
    fitScore: track === Track.PORTFOLIO ? Math.floor(Math.random() * 20) + 75 : undefined,
  };
};

export const INSIGHTS: InsightItem[] = [
  // Product Track
  generateInsight('p1', 'Bentrio: Uventet mangelsituasjon hos konkurrent i Norge skaper åpning', InsightType.OPPORTUNITY, Track.PRODUCT, ['Bentrio'], ['NO'], 95, 0),
  generateInsight('p2', 'Proponent: Nye refusjonsretningslinjer i Danmark favoriserer vår profil', InsightType.OPPORTUNITY, Track.PRODUCT, ['Proponent'], ['DK'], 92, 1),
  generateInsight('p3', 'Smertebehandling: Forsinkelse i konkurrents Fase III-resultater', InsightType.OPPORTUNITY, Track.PRODUCT, ['Smertebehandling'], ['SE', 'NO'], 88, 10),
  generateInsight('p5', 'Bentrio: Positive Real-World Evidence-data publisert', InsightType.EVIDENCE, Track.PRODUCT, ['Bentrio'], ['NO', 'DK'], 85, 5),
  generateInsight('p6', 'Proponent: Konkurrent lanserer aggressiv priskampanje', InsightType.RISK, Track.PRODUCT, ['Proponent'], ['SE'], 89, 4),
  generateInsight('p7', 'Smertebehandling: Key Opinion Leader støtter vår virkningsmekanisme', InsightType.TREND, Track.PRODUCT, ['Smertebehandling'], ['DK'], 82, 15),
  
  // Landscape Track
  generateInsight('l1', 'Skifte i fastlegers forskrivningsmønster mot forebyggende behandling', InsightType.TREND, Track.LANDSCAPE, [], ['NO', 'SE'], 88, 1),
  generateInsight('l2', 'Nytt EU-bærekraftsdirektiv påvirker emballasjekrav', InsightType.RISK, Track.LANDSCAPE, [], ['NO', 'DK', 'SE'], 85, 30),
  generateInsight('l3', 'Konkurrent X kjøper opp lokal distributør i Sverige', InsightType.TREND, Track.LANDSCAPE, [], ['SE'], 90, 2),
  generateInsight('l4', 'Oppdaterte EAACI-retningslinjer anbefaler tidligere intervensjon', InsightType.EVIDENCE, Track.LANDSCAPE, [], ['DK', 'NO'], 93, 5),
  generateInsight('l5', 'Bruk av telehelse flater ut i distriktene', InsightType.TREND, Track.LANDSCAPE, [], ['NO'], 75, 40),
  generateInsight('l8', 'Konkurrent Y nedbemanner salgsstyrken i Norden', InsightType.OPPORTUNITY, Track.LANDSCAPE, [], ['NO', 'DK', 'SE'], 86, 3),

  // Portfolio Track
  { ...generateInsight('port1', 'BioTech Alpha: Ny plattform for nasal levering (Serie B)', InsightType.PARTNER, Track.PORTFOLIO, [], ['SE'], 94, 2), status: 'NEW' },
  { ...generateInsight('port2', 'NeuroSol: Migrene-ressurs komplementær til Smertebehandling', InsightType.PARTNER, Track.PORTFOLIO, [], ['DK'], 91, 10), status: 'REVIEW' },
  { ...generateInsight('port3', 'AllergyAI: Digitalt diagnostikkverktøy for pasientstratifisering', InsightType.PARTNER, Track.PORTFOLIO, [], ['NO'], 88, 0), status: 'NEW' },
  { ...generateInsight('port4', 'GenericCo: Potensielt salg av eldre respiratorisk portefølje', InsightType.PARTNER, Track.PORTFOLIO, [], ['SE'], 83, 40), status: 'DUE_DILIGENCE' },
];

export const REPORTS: Report[] = [
    // --- Product Reports ---
    {
        id: 'rep-prop-oct',
        title: 'Proponent: Oktober Statusrapport',
        date: '2023-10',
        track: Track.PRODUCT,
        relatedEntity: 'Proponent',
        summary: 'Proponent viser sterk fremgang i Danmark grunnet nye refusjonsvilkår, men møter økt priskonkurranse i Sverige.',
        score: 78,
        trend: 'up',
        aiSummary: 'Hovedfokuset denne måneden er å kapitalisere på den danske markedsendringen. Risikoen i Sverige vurderes som håndterbar med målrettede tiltak.',
        keyInsights: INSIGHTS.filter(i => i.relatedProducts.includes('Proponent')),
        sections: [
            {
                title: "1. Markedsoversikt",
                content: "Oktober har vært en måned preget av betydelige regulatoriske skift i Danmark. Den danske helsemyndighetens beslutning om å endre refusjonsstatus for klasse B-produkter har direkte favorisert Proponents bivirkningsprofil. \n\nI Sverige ser vi derimot en tilspissing av priskrigen. Hovedkonkurrenten har redusert sin enhetspris med 12% for å møte vår markedsandel, noe som krever en umiddelbar respons i vår rabattstruktur mot de store apotekkjedene."
            },
            {
                title: "2. Salgsytelse",
                content: "Salgstallene for Q3 viser en økning på 4% YoY, primært drevet av volumvekst i Norge. Danmark henger noe etter prognosen (-2%), men forventes å ta igjen dette i Q4 gitt de nye rammevilkårene. \n\nBruttomarginen holder seg stabil på 68%, men vi ser press på marginene i Sverige grunnet den nevnte priskonkurransen."
            },
            {
                title: "3. Risikoanalyse",
                content: "Den primære risikoen knytter seg til forsyningskjeden. En underleverandør av emballasje har varslet mulige forsinkelser i november. Lagerbeholdningen er foreløpig tilstrekkelig for 6 uker, men mitigerende tiltak må iverksettes innen 14 dager hvis situasjonen ikke bedres."
            },
            {
                title: "4. Anbefalinger",
                content: "1. Iverksett umiddelbar kampanje mot danske allmennleger for å informere om refusjonsendringen.\n2. Etabler en 'task force' for prisstrategi i Sverige.\n3. Kvalifiser alternativ emballasjeleverandør for å sikre Q1-leveranser."
            }
        ]
    },
    {
        id: 'rep-ben-oct',
        title: 'Bentrio: Oktober Statusrapport',
        date: '2023-10',
        track: Track.PRODUCT,
        relatedEntity: 'Bentrio',
        summary: 'Betydelig mulighet i Norge grunnet forsyningsmangel hos hovedkonkurrent. Kliniske data styrker posisjonen.',
        score: 92,
        trend: 'up',
        aiSummary: 'Bentrio har en unik mulighet til å ta markedsandeler i Q4. Mobilisering av salgsstyrken i Norge er kritisk de neste 14 dagene.',
        keyInsights: INSIGHTS.filter(i => i.relatedProducts.includes('Bentrio')),
        sections: [
            {
                title: "1. Strategisk Mulighet",
                content: "Vi står overfor et unikt 'window of opportunity' i det norske markedet. Vår hovedkonkurrent har meldt om 'stock-out' situasjon som forventes å vare i 6-8 uker. Dette gir Bentrio en åpning til å etablere seg som førstevalg hos en betydelig pasientgruppe."
            },
            {
                title: "2. Klinisk Evidens",
                content: "De nylig publiserte RWE-dataene (Real World Evidence) fra Tyskland viser en pasienttilfredshet på 88%, signifikant høyere enn standard behandling. Dette materialet er nå oversatt og klart for distribusjon til nordiske spesialister."
            },
            {
                title: "3. Konkurransebilde",
                content: "Bortsett fra mangelsituasjonen i Norge, er konkurransebildet stabilt. Vi overvåker en ny aktør som forventes å lansere i Danmark i Q1 2024, men foreløpig etterretning tilsier at deres prispunkt vil ligge 20% over Bentrio."
            }
        ]
    },
    {
        id: 'rep-pain-oct',
        title: 'Smertebehandling: Oktober Statusrapport',
        date: '2023-10',
        track: Track.PRODUCT,
        relatedEntity: 'Smertebehandling',
        summary: 'Konkurrentforsinkelser gir oss et utvidet vindu for posisjonering før lansering.',
        score: 85,
        trend: 'stable',
        aiSummary: 'Strategisk tålmodighet anbefales. Bruk tiden til å bygge sterkere bånd med KOLs i forkant av konkurrentens data.',
        keyInsights: INSIGHTS.filter(i => i.relatedProducts.includes('Smertebehandling')),
        sections: [
            { title: "Status", content: "Generell statusrapport innhold..." }
        ]
    },

    // --- Market Landscape Report ---
    {
        id: 'rep-market-oct',
        title: 'Nordisk Markedsrapport: Oktober',
        date: '2023-10',
        track: Track.LANDSCAPE,
        summary: 'Nordisk volatilitet er lav, men strukturelle endringer i primærhelsetjenesten skaper nye inngangspunkter.',
        score: 65,
        trend: 'stable',
        aiSummary: 'Vi ser en dreiing mot forebygging i alle tre land. Dette favoriserer vår portefølje på sikt, men krever lobbyvirksomhet nå.',
        keyInsights: INSIGHTS.filter(i => i.track === Track.LANDSCAPE),
        sections: [
            {
                title: "1. Makroøkonomiske Forhold",
                content: "Inflasjonspresset i helsesektoren begynner å avta, men sykehusbudsjettene er fortsatt stramme. Dette fører til økt fokus på helseøkonomiske analyser (HEOR) ved innkjøp. Produkter som kan dokumentere redusert liggetid eller færre reinnleggelser prioriteres sterkt."
            },
            {
                title: "2. Trender i Primærhelsetjenesten",
                content: "Vi observerer et skifte i forskrivningsmønsteret hos fastleger, spesielt i Sverige og Norge. Det er en tydelig trend mot å anbefale forebyggende egenbehandling før reseptbelagte legemidler. Dette passer godt med vår OTC-portefølje."
            },
            {
                title: "3. Digital Helse",
                content: "Bruken av telehelse-løsninger har flatet ut i distriktene."
            }
        ]
    },

    // --- Portfolio Scan Report ---
    {
        id: 'rep-radar-oct',
        title: 'Månedlig Porteføljescan: Oktober',
        date: '2023-10',
        track: Track.PORTFOLIO,
        summary: '4 høyaktuelle kandidater identifisert. BioTech Alpha skiller seg ut som strategisk "perfect fit".',
        score: 88,
        trend: 'up',
        aiSummary: 'AI-motoren har scannet 450 selskaper. BioTech Alpha og AllergyAI bør prioriteres for umiddelbar kontakt.',
        keyInsights: INSIGHTS.filter(i => i.track === Track.PORTFOLIO && i.status === 'NEW'),
        sections: [
            {
                title: "1. Scanningsparametre",
                content: "Denne månedens scan har fokusert på selskaper innen nasal leveringsteknologi."
            }
        ]
    }
];

export const OUTPUTS = [
    {
        id: 'out-1',
        title: 'Q3 Markedsanalyse - Endelig',
        date: '2023-10-15',
        type: 'PDF'
    },
    {
        id: 'out-2',
        title: 'Lanseringsplan Bentrio v2',
        date: '2023-10-12',
        type: 'Presentasjon'
    },
    {
        id: 'out-3',
        title: 'Risikovurdering Supply Chain',
        date: '2023-10-08',
        type: 'Dokument'
    }
];

// MOCK MEDIA DATA GENERATOR
const PROPONENT_MEDIA: MediaMention[] = [
    { id: 'm1', title: 'Refusjonsendringer skaper debatt blant fastleger', source: 'Dagens Medisin', date: '2023-10-14', url: '#', sentiment: 'positive', snippet: '...de nye reglene gjør at Proponent seiler opp som et mer kostnadseffektivt alternativ for pasienter med kroniske...' },
    { id: 'm2', title: 'Priskrig på allergimedisiner i Sverige', source: 'Läkemedelsvärlden', date: '2023-10-10', url: '#', sentiment: 'negative', snippet: '...flere aktører presser prisene, noe som kan gå utover marginene til etablerte merkevarer i segmentet...' },
    { id: 'm3', title: 'Pasientforeningen hyller ny bivirkningsprofil', source: 'NRK Livsstil', date: '2023-10-05', url: '#', sentiment: 'positive', snippet: '...endelig et alternativ som ikke gir døsighet, sier lederen i foreningen...' },
    { id: 'm4', title: 'Q3-tallene for farmasi-sektoren', source: 'Finansavisen', date: '2023-10-01', url: '#', sentiment: 'neutral', snippet: '...sektoren viser stabil vekst tross makroøkonomisk uro...' }
];

const BENTRIO_MEDIA: MediaMention[] = [
    { id: 'b1', title: 'Tomme hyller for konkurrent - Bentrio tar over', source: 'Apotek1.no', date: '2023-10-12', url: '#', sentiment: 'positive', snippet: '...grunnet leveringsproblemer anbefales nå Bentrio som primær substitutt i alle våre filialer...' },
    { id: 'b2', title: 'Studie bekrefter effekt av nasal barriere', source: 'Forskning.no', date: '2023-10-08', url: '#', sentiment: 'positive', snippet: '...ny forskning viser at mekanisk barriere er like effektivt som milde antihistaminer...' }
];

export const MOCK_FINANCIALS: FinancialMetric[] = [
    { productId: 'Proponent', period: '2023-10', revenue: 12.5, targetRevenue: 12.0, marketShare: 24.8, mediaMentions: PROPONENT_MEDIA },
    { productId: 'Bentrio', period: '2023-10', revenue: 8.2, targetRevenue: 7.5, marketShare: 15.3, mediaMentions: BENTRIO_MEDIA },
    { productId: 'Smertebehandling', period: '2023-10', revenue: 0, targetRevenue: 0, marketShare: 0, mediaMentions: [] },
];
