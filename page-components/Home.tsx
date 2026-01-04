'use client';

import React, { useState, useMemo } from 'react';
import { InsightItem } from '../types';
import { INSIGHTS, PRODUCTS } from '../mock/data';
import { Button, Badge, cn } from '../components/ui';
import { DailyBriefingModal } from '../components/DailyBriefingModal';
import { useReports } from '../hooks/useReports';
import { useActionItems, useUpdateActionItem } from '../hooks/useActionItems';
import { useDailyBriefing } from '../hooks/useDailyBriefing';
import {
  AlertTriangle,
  ArrowRight,
  Zap,
  CheckCircle2,
  Sparkles,
  Target,
  X,
  Check,
  BrainCircuit,
  PieChart,
  Loader2
} from 'lucide-react';

// --- Components ---

interface StatusTickerProps {
  portfolioHealth: number;
  criticalRisks: number;
  newOpportunities: number;
  reportCount: number;
}

const StatusTicker: React.FC<StatusTickerProps> = ({
  portfolioHealth,
  criticalRisks,
  newOpportunities,
  reportCount
}) => {
  const healthStatus = portfolioHealth >= 80 ? 'Stabil' : portfolioHealth >= 60 ? 'Moderat' : 'Risiko';
  const healthColor = portfolioHealth >= 80 ? 'emerald' : portfolioHealth >= 60 ? 'amber' : 'rose';

  // Static Tailwind classes (dynamic template literals don't work with Tailwind)
  const iconClasses = cn(
    'p-2 rounded-full border',
    healthColor === 'emerald' && 'bg-emerald-50 text-emerald-600 border-emerald-100',
    healthColor === 'amber' && 'bg-amber-50 text-amber-600 border-amber-100',
    healthColor === 'rose' && 'bg-rose-50 text-rose-600 border-rose-100'
  );

  const badgeClasses = cn(
    'text-sm font-medium px-2 py-0.5 rounded-full',
    healthColor === 'emerald' && 'text-emerald-600 bg-emerald-50',
    healthColor === 'amber' && 'text-amber-600 bg-amber-50',
    healthColor === 'rose' && 'text-rose-600 bg-rose-50'
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
        {/* 1. AI Synthesized Health Score */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={iconClasses}>
                        <BrainCircuit size={18} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Porteføljehelse</span>
                </div>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-slate-900 tracking-tight">{portfolioHealth}</span>
                <span className={badgeClasses}>
                  {healthStatus}
                </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Basert på sentiment i {reportCount} aktive rapporter.
            </p>
        </div>

        {/* 2. Active Risks */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
                        <AlertTriangle size={18} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Kritiske Risikoer</span>
                </div>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-slate-900 tracking-tight">{criticalRisks}</span>
                {criticalRisks > 0 && (
                  <div className="flex gap-1.5 translate-y-[-2px]">
                      <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shadow-sm"></div>
                      {criticalRisks > 1 && <div className="h-2.5 w-2.5 rounded-full bg-rose-500 opacity-50"></div>}
                      {criticalRisks > 2 && <div className="h-2.5 w-2.5 rounded-full bg-amber-400 opacity-50"></div>}
                  </div>
                )}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {criticalRisks > 0 ? 'Krever tiltak innen 30 dager.' : 'Ingen kritiske risikoer identifisert.'}
            </p>
        </div>

        {/* 3. Opportunities */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                        <Zap size={18} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Nye Muligheter</span>
                </div>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-slate-900 tracking-tight">{newOpportunities}</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Identifisert i markedsscanning.</p>
        </div>
    </div>
  );
};

interface FocusAreaCardProps { 
    title: string;
    subtitle: string;
    status: 'opportunity' | 'risk' | 'neutral';
    description: string;
    actionLabel: string;
    onAction: () => void;
}

const FocusAreaCard: React.FC<FocusAreaCardProps> = ({ 
    title, 
    subtitle, 
    status, 
    description, 
    actionLabel, 
    onAction 
}) => {
    const statusConfig = {
        opportunity: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: Zap, label: 'Vekstmulighet' },
        risk: { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100', icon: AlertTriangle, label: 'Risiko' },
        neutral: { color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-100', icon: Target, label: 'Status' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
             <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
                </div>
                <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 border", config.bg, config.color, config.border)}>
                    <Icon size={12} />
                    {config.label}
                </div>
             </div>

             <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-2xl">
                {description}
             </p>

             <div>
                 <Button variant="outline" size="sm" onClick={onAction} className="text-slate-600 group-hover:text-slate-900 group-hover:border-slate-400 transition-colors">
                    {actionLabel} <ArrowRight size={14} className="ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                 </Button>
             </div>
        </div>
    );
};

// --- Recommended Actions Component (The "Inbox" for Strategy) ---

interface ActionItemProps {
    id: string;
    text: string;
    source: string;
    priority: 'high' | 'medium';
    onComplete: (id: string) => void;
    onDismiss: (id: string) => void;
}

const ActionItem: React.FC<ActionItemProps> = ({ id, text, source, priority, onComplete, onDismiss }) => {
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group animate-in slide-in-from-right-2 fade-in duration-300">
            <div className="flex justify-between items-start">
                <Badge variant={priority === 'high' ? 'destructive' : 'secondary'} className={priority === 'high' ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-100' : 'bg-slate-100 text-slate-600'}>
                    {priority === 'high' ? 'Høy prioritet' : 'Middels'}
                </Badge>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{source}</span>
            </div>
            
            <p className="text-sm font-medium text-slate-900 leading-relaxed">
                {text}
            </p>

            <div className="flex gap-2 mt-2 pt-2 border-t border-slate-50">
                <Button 
                    onClick={() => onComplete(id)}
                    className="flex-1 bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all h-8 text-xs font-semibold shadow-sm"
                >
                    <Check size={14} className="mr-1.5" /> Marker som utført
                </Button>
                <Button 
                    variant="ghost"
                    onClick={() => onDismiss(id)}
                    className="w-8 h-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Avvis"
                >
                    <X size={14} />
                </Button>
            </div>
        </div>
    );
};

// --- MAIN HOME COMPONENT ---

interface HomeProps {
  onItemClick: (item: InsightItem) => void;
  onNavigate: (page: any, params?: any) => void;
}

export const Home: React.FC<HomeProps> = ({ onItemClick, onNavigate }) => {
  const [isBriefOpen, setIsBriefOpen] = useState(false);

  // Fetch all reports from API
  const { data: allReports, isLoading: reportsLoading } = useReports();

  // Fetch action items from API (incomplete only)
  const { data: actionItems, isLoading: actionsLoading } = useActionItems({ completed: false });

  // Fetch today's daily briefing
  const { data: dailyBriefing } = useDailyBriefing();

  // Mutation for updating action items
  const updateActionItem = useUpdateActionItem();

  // Compute KPIs from reports
  const kpis = useMemo(() => {
    if (!allReports || allReports.length === 0) {
      return {
        portfolioHealth: 92, // Default fallback
        criticalRisks: 0,
        newOpportunities: 0,
        reportCount: 0,
      };
    }

    // Portfolio Health: Average score of all product reports
    const productReports = allReports.filter(r => r.track === 'Produkter');
    const healthScore = productReports.length > 0
      ? Math.round(productReports.reduce((sum, r) => sum + r.score, 0) / productReports.length)
      : 92;

    // Critical Risks: Count high-risk insights across all reports
    const risks = allReports.flatMap(r => r.keyInsights || [])
      .filter(i => i.type === 'Risiko' && (i.scores?.risk ?? 0) >= 8);

    // New Opportunities: Opportunities created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const opportunities = allReports.flatMap(r => r.keyInsights || [])
      .filter(i => i.type === 'Mulighet' && new Date(i.createdAt || 0) > thirtyDaysAgo);

    return {
      portfolioHealth: healthScore,
      criticalRisks: risks.length,
      newOpportunities: opportunities.length,
      reportCount: allReports.length,
    };
  }, [allReports]);

  const handleActionComplete = (id: string) => {
    updateActionItem.mutate({ id, data: { completed: true } });
  };

  const handleActionDismiss = (id: string) => {
    // For now, just mark as completed (in future, could add a "dismissed" field)
    updateActionItem.mutate({ id, data: { completed: true } });
  };

  // Compute Strategic Agenda from most recent reports per track
  const strategicAgenda = useMemo(() => {
    if (!allReports || allReports.length === 0) {
      return [];
    }

    const tracks = ['Produkter', 'Landskap', 'Portefølje'] as const;

    return tracks
      .map(track => {
        const reportsInTrack = allReports
          .filter(r => r.track === track)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const latestReport = reportsInTrack[0];
        if (!latestReport) return null;

        // Extract top priority insight from this report
        const topInsight = latestReport.keyInsights?.[0];

        // Determine status based on top insight type
        let status: 'opportunity' | 'risk' | 'neutral' = 'neutral';
        if (topInsight?.type === 'Mulighet') status = 'opportunity';
        else if (topInsight?.type === 'Risiko') status = 'risk';

        // Map track to target page
        const trackToPage: Record<string, string> = {
          'Produkter': 'product',
          'Landskap': 'landscape',
          'Portefølje': 'portfolio',
        };

        return {
          id: `focus-${track}`,
          title: latestReport.relatedEntity || track,
          subtitle: topInsight?.title.substring(0, 50) || latestReport.summary.substring(0, 50),
          status,
          description: latestReport.summary,
          actionLabel: track === 'Produkter' ? 'Gå til produktrapport' : track === 'Landskap' ? 'Se markedsrapport' : 'Gå til porteføljescan',
          targetPage: trackToPage[track],
          navParams: track === 'Produkter' && latestReport.relatedEntity ? { product: latestReport.relatedEntity } : null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, 3); // Top 3
  }, [allReports]);

  return (
    <div className="w-full max-w-[1600px] space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* 1. Header Area - Simplified */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Oversikt</h2>
        <p className="text-slate-500">Her er status for dine strategiske prioriteringer.</p>
      </div>

      {/* 2. Executive Briefing Card (Dark Theme) */}
      <section 
        className="bg-slate-900 rounded-2xl shadow-xl p-10 relative overflow-hidden cursor-pointer group hover:shadow-2xl transition-all border border-slate-800"
        onClick={() => setIsBriefOpen(true)}
      >
         {/* Clean background - removed the giant icon */}
         
         <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
            <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-5">
                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-200 border-indigo-500/20 backdrop-blur-sm px-3 py-1">
                        <Sparkles size={12} className="mr-2 fill-indigo-200"/> AI Oppsummering
                    </Badge>
                    <span className="text-slate-400 text-xs font-medium">Oppdatert i dag 08:30</span>
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-4 leading-tight tracking-tight">
                    Volatilitet i Sverige, men vekst i Danmark.
                </h1>
                <p className="text-slate-300 text-lg font-light leading-relaxed">
                   Den samlede porteføljen presterer <strong className="text-white font-medium">stabilt</strong>. 
                   Hovedfokuset denne uken er å sikre supply chain for Q1 og kapitalisere på danske refusjonsendringer.
                </p>
            </div>

            <Button className="bg-white text-slate-900 hover:bg-slate-50 font-bold px-8 py-7 rounded-xl shadow-lg whitespace-nowrap transition-transform group-hover:scale-105 text-base">
                Les Månedens Brief
            </Button>
         </div>
      </section>

      {/* 3. The Pulse (KPIs) - Refined */}
      {reportsLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <StatusTicker
          portfolioHealth={kpis.portfolioHealth}
          criticalRisks={kpis.criticalRisks}
          newOpportunities={kpis.newOpportunities}
          reportCount={kpis.reportCount}
        />
      )}

      {/* 4. Main Content: Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Strategic Agenda (Context) */}
        <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                    <Target size={20} className="text-indigo-600" />
                    Strategisk Agenda
                </h3>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top 3 Fokusområder</span>
            </div>
            
            <div className="space-y-4">
                {strategicAgenda.map((item) => (
                    <FocusAreaCard 
                        key={item.id}
                        title={item.title}
                        subtitle={item.subtitle}
                        status={item.status}
                        description={item.description}
                        actionLabel={item.actionLabel}
                        onAction={() => onNavigate(item.targetPage, item.navParams)}
                    />
                ))}
            </div>
            
            <div className="pt-4 text-center">
                <Button variant="ghost" className="text-slate-500 hover:text-slate-900" onClick={() => onNavigate('product')}>
                    Se alle produktrapporter <ArrowRight size={14} className="ml-2"/>
                </Button>
            </div>
        </div>

        {/* Right Column: Actionable Items (Execution) */}
        <div className="lg:col-span-4 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                    Anbefalte Handlinger
                </h3>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                  {actionsLoading ? '...' : actionItems?.length || 0}
                </Badge>
            </div>

            <div className="space-y-4">
                {actionsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  </div>
                ) : (actionItems && actionItems.length > 0) ? (
                    actionItems.map(action => (
                        <ActionItem
                            key={action.id}
                            id={action.id}
                            text={action.title}
                            source={action.description || 'Fra: System'}
                            priority={action.priority === 'HIGH' ? 'high' : 'medium'}
                            onComplete={handleActionComplete}
                            onDismiss={handleActionDismiss}
                        />
                    ))
                ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-emerald-500">
                            <Check size={24} />
                        </div>
                        <p className="text-slate-900 font-medium">Alt er ajour!</p>
                        <p className="text-xs text-slate-500 mt-1">Ingen ventende handlinger fra AI-analysen.</p>
                    </div>
                )}
            </div>

            <div className="bg-slate-50 p-5 rounded-xl text-xs text-slate-500 leading-relaxed border border-slate-100">
                <strong className="block text-slate-700 mb-1 font-semibold">Hvordan genereres dette?</strong>
                Handlinger prioriteres automatisk basert på risiko-score og tidsfrister identifisert i dine aktive rapporter.
            </div>

        </div>

      </div>

      <DailyBriefingModal 
        isOpen={isBriefOpen} 
        onClose={() => setIsBriefOpen(false)}
        recentInsights={INSIGHTS.filter(i => new Date(i.createdAt) > new Date(Date.now() - 3 * 86400000))}
        onNavigate={onNavigate}
        onItemClick={onItemClick}
      />
    </div>
  );
};

export default Home;
