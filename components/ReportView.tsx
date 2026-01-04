
import React, { useState, useEffect, useRef } from 'react';
import { Report, InsightItem, Track, FinancialMetric, MediaMention } from '../types';
import { Card } from './ui';
import { InsightCard } from './InsightCard';
import { useReportChat } from '../hooks/useReportChat';
import type { ChatResponse } from '../lib/api';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Send, 
  BarChart3, 
  Share2, 
  Download,
  Calendar,
  ChevronDown,
  LayoutGrid,
  FileText,
  AlignLeft,
  ArrowRight,
  Target,
  DollarSign,
  Activity,
  Newspaper,
  ExternalLink,
  ChevronUp,
  MoreHorizontal,
  Printer
} from 'lucide-react';
import { Button, Badge, cn, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui';

interface ReportViewProps {
  report: Report;
  allReports?: Report[]; // For history filtering
  financials?: FinancialMetric; // Specific financials for this report context (if product)
  onSelectReport?: (reportId: string) => void;
  onItemClick: (item: InsightItem) => void;
  onAddToBoard?: (item: InsightItem) => void; // Specific for portfolio items in report
}

type ViewMode = 'dashboard' | 'document';

// --- CUSTOM MINI-CHART COMPONENT ---
const TrendChart: React.FC<{ 
    currentValue: number; 
    color: 'indigo' | 'emerald'; 
    label: string 
}> = ({ currentValue, color, label }) => {
    // Simulate 6 months of history ending at currentValue
    const history = [
        currentValue * 0.82,
        currentValue * 0.88,
        currentValue * 0.85,
        currentValue * 0.92,
        currentValue * 0.96,
        currentValue
    ];

    const max = Math.max(...history) * 1.05;
    const min = Math.min(...history) * 0.9;
    const range = max - min;

    const points = history.map((val, idx) => {
        const x = (idx / (history.length - 1)) * 100;
        const y = 50 - ((val - min) / range) * 40; 
        return `${x},${y}`;
    }).join(' ');

    const areaPath = `M 0,50 ${points} L 100,50 Z`;
    const linePath = `M ${points.split(' ')[0]} L ${points.split(' ').slice(1).join(' L ')}`;

    const colors = {
        indigo: { stroke: '#6366f1', fill: '#e0e7ff', text: 'text-indigo-600' },
        emerald: { stroke: '#10b981', fill: '#d1fae5', text: 'text-emerald-600' }
    };
    const theme = colors[color];

    return (
        <div className="w-full h-full flex flex-col justify-end">
            <div className="relative h-24 w-full overflow-hidden">
                 <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                        <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: theme.fill, stopOpacity: 0.8 }} />
                            <stop offset="100%" style={{ stopColor: theme.fill, stopOpacity: 0 }} />
                        </linearGradient>
                    </defs>
                    <path d={areaPath} fill={`url(#grad-${color})`} stroke="none" />
                    <path d={linePath} fill="none" stroke={theme.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {history.map((val, idx) => {
                         const x = (idx / (history.length - 1)) * 100;
                         const y = 50 - ((val - min) / range) * 40;
                         return (
                            <circle key={idx} cx={x} cy={y} r="1.5" className={idx === 5 ? theme.text : "text-white"} fill="currentColor" stroke={theme.stroke} strokeWidth="0.5" />
                         );
                    })}
                 </svg>
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider px-1">
                <span>Mai</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span className="text-slate-900 font-bold">Okt</span>
            </div>
        </div>
    );
};


