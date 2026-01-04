
import React from 'react';
import { InsightItem, InsightType } from '../types';
import { Badge, Card, CardContent, CardHeader, CardTitle, cn } from './ui';
import { TrendingUp, AlertTriangle, CheckCircle, Lightbulb, UserPlus, ArrowRight, Rocket, Droplet, HeartPulse, Box } from 'lucide-react';

export const getProductConfig = (product: string) => {
  switch (product) {
    case 'Proponent':
      return { icon: Rocket, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' };
    case 'Bentrio':
      return { icon: Droplet, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' };
    case 'Smertebehandling':
      return { icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' };
    default:
      return { icon: Box, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' };
  }
};

interface InsightCardProps {
  item: InsightItem;
  onClick: (item: InsightItem) => void;
  compact?: boolean;
}

export const InsightCard: React.FC<InsightCardProps> = ({ item, onClick, compact }) => {
  // Check if item is new (less than 3 days old)
  const isNew = React.useMemo(() => {
    const date = new Date(item.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 3;
  }, [item.createdAt]);

  const getIcon = () => {
    switch(item.type) {
      case InsightType.OPPORTUNITY: return <Lightbulb size={18} className="text-amber-500" />;
      case InsightType.RISK: return <AlertTriangle size={18} className="text-red-500" />;
      case InsightType.EVIDENCE: return <CheckCircle size={18} className="text-emerald-500" />;
      case InsightType.TREND: return <TrendingUp size={18} className="text-blue-500" />;
      case InsightType.PARTNER: return <UserPlus size={18} className="text-indigo-500" />;
    }
  };

  const getTypeStyle = () => {
    switch(item.type) {
      case InsightType.OPPORTUNITY: return "bg-amber-50 text-amber-700 border-amber-200";
      case InsightType.RISK: return "bg-red-50 text-red-700 border-red-200";
      case InsightType.EVIDENCE: return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case InsightType.PARTNER: return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div 
      onClick={() => onClick(item)}
      className="group bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col h-full relative"
    >
      {isNew && (
        <div className="absolute -top-1.5 -right-1.5 flex items-center gap-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10 border border-white animate-in zoom-in duration-300">
           <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
           NY
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2 flex-wrap items-center">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTypeStyle()}`}>
              {getIcon()}
              {item.type}
            </span>
            {item.relatedProducts.map(p => {
               const config = getProductConfig(p);
               const Icon = config.icon;
               return (
                  <span key={p} className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border", config.bg, config.color, config.border)}>
                    <Icon size={12} />
                    {p}
                  </span>
               );
            })}
             {/* Fallback for market tags if no products or just mix them */}
            {item.markets.map(m => (
              <span key={m} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                {m}
              </span>
            ))}
          </div>
          {item.fitScore && (
             <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
               {item.fitScore}% Match
             </span>
          )}
        </div>

        <h3 className="font-semibold text-slate-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>

        {!compact && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
            {item.whyBullets[0]}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-4 text-xs font-medium text-slate-500">
            <div title="Forretningsbetydning" className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${item.scores.impact > 8 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                Betydning {item.scores.impact}
            </div>
            <div title="Risikonivå" className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${item.scores.risk > 7 ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                Risiko {item.scores.risk}
            </div>
            
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 flex items-center gap-1">
                Detaljer <ArrowRight size={12}/>
            </div>
        </div>
      </div>
    </div>
  );
};
