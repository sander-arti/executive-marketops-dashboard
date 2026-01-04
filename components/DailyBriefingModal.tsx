
import React from 'react';
import { InsightItem, Track, InsightType } from '../types';
import { X, Sparkles, ArrowRight, TrendingUp, AlertTriangle, Lightbulb, CheckCircle2, Calendar } from 'lucide-react';
import { Button, Badge, cn } from './ui';
import { getProductConfig } from './InsightCard';

interface DailyBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentInsights: InsightItem[];
  onNavigate: (page: any) => void;
  onItemClick: (item: InsightItem) => void;
}

export const DailyBriefingModal: React.FC<DailyBriefingModalProps> = ({ 
  isOpen, 
  onClose, 
  recentInsights,
  onNavigate,
  onItemClick
}) => {
  if (!isOpen) return null;

  // 1. Group insights for the narrative
  const productNews = recentInsights.filter(i => i.track === Track.PRODUCT);
  const landscapeNews = recentInsights.filter(i => i.track === Track.LANDSCAPE);
  const portfolioNews = recentInsights.filter(i => i.track === Track.PORTFOLIO);

  const highPriorityCount = recentInsights.filter(i => i.significanceScore > 85).length;
  const criticalRisks = recentInsights.filter(i => i.type === InsightType.RISK && i.significanceScore > 88);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 relative">
        
        {/* Close Button (Floating) */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-20 backdrop-blur-md"
        >
            <X size={20} />
        </button>

        {/* 1. Premium Dark Header */}
        <div className="bg-slate-900 p-8 pt-10 pb-12 text-white relative overflow-hidden flex-shrink-0">
             {/* Decorative Background Elements */}
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>

             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <Badge variant="outline" className="text-indigo-200 border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold">
                        <Sparkles size={12} className="mr-1.5 fill-indigo-200" /> Dagens Briefing
                    </Badge>
                    <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date().toLocaleDateString('no-NO', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>

                <h2 className="text-3xl font-serif font-medium leading-snug mb-4 tracking-tight">
                    God morgen. Du har <span className="text-indigo-300 border-b border-indigo-300/30">{recentInsights.length} oppdateringer</span>.
                </h2>
                
                {/* Dynamic Summary Text */}
                <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
                    {criticalRisks.length > 0 
                        ? <>Hovedfokuset i dag er å håndtere <strong className="text-white">volatilitet i Sverige</strong>. Samtidig ser vi positive signaler for porteføljen.</>
                        : <>Markedet ser stabilt ut. En god dag for å fokusere på langsiktig strategi for <strong className="text-white">Proponent</strong>.</>
                    }
                </p>
             </div>
        </div>

        {/* 2. Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-8 space-y-8">
            
            {/* Track 1: Products (Card Style List) */}
            {productNews.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                            <TrendingUp size={18} className="text-blue-600" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg">Produktnyheter</h3>
                    </div>
                    
                    <div className="space-y-3">
                        {productNews.map(item => {
                            const conf = item.relatedProducts[0] ? getProductConfig(item.relatedProducts[0]) : null;
                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => { onItemClick(item); onClose(); }}
                                    className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all group relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                {conf && (
                                                    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", conf.bg, conf.color, conf.border)}>
                                                        {item.relatedProducts[0]}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {new Date(item.createdAt).toLocaleTimeString('no-NO', {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 leading-snug">
                                                {item.title}
                                            </h4>
                                        </div>
                                        <div className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Track 2: Landscape (Clean List) */}
            {landscapeNews.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                            <Lightbulb size={18} className="text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg">Markedssignaler</h3>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                        {landscapeNews.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => { onItemClick(item); onClose(); }}
                                className="p-4 hover:bg-slate-50 cursor-pointer flex items-start gap-3 transition-colors"
                            >
                                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
                                <span className="text-sm font-medium text-slate-700">{item.title}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Track 3: Portfolio (Alert Style) */}
             {portfolioNews.length > 0 && (
                <section>
                     <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/60 rounded-full backdrop-blur-sm">
                                <AlertTriangle size={20} className="text-amber-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900 text-sm">Porteføljeradar</h4>
                                <p className="text-xs text-amber-800/80 mt-0.5">
                                    {portfolioNews.length} nye kandidater krever din vurdering.
                                </p>
                            </div>
                        </div>
                        <Button size="sm" onClick={() => { onNavigate('portfolio'); onClose(); }} className="bg-white text-amber-900 border border-amber-200 hover:bg-amber-100 hover:border-amber-300">
                            Gå til radar
                        </Button>
                    </div>
                </section>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-white flex justify-between items-center z-10">
            <span className="text-xs font-medium text-slate-400">
                Generert av MarketOps AI
            </span>
            <Button onClick={onClose} className="px-6 bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                <CheckCircle2 size={16} className="mr-2" />
                Marker som lest
            </Button>
        </div>

      </div>
    </div>
  );
};
