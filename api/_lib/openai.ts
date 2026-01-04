/**
 * OpenAI Client Library
 *
 * Centralized OpenAI client for AI chat functionality.
 * Uses gpt-4-turbo for report-scoped chat with source citations.
 */

import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY || OPENAI_API_KEY === 'placeholder_openai_key') {
  console.warn('⚠️ OpenAI API key not configured. Chat functionality will not work.');
  console.warn('   Get your API key from: https://platform.openai.com/api-keys');
  console.warn('   Set OPENAI_API_KEY in .env.local');
}

// Create OpenAI client
export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY || 'dummy-key', // Dummy key prevents initialization error
});

/**
 * Default model configuration
 */
export const AI_CONFIG = {
  model: 'gpt-4-turbo-preview', // Can be overridden per request
  temperature: 0.7, // Balanced creativity and accuracy
  max_tokens: 1500, // Reasonable for report Q&A
  top_p: 0.9,
} as const;

/**
 * System prompt for report-scoped chat
 */
export const REPORT_CHAT_SYSTEM_PROMPT = `Du er en AI-assistent for Pharma Nordic's MarketOps Dashboard.

OPPGAVE:
- Svar på spørsmål om den spesifikke rapporten brukeren spør om
- Baser svar KUN på informasjonen i rapporten, insights og kilder som er gitt
- Vær konsis og executive-fokusert (maks 3-4 setninger per svar)

REGLER:
1. ALLTID siter kilder når du gjør påstander
2. Hvis informasjon IKKE finnes i rapporten: si "Denne informasjonen er ikke tilgjengelig i rapporten"
3. IKKE hallusiner data eller kilder
4. Bruk norsk språk i svarene
5. Formater svar med Markdown for lesbarhet

KILDEFORMAT:
- Når du siterer: [Kildenavn](URL) eller bare [Kildenavn] hvis ingen URL
- Eks: "Ifølge [BioPharma Dive](https://url) har Proponent vist lovende resultater..."

KONTEKST:
Du har tilgang til følgende informasjon om rapporten:
- Rapporttittel og sammendrag
- Strategiske hendelser (insights) med scores
- Kilder med utgivelsesdata

Svar alltid som om du er en senior pharma-analytiker som hjelper executive team.`;

/**
 * Build context from report data for RAG
 */
export function buildReportContext(report: any): string {
  let context = `# ${report.title}\n\n`;
  context += `**Periode**: ${report.date}\n`;
  context += `**Type**: ${report.track}\n`;
  if (report.relatedEntity) {
    context += `**Relatert til**: ${report.relatedEntity}\n`;
  }
  context += `**Overall Score**: ${report.score}/10 (${report.trend})\n\n`;

  context += `## Executive Summary\n${report.summary}\n\n`;
  context += `## AI-analyse\n${report.aiSummary}\n\n`;

  // Add key insights
  if (report.keyInsights && report.keyInsights.length > 0) {
    context += `## Strategiske Hendelser\n\n`;
    report.keyInsights.forEach((insight: any, idx: number) => {
      context += `### ${idx + 1}. ${insight.title}\n`;
      context += `**Type**: ${insight.type}\n`;
      context += `**Betydning**: ${insight.scores.impact}/10 | **Risiko**: ${insight.scores.risk}/10 | **Troverdighet**: ${insight.scores.credibility}/10\n\n`;

      if (insight.whyBullets && insight.whyBullets.length > 0) {
        context += `**Hvorfor viktig:**\n`;
        insight.whyBullets.forEach((bullet: string) => {
          context += `- ${bullet}\n`;
        });
        context += '\n';
      }

      if (insight.sources && insight.sources.length > 0) {
        context += `**Kilder:**\n`;
        insight.sources.forEach((source: any) => {
          context += `- [${source.title}](${source.url}) (${source.publisher}, ${new Date(source.publishedAt).toLocaleDateString('nb-NO')})\n`;
        });
        context += '\n';
      }
    });
  }

  // Add sections if available
  if (report.sections && report.sections.length > 0) {
    context += `## Rapportseksjoner\n\n`;
    report.sections.forEach((section: any) => {
      context += `### ${section.title}\n${section.content}\n\n`;
    });
  }

  return context;
}

/**
 * Extract source references from AI response
 * Returns array of source titles/URLs mentioned in the response
 */
export function extractSourceReferences(
  response: string,
  availableSources: any[]
): any[] {
  const mentionedSources: any[] = [];

  // Look for markdown links: [Title](URL)
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkPattern.exec(response)) !== null) {
    const [_, title, url] = match;

    // Find matching source
    const source = availableSources.find(
      s => s.url === url || s.title.toLowerCase().includes(title.toLowerCase())
    );

    if (source && !mentionedSources.find(s => s.id === source.id)) {
      mentionedSources.push(source);
    }
  }

  // Also look for source titles mentioned without links
  availableSources.forEach(source => {
    if (
      response.includes(source.title) &&
      !mentionedSources.find(s => s.id === source.id)
    ) {
      mentionedSources.push(source);
    }
  });

  return mentionedSources;
}
