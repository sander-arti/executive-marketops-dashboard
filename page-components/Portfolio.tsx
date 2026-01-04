'use client';

import React, { useState, useMemo } from 'react';
import { InsightItem, Track, PortfolioStatus } from '../types';
import { ReportView } from '../components/ReportView';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Button, cn } from '../components/ui';
import { LayoutGrid, List, ArrowRight, Activity, Microscope, Pill, FlaskConical, Target, MoreHorizontal, X, Check, ChevronRight, Trash2, FileText, Kanban, Loader2 } from 'lucide-react';
import { useReports, useInsights } from '../hooks/useReports';

interface PortfolioProps {
  onItemClick: (item: InsightItem) => void;
  onMove: (id: string, status: PortfolioStatus) => void;
  onReject: (id: string) => void;
}

// --- Kanban Components ---
type ColumnId = 'NEW' | 'REVIEW' | 'DUE_DILIGENCE';
const COLUMNS: {id: ColumnId, title: string, color: string, description: string}[] = [
  { id: 'NEW', title: 'Nye Kandidater', color: 'bg-blue-500', description: 'Inkomne leads' },
  { id: 'REVIEW', title: 'Til Vurdering', color: 'bg-amber-500', description: 'Analyse pågår' },
  { id: 'DUE_DILIGENCE', title: 'Due Diligence', color: 'bg-indigo-500', description: 'Validering' },
];

const parseTitle = (title: string) => {
  const parts = title.split(':');
  return { company: parts[0] || title, description: parts.slice(1).join(':').trim() || 'Ingen beskrivelse.' };
};
const getCompanyIcon = (company: string) => {
    const icons = [Activity, Microscope, Pill, FlaskConical, Target];
    const index = company.charCodeAt(0) % icons.length;
    const Icon = icons[index];
    return <Icon size={18} className="text-slate-600" />;
};

const KanbanCard: React.FC<{ item: InsightItem, columnId: ColumnId, onClick: () => void, onMove: any, onReject: any }> = ({ item, columnId, onClick, onMove, onReject }) => {
    const { company, description } = parseTitle(item.title);
    const matchScore = item.fitScore || 0;
    const matchColor = matchScore >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100";

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col group p-5 cursor-pointer border border-transparent hover:border-slate-200" onClick={onClick}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">{getCompanyIcon(company)}</div>
                    <div><h4 className="font-bold text-slate-900 text-sm">{company}</h4></div>
                </div>
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", matchColor)}>{matchScore}% Match</span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{description}</p>
            <div className="flex gap-2 mt-auto pt-3 border-t border-slate-50 opacity-50 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); onReject(item.id); }}>Avvis</Button>
                {columnId !== 'DUE_DILIGENCE' && (
                    <Button size="sm" className="h-8 px-3 bg-slate-900 text-white rounded-md" onClick={(e) => { 
                         e.stopPropagation(); 
                         const next = COLUMNS[COLUMNS.findIndex(c => c.id === columnId) + 1];
                         if(next) onMove(item.id, next.id); 
                    }}><ChevronRight size={14}/></Button>
                )}
            </div>
        </div>
    );
}

// --- MAIN PAGE COMPONENT ---

export const Portfolio: React.FC<PortfolioProps> = ({ onItemClick, onMove, onReject }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'board'>('report');

  // Fetch portfolio report from API
  const { data: portfolioReports, isLoading: reportsLoading, error: reportsError } = useReports({
    track: Track.PORTFOLIO,
  });
  const latestReport = portfolioReports?.[0]; // Most recent

  // Fetch partner candidates from API
  const { data: candidates, isLoading: candidatesLoading, error: candidatesError } = useInsights({
    track: Track.PORTFOLIO,
    type: 'Partnerkandidat',
  });

  // Filter out rejected, split by status
  const activeItems = useMemo(() => {
    return (candidates || []).filter(c => c.status !== 'REJECTED');
  }, [candidates]);

  const boardData = useMemo(() => {
    return {
        NEW: activeItems.filter(i => i.status === 'NEW'),
        REVIEW: activeItems.filter(i => i.status === 'REVIEW'),
        DUE_DILIGENCE: activeItems.filter(i => i.status === 'DUE_DILIGENCE'),
    };
  }, [activeItems]);

  const handlePromoteFromReport = (item: InsightItem) => {
      onMove(item.id, 'NEW');
      setActiveTab('board'); 
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in space-y-8">
      
      {/* Tab Switcher (Modern Pill Style) */}
      <div className="flex items-center justify-between">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('report')}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-md",
                    activeTab === 'report' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
            >
                <FileText size={16} />
                Månedlig Scan
            </button>
            <button 
                onClick={() => setActiveTab('board')}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-md",
                    activeTab === 'board' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
            >
                <Kanban size={16} />
                Deal Flow & Radar
                <Badge variant="secondary" className="ml-2 bg-slate-100 border border-slate-200">{activeItems.length}</Badge>
            </button>
          </div>
      </div>

      {/* Content Area */}
      {activeTab === 'report' ? (
          reportsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Laster rapport...</p>
              </div>
            </div>
          ) : reportsError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-600">
                <p className="text-lg font-semibold">Feil ved lasting av rapport</p>
                <p className="text-sm mt-2">{reportsError.message}</p>
              </div>
            </div>
          ) : !latestReport ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-lg">Ingen porteføljerapporter tilgjengelig</p>
                <p className="text-sm mt-2">Sjekk at seed data er lastet</p>
              </div>
            </div>
          ) : (
            <ReportView
                report={latestReport}
                onItemClick={onItemClick}
                onAddToBoard={handlePromoteFromReport}
                allReports={portfolioReports || []}
            />
          )
      ) : (
          /* KANBAN BOARD VIEW */
          candidatesLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Laster kandidater...</p>
              </div>
            </div>
          ) : candidatesError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-600">
                <p className="text-lg font-semibold">Feil ved lasting av kandidater</p>
                <p className="text-sm mt-2">{candidatesError.message}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex h-full gap-6 min-w-[1000px]">
                    {COLUMNS.map(col => {
                        const colItems = boardData[col.id];
                        return (
                            <div key={col.id} className="flex-1 min-w-[300px] flex flex-col h-full rounded-2xl bg-slate-100/50 border border-slate-200/50">
                                <div className="p-4 bg-transparent sticky top-0 z-10">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wide">
                                            <div className={`w-2 h-2 rounded-full ${col.color}`}></div>{col.title}
                                        </h3>
                                        <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-full shadow-sm">{colItems.length}</span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-3 custom-scrollbar">
                                    {colItems.map(item => (
                                        <KanbanCard key={item.id} item={item} columnId={col.id} onClick={() => onItemClick(item)} onMove={onMove} onReject={onReject}/>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          )
      )}
    </div>
  );
};

export default Portfolio;