const RevenueCard: React.FC<{ data: FinancialMetric }> = ({ data }) => {
    const diff = (data.revenue - data.targetRevenue).toFixed(1);
    const isPositive = data.revenue >= data.targetRevenue;

    return (
        <Card className="p-0 overflow-hidden border-slate-200 flex flex-col h-full bg-white relative hover:shadow-lg transition-all duration-300 group">
            <div className="p-6 pb-0 flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                        <DollarSign size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-0.5">Finansiell Ytelse</h4>
                        <div className="flex items-center gap-2">
                             <span className="text-2xl font-bold text-slate-900 tracking-tight">{data.revenue}</span>
                             <span className="text-sm font-medium text-slate-400">MNOK</span>
                        </div>
                    </div>
                </div>
                <Badge variant={isPositive ? "success" : "warning"} className="flex items-center gap-1">
                    {isPositive ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                    {isPositive ? "+" : ""}{diff}
                </Badge>
            </div>

            <div className="flex-1 mt-auto px-2 pb-2">
                <TrendChart currentValue={data.revenue} color="emerald" label="Omsetning" />
            </div>
        </Card>
    );
};

const MarketShareCard: React.FC<{ data: FinancialMetric }> = ({ data }) => {
    return (
        <Card className="p-0 overflow-hidden border-slate-200 flex flex-col h-full bg-white relative hover:shadow-lg transition-all duration-300 group">
             <div className="p-6 pb-0 flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                        <Activity size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-0.5">Markedsposisjon</h4>
                        <div className="flex items-center gap-2">
                             <span className="text-2xl font-bold text-slate-900 tracking-tight">{data.marketShare}%</span>
                             <span className="text-sm font-medium text-slate-400">andel</span>
                        </div>
                    </div>
                </div>
                 <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Trend</p>
                    <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">+1.2%</p>
                 </div>
            </div>

            <div className="flex-1 mt-auto px-2 pb-2">
                <TrendChart currentValue={data.marketShare} color="indigo" label="Markedsandel" />
            </div>
        </Card>
    );
};

const MediaCoverageCard: React.FC<{ mentions: MediaMention[] }> = ({ mentions }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (!mentions || mentions.length === 0) return null;

    const sentimentCounts = {
        positive: mentions.filter(m => m.sentiment === 'positive').length,
        neutral: mentions.filter(m => m.sentiment === 'neutral').length,
        negative: mentions.filter(m => m.sentiment === 'negative').length
    };

    const total = mentions.length;
    const posPct = (sentimentCounts.positive / total) * 100;
    const neuPct = (sentimentCounts.neutral / total) * 100;

    return (
        <Card className="overflow-hidden border-slate-200 bg-white transition-all duration-300 hover:shadow-lg">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center border border-slate-100">
                            <Newspaper size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-0.5">Mediedekning</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-900">{total}</span>
                                <span className="text-sm text-slate-500 font-medium">artikler</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 max-w-md px-6 border-x border-slate-100 hidden md:block">
                     <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wide">
                        <span>Sentiment</span>
                        <span className="text-slate-400 font-normal">Siste 30 dager</span>
                     </div>
                     <div className="h-2 w-full rounded-full flex overflow-hidden bg-slate-100">
                        <div className="h-full bg-emerald-500" style={{ width: `${posPct}%` }}></div>
                        <div className="h-full bg-slate-300" style={{ width: `${neuPct}%` }}></div>
                        <div className="h-full bg-rose-500 flex-1"></div>
                     </div>
                </div>

                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="shrink-0 text-slate-500 hover:text-slate-900">
                    {isExpanded ? 'Skjul' : 'Se detaljer'} 
                    {isExpanded ? <ChevronUp size={16} className="ml-2"/> : <ChevronDown size={16} className="ml-2"/>}
                </Button>
            </div>

            {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-in slide-in-from-top-2 fade-in">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                                    <TableHead className="w-[100px] text-xs font-bold uppercase tracking-wider text-slate-500">Dato</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Kilde</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Tittel</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Sentiment</TableHead>
                                    <TableHead className="text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mentions.map((mention) => (
                                    <TableRow key={mention.id}>
                                        <TableCell className="text-xs text-slate-500 font-medium whitespace-nowrap">{mention.date}</TableCell>
                                        <TableCell className="text-sm font-semibold text-slate-700">{mention.source}</TableCell>
                                        <TableCell>
                                            <span className="font-medium text-slate-900">{mention.title}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant="outline" 
                                                className={cn(
                                                    "text-[10px] uppercase tracking-wider font-bold border-0 px-2 py-1",
                                                    mention.sentiment === 'positive' ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" :
                                                    mention.sentiment === 'negative' ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200" :
                                                    "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                                                )}
                                            >
                                                {mention.sentiment === 'positive' ? 'Positiv' : mention.sentiment === 'negative' ? 'Risiko' : 'Nøytral'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600">
                                                <ExternalLink size={14} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </Card>
    );
};


export const ReportView: React.FC<ReportViewProps> = ({ 
  report, 
  allReports, 
  financials,
  onSelectReport, 
  onItemClick,
  onAddToBoard
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{
    role: 'ai' | 'user';
    text: string;
    sources?: ChatResponse['sources'];
  }>>([
    { role: 'ai', text: `Hei! Jeg har analysert ${report.title}. Hva vil du vite mer om?` }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat hook
  const chatMutation = useReportChat(report.id);

  useEffect(() => {
    setChatMessages([{ role: 'ai', text: `Hei! Jeg har analysert ${report.title}. Hva vil du vite mer om?` }]);
  }, [report.id]);

  const handleSendMessage = () => {
    if (!chatInput.trim() || chatMutation.isPending) return;

    const userMessage = chatInput;

    // Add user message immediately
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');

    // Send to AI
    chatMutation.mutate(userMessage, {
      onSuccess: (response) => {
        setChatMessages(prev => [...prev, {
          role: 'ai',
          text: response.answer,
          sources: response.sources
        }]);
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      },
      onError: (error) => {
        setChatMessages(prev => [...prev, {
          role: 'ai',
          text: `Beklager, jeg kunne ikke svare på det nå. Feil: ${error.message}`
        }]);
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      },
    });
  };

  const isProduct = report.track === Track.PRODUCT;

  return (
    <div className="flex h-[calc(100vh-140px)] gap-8 animate-in fade-in">
      
      {/* MAIN REPORT AREA with Hidden Scrollbar Utility */}
      <div className="flex-1 overflow-y-auto pr-4 flex flex-col pb-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        
        {/* NEW HEADER LAYOUT */}
        <div className="flex flex-col mb-8 flex-shrink-0">
            
            {/* 1. Meta Breadcrumbs */}
            <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="bg-white text-slate-500 font-medium px-3 py-1 border-slate-200">
                    <Calendar size={12} className="mr-2 text-slate-400"/> {report.date}
                </Badge>
                <div className="h-4 w-px bg-slate-300 rotate-12"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{report.track}</span>
            </div>

            {/* 2. Title & Action Bar */}
            <div className="flex justify-between items-end mb-8 relative">
                <h1 className="text-4xl font-extrabold text-slate-900 leading-tight tracking-tight max-w-2xl">
                    {report.title}
                </h1>
                
                {/* Clean Floating Action Bar */}
                <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm shadow-slate-200/50">
                     {allReports && (
                        <div className="relative border-r border-slate-100 pr-1 mr-1">
                            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                                Periode: Oktober <ChevronDown size={14} className="text-slate-400"/>
                            </button>
                        </div>
                    )}
                    
                    <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors" title="Del rapport">
                        <Share2 size={18} />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors" title="Last ned PDF">
                        <Download size={18} />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors" title="Skriv ut">
                        <Printer size={18} />
                    </button>
                </div>
            </div>

            {/* 3. Clean View Mode Tabs */}
            <div className="flex items-center border-b border-slate-200">
                <button 
                    onClick={() => setViewMode('dashboard')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative",
                        viewMode === 'dashboard' ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <LayoutGrid size={18} className={viewMode === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'} />
                    Dashboard
                    {viewMode === 'dashboard' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setViewMode('document')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative",
                        viewMode === 'document' ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <FileText size={18} className={viewMode === 'document' ? 'text-indigo-600' : 'text-slate-400'} />
                    Rapportdokument
                    {viewMode === 'document' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>}
                </button>
            </div>
        </div>

        {viewMode === 'dashboard' ? (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 pt-2">
                
                {/* Premium Executive Summary Card */}
                <div className="rounded-2xl p-[1px] bg-gradient-to-br from-indigo-500 via-purple-500 to-slate-900 shadow-xl">
                    <div className="bg-slate-900 rounded-[15px] p-8 md:p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <Badge variant="outline" className="text-indigo-200 border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold">
                                        Executive Summary
                                    </Badge>
                                </div>
                                <p className="text-xl md:text-2xl leading-relaxed font-medium text-white tracking-tight">
                                    {report.summary}
                                </p>
                                <div className="mt-8 flex items-start gap-4">
                                     <div className="p-2 bg-slate-800 rounded-lg border border-slate-700/50">
                                         <Sparkles size={18} className="text-indigo-400" />
                                     </div>
                                     <div className="space-y-1">
                                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Analyse</p>
                                         <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">{report.aiSummary}</p>
                                     </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center min-w-[200px] gap-3">
                                <Button 
                                    onClick={() => setViewMode('document')}
                                    className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold h-12 rounded-xl shadow-lg transition-transform hover:scale-105"
                                >
                                    Les hele rapporten <ArrowRight size={16} className="ml-2" />
                                </Button>
                                <p className="text-[10px] text-slate-500 font-medium">Est. lesetid: 4 min</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Grid */}
                {isProduct && financials && (
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[260px]">
                            <RevenueCard data={financials} />
                            <MarketShareCard data={financials} />
                        </div>
                        {financials.mediaMentions && financials.mediaMentions.length > 0 && (
                            <MediaCoverageCard mentions={financials.mediaMentions} />
                        )}
                    </div>
                )}

                {/* Key Insights List */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                         <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Target size={24} className="text-indigo-600"/>
                            Strategiske Hendelser
                        </h3>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">{report.keyInsights.length} hendelser</Badge>
                    </div>
                   
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.keyInsights.map(item => (
                            <div key={item.id} className="relative group">
                                <InsightCard item={item} onClick={onItemClick} compact />
                                {report.track === Track.PORTFOLIO && onAddToBoard && (
                                    <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" className="bg-slate-900 text-white shadow-lg" onClick={(e) => {
                                            e.stopPropagation();
                                            onAddToBoard(item);
                                        }}>
                                            Legg til i Radar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

             </div>
        ) : (
             /* DOCUMENT VIEW */
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[800px] animate-in fade-in slide-in-from-bottom-2 mx-auto w-full max-w-4xl p-16 mt-6">
                <div className="border-b border-slate-100 pb-10 mb-10 text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-slate-50 rounded-full mb-6">
                        <AlignLeft size={32} className="text-slate-400" />
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">{report.title}</h2>
                    <p className="text-slate-500 font-medium">
                        Generert {new Date().toLocaleDateString('no-NO')} • Konfidensielt • {report.track}
                    </p>
                </div>
                <div className="mb-12 p-8 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed text-lg">
                    <strong className="block text-slate-900 font-bold mb-3 uppercase text-xs tracking-wider">Sammendrag</strong>
                    {report.summary}
                </div>
                <div className="space-y-16">
                    {report.sections && report.sections.length > 0 ? (
                        report.sections.map((section, idx) => (
                            <div key={idx}>
                                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-500">{idx + 1}</span>
                                    {section.title}
                                </h3>
                                <div className="prose prose-slate max-w-none text-lg text-slate-700 leading-8 whitespace-pre-line pl-11">
                                    {section.content}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-slate-400 italic">
                            Dypdykk er ikke tilgjengelig for denne rapporten ennå.
                        </div>
                    )}
                </div>
                <div className="mt-20 pt-10 border-t border-slate-100 text-center text-sm text-slate-400">
                    <p>MarketOps Intelligence • Pharma Nordic Internt Bruk</p>
                </div>
             </div>
        )}
      </div>

      {/* AI CHAT SIDEBAR - Unchanged logic, just styling tweaks */}
      <div className={cn("w-80 bg-white border-l border-slate-200 flex flex-col transition-all duration-300 shadow-xl z-20 flex-shrink-0 rounded-tl-2xl overflow-hidden mt-4", chatOpen ? "translate-x-0" : "translate-x-full hidden")}>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600" />
                <span className="font-bold text-sm text-slate-900">AI Assistent</span>
            </div>
            <Badge variant="secondary" className="bg-white border-slate-200 text-xs">Beta</Badge>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {chatMessages.map((msg, idx) => (
                <div key={idx} className={cn("flex flex-col", msg.role === 'ai' ? "items-start" : "items-end")}>
                    <div className={cn("max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm", msg.role === 'ai' ? "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none" : "bg-slate-900 text-white rounded-tr-none")}>
                        {msg.text}
                    </div>
                    {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2 max-w-[85%]">
                            {msg.sources.map((source, sIdx) => (
                                <a
                                    key={sIdx}
                                    href={source.url || '#'}
                                    target={source.url ? '_blank' : undefined}
                                    rel={source.url ? 'noopener noreferrer' : undefined}
                                    className={cn(
                                        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors",
                                        source.url
                                            ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
                                            : "bg-slate-100 text-slate-500 border-slate-200 cursor-default"
                                    )}
                                >
                                    <span className="text-[10px] text-slate-400">📄</span>
                                    <span className="truncate max-w-[200px]">{source.title}</span>
                                    {source.url && <ExternalLink size={10} className="text-slate-400" />}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            {chatMutation.isPending && (
                <div className="flex justify-start">
                    <div className="bg-slate-50 text-slate-500 border border-slate-100 rounded-2xl rounded-tl-none p-3 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
        </div>
        <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative">
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !chatMutation.isPending && handleSendMessage()}
                    placeholder={chatMutation.isPending ? "AI tenker..." : "Spør om rapporten..."}
                    disabled={chatMutation.isPending}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                    onClick={handleSendMessage}
                    disabled={chatMutation.isPending || !chatInput.trim()}
                    className="absolute right-2 top-2 p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={14} />
                </button>
            </div>
        </div>
      </div>

    </div>
  );
};
