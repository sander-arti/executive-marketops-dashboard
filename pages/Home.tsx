
import React, { useState } from 'react';
import { InsightItem } from '../types';
import { INSIGHTS, PRODUCTS } from '../mock/data';
import { Button, Badge, cn } from '../components/ui';
import { DailyBriefingModal } from '../components/DailyBriefingModal';
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
  PieChart
} from 'lucide-react';

// --- Components ---

const StatusTicker = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
        {/* 1. AI Synthesized Health Score */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                        <BrainCircuit size={18} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Porteføljehelse</span>
                </div>
            </div>
            
            <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-slate-900 tracking-tight">92</span>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Stabil</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Basert på sentiment i 12 aktive rapporter.</p>
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
                <span className="text-4xl font-bold text-slate-900 tracking-tight">3</span>
                <div className="flex gap-1.5 translate-y-[-2px]">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shadow-sm"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500 opacity-50"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400 opacity-50"></div>
                </div>
            </div>
            <p className="text-xs text-slate-400 font-medium">Krever tiltak innen 30 dager.</p>
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
                <span className="text-4xl font-bold text-slate-900 tracking-tight">5</span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    2 Høy prioritet
                </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Identifisert i markedsscanning.</p>
        </div>
    </div>
);

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

  // Mock Actions State
  const [actions, setActions] = useState([
      { id: 'a1', text: 'Godkjenn Q4 kampanjebudsjett for Proponent (DK)', source: 'Fra: Proponent Rapport', priority: 'high' as const },
      { id: 'a2', text: 'Signer NDA med BioTech Alpha før due diligence', source: 'Fra: M&A Radar', priority: 'high' as const },
      { id: 'a3', text: 'Alloker ressurser til Task Force: Supply Chain Sweden', source: 'Fra: Markedsrapport', priority: 'medium' as const },
      { id: 'a4', text: 'Se over oppdatert prisstrategi for Smertebehandling', source: 'Fra: Smertebehandling', priority: 'medium' as const },
  ]);

  const handleActionComplete = (id: string) => {
      setActions(prev => prev.filter(a => a.id !== id));
  };

  const handleActionDismiss = (id: string) => {
      setActions(prev => prev.filter(a => a.id !== id));
  };

  const strategicAgenda = [
      {
          id: 'focus-1',
          title: 'Proponent',
          subtitle: 'Marked: Danmark',
          status: 'opportunity' as const,
          description: 'Nye refusjonsvilkår åpner for betydelig markedsandel. Kampanje mot fastleger må godkjennes for å utnytte Q4-vinduet.',
          actionLabel: 'Gå til produktrapport',
          targetPage: 'product',
          navParams: { product: 'Proponent' }
      },
      {
          id: 'focus-2',
          title: 'Markedsrapport',
          subtitle: 'Risiko: Supply Chain SE',
          status: 'risk' as const,
          description: 'Underleverandør i Sverige varsler forsinkelser. Dette truer leveranser for Q1. Alternativ leverandør må kvalifiseres.',
          actionLabel: 'Se markedsrapport',
          targetPage: 'landscape',
          navParams: null
      },
      {
          id: 'focus-3',
          title: 'M&A Radar',
          subtitle: 'Kandidat: BioTech Alpha',
          status: 'opportunity' as const,
          description: 'BioTech Alpha (Serie B) har teknologi som matcher vår roadmap 94%. Strategisk avdeling anbefaler å starte innledende dialog.',
          actionLabel: 'Gå til radar',
          targetPage: 'portfolio',
          navParams: null
      }
  ];

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
      <StatusTicker />

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
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">{actions.length}</Badge>
            </div>

            <div className="space-y-4">
                {actions.length > 0 ? (
                    actions.map(action => (
                        <ActionItem 
                            key={action.id}
                            {...action}
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
