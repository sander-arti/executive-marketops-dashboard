
import React, { useState } from 'react';
import { InsightItem, InsightType, Track, PortfolioStatus } from '../types';
import { X, ExternalLink, FileText, CheckCircle, AlertTriangle, TrendingUp, Lightbulb, Trash2, ArrowRight } from 'lucide-react';
import { Badge, Tabs, TabsList, TabsTrigger, Button } from './ui';

interface DetailDrawerProps {
  item: InsightItem | null;
  isOpen: boolean;
  onClose: () => void;
  onMove?: (id: string, status: PortfolioStatus) => void;
  onReject?: (id: string) => void;
}

const FLOW_MAP: Record<PortfolioStatus, { label: string; next: PortfolioStatus; nextLabel: string }> = {
    'NEW': { label: 'Ny Kandidat', next: 'REVIEW', nextLabel: 'Start Vurdering' },
    'REVIEW': { label: 'Til Vurdering', next: 'DUE_DILIGENCE', nextLabel: 'Start Due Diligence' },
    'DUE_DILIGENCE': { label: 'Due Diligence', next: 'SIGNED', nextLabel: 'Signer Avtale' },
    'SIGNED': { label: 'Signert', next: 'SIGNED', nextLabel: 'Fullført' },
    'REJECTED': { label: 'Avvist', next: 'NEW', nextLabel: 'Gjenoppta' },
};

export const DetailDrawer: React.FC<DetailDrawerProps> = ({ item, isOpen, onClose, onMove, onReject }) => {
  const [activeTab, setActiveTab] = useState<'sammendrag' | 'hvorfor' | 'kilder' | 'neste'>('sammendrag');

  if (!isOpen || !item) return null;

  const getTypeIcon = () => {
    switch(item.type) {
      case InsightType.OPPORTUNITY: return <Lightbulb className="text-amber-500" />;
      case InsightType.RISK: return <AlertTriangle className="text-red-500" />;
      case InsightType.EVIDENCE: return <CheckCircle className="text-emerald-500" />;
      case InsightType.TREND: return <TrendingUp className="text-blue-500" />;
      default: return <FileText className="text-slate-500" />;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isPortfolio = item.track === Track.PORTFOLIO && item.status;
  const flow = isPortfolio && item.status ? FLOW_MAP[item.status] : null;

  return (
    <>
      {/* Drawer Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300"
        onClick={handleBackdropClick}
      >
        <div className="w-[600px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  {getTypeIcon()}
                </div>
                <div>
                  <div className="flex gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{item.type}</Badge>
                    {isPortfolio && flow ? (
                        <Badge variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-100">{flow.label}</Badge>
                    ) : (
                        <>
                             {item.relatedProducts.map(p => <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>)}
                             {item.markets.map(m => <Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>)}
                        </>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 leading-snug">{item.title}</h2>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            {/* Quick Scores */}
            <div className="flex gap-6 mt-6">
              {[
                { label: 'Betydning', value: item.scores.impact, color: 'bg-emerald-500' },
                { label: 'Risiko', value: item.scores.risk, color: 'bg-amber-500' },
                { label: 'Troverdighet', value: item.scores.credibility, color: 'bg-blue-500' }
              ].map(stat => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 font-medium uppercase">{stat.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${stat.color}`} style={{ width: `${stat.value * 10}%` }}></div>
                    </div>
                    <span className="text-sm font-bold">{stat.value}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 pb-24">
            <Tabs>
              <TabsList className="w-full justify-start mb-6 bg-transparent border-b border-slate-200 rounded-none p-0 h-auto gap-6">
                {[
                  { id: 'sammendrag', label: 'Sammendrag' },
                  { id: 'hvorfor', label: 'Hvorfor' },
                  { id: 'kilder', label: 'Kilder' },
                  { id: 'neste', label: 'Neste steg' }
                ].map(tab => (
                  <TabsTrigger
                    key={tab.id}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-3 rounded-none border-b-2 px-0 ${activeTab === tab.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500'}`}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {activeTab === 'sammendrag' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <p className="text-slate-700 leading-relaxed text-base">
                    Denne innsikten fremhever en betydelig utvikling i sporet <strong>{item.track}</strong>. 
                    Basert på nylige data fra {item.sources[0]?.publisher}, er det en klar indikasjon på at strategisk handling er nødvendig.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Nøkkelpoeng</h4>
                    <p className="text-sm text-slate-600">
                      Markedsdynamikken i {item.markets.join(', ')} er i endring. Umiddelbar oppmerksomhet mot {item.relatedProducts.length > 0 ? item.relatedProducts.join(' & ') : 'porteføljestrategien'} anbefales for å utnytte denne {item.type.toLowerCase()}en.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'hvorfor' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Strategisk Rasjonale</h3>
                  <ul className="space-y-3">
                    {item.whyBullets.map((bullet, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-700">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                        <span className="text-sm leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'kilder' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {item.sources.map((source, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white group cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                            {source.title}
                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h4>
                          <p className="text-sm text-slate-500 mt-1">{source.publisher} • {source.publishedAt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'neste' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Anbefalte tiltak</h3>
                  <ul className="space-y-3">
                    {item.recommendedNextSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-indigo-50/50 rounded-md border border-indigo-100 text-indigo-900">
                        <CheckCircle size={18} className="mt-0.5 text-indigo-600 shrink-0" />
                        <span className="text-sm font-medium">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Tabs>
          </div>

          {/* Action Footer for Portfolio Items */}
          {isPortfolio && flow && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  <Button 
                    variant="ghost" 
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => {
                        if(onReject) {
                            onReject(item.id);
                            onClose();
                        }
                    }}
                  >
                      <Trash2 size={16} className="mr-2" /> Avvis kandidat
                  </Button>
                  
                  {item.status !== 'SIGNED' && (
                    <Button 
                        className="bg-slate-900 text-white hover:bg-slate-800"
                        onClick={() => {
                            if(onMove) {
                                onMove(item.id, flow.next);
                                onClose();
                            }
                        }}
                    >
                        {flow.nextLabel} <ArrowRight size={16} className="ml-2" />
                    </Button>
                  )}
              </div>
          )}
        </div>
      </div>
    </>
  );
};
