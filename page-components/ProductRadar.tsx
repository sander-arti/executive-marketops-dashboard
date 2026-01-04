'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { InsightItem, Track, FinancialMetric } from '../types';
import { PRODUCTS } from '../mock/data';
import { useReports } from '../hooks/useReports';
import { ReportView } from '../components/ReportView';
import { getProductConfig } from '../components/InsightCard';
import { cn } from '../components/ui';
import { Activity, Loader2, AlertCircle } from 'lucide-react';

interface ProductRadarProps {
  onItemClick: (item: InsightItem) => void;
  initialProduct?: string;
  financials: FinancialMetric[];
}

export const ProductRadar: React.FC<ProductRadarProps> = ({ onItemClick, initialProduct, financials }) => {
  const [activeProduct, setActiveProduct] = useState<string>(PRODUCTS[0]);

  useEffect(() => {
    if (initialProduct && PRODUCTS.includes(initialProduct)) {
        setActiveProduct(initialProduct);
    }
  }, [initialProduct]);

  // Fetch reports from API for active product
  const { data: reports, isLoading, error } = useReports({
    track: Track.PRODUCT,
    relatedEntity: activeProduct,
  });

  // Find the active report from API data
  const activeReport = useMemo(() => {
    return reports?.find(r => r.track === Track.PRODUCT && r.relatedEntity === activeProduct);
  }, [reports, activeProduct]);

  // Filter all reports for this product (for ReportView allReports prop)
  const productReports = useMemo(() => {
    return reports?.filter(r => r.relatedEntity === activeProduct) || [];
  }, [reports, activeProduct]);

  // We still fetch financials to pass them down to the ReportView (for the big cards),
  // but we no longer display them in the header to avoid duplication.
  const activeFinancials = useMemo(() => {
    return financials.find(f => f.productId === activeProduct);
  }, [activeProduct, financials]);

  return (
    <div className="flex flex-col h-full animate-in fade-in space-y-6">
      
      {/* Clean Segmented Control Header */}
      <div className="sticky top-0 z-20 pt-2 pb-4 bg-[#f8fafc]/95 backdrop-blur-sm supports-[backdrop-filter]:bg-[#f8fafc]/60">
        <div className="flex justify-center">
            <div className="flex items-center p-1 bg-slate-200/60 rounded-xl shadow-inner border border-slate-200/50">
                {PRODUCTS.map(product => {
                    const isActive = activeProduct === product;
                    const config = getProductConfig(product);
                    const Icon = config.icon;
                    
                    return (
                        <button
                            key={product}
                            onClick={() => setActiveProduct(product)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300",
                                isActive 
                                    ? "bg-white text-slate-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] ring-1 ring-black/5 scale-[1.02]" 
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            )}
                        >
                            <Icon 
                                size={16} 
                                className={cn("transition-colors", isActive ? config.color : "text-slate-400")} 
                                strokeWidth={isActive ? 2.5 : 2} 
                            />
                            {product}
                        </button>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="flex-1 min-h-0 -mt-2">
          {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Loader2 size={48} className="mb-4 opacity-20 animate-spin" />
                  <p className="font-medium">Laster rapport for {activeProduct}...</p>
              </div>
          ) : error ? (
              <div className="flex flex-col items-center justify-center h-[500px] text-red-400 bg-red-50/50 rounded-2xl border border-dashed border-red-200">
                  <AlertCircle size={48} className="mb-4 opacity-20" />
                  <p className="font-medium mb-2">Kunne ikke laste rapport</p>
                  <p className="text-sm text-slate-500">{error.message}</p>
              </div>
          ) : activeReport ? (
              <ReportView
                report={activeReport}
                financials={activeFinancials}
                onItemClick={onItemClick}
                allReports={productReports}
              />
          ) : (
              <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Activity size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">Ingen rapport tilgjengelig for {activeProduct}.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default ProductRadar;
