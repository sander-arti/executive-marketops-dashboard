import React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from './ui';

interface TimeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
      <div className="px-2 text-slate-400">
        <Calendar size={14} />
      </div>
      {['7D', '30D', '3M', 'ALT'].map((tf) => (
        <button 
          key={tf} 
          onClick={() => onChange(tf)}
          className={cn(
            "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
            value === tf 
              ? "bg-slate-100 text-slate-900 shadow-sm ring-1 ring-slate-200" 
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          {tf === 'ALT' ? 'Historikk' : tf}
        </button>
      ))}
    </div>
  );
};