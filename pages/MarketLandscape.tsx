import React, { useMemo } from 'react';
import { InsightItem, Track } from '../types';
import { ReportView } from '../components/ReportView';
import { useReports } from '../hooks/useReports';
import { Loader2 } from 'lucide-react';

interface MarketLandscapeProps {
  onItemClick: (item: InsightItem) => void;
}

export const MarketLandscape: React.FC<MarketLandscapeProps> = ({ onItemClick }) => {
  // Fetch all Landskap reports from API
  const { data: reports, isLoading, error } = useReports({
    track: Track.LANDSCAPE,
  });

  // Get latest (or only) Landskap report
  const activeReport = useMemo(() => {
    if (!reports || reports.length === 0) return null;
    return reports[0];
  }, [reports]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Laster markedsrapport...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Feil ved lasting av rapport</p>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!activeReport) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-lg">Ingen markedsrapporter tilgjengelig</p>
          <p className="text-sm mt-2">Sjekk at seed data er lastet</p>
        </div>
      </div>
    );
  }

  // Success: render report
  return (
    <ReportView
      report={activeReport}
      onItemClick={onItemClick}
      allReports={reports || []}
    />
  );
};
