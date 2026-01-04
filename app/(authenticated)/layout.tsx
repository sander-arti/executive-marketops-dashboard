'use client';

/**
 * Authenticated Layout
 * Wraps all authenticated pages with Layout, handles global state (drawer, insights, financials)
 */

import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { DetailDrawer } from '@/components/DetailDrawer';
import { InsightItem, Track, PortfolioStatus, FinancialMetric } from '@/types';
import { INSIGHTS, MOCK_FINANCIALS } from '@/mock/data';
import { usePathname } from 'next/navigation';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [selectedInsight, setSelectedInsight] = useState<InsightItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Lifted State: Manage insights here to support actions (Move/Reject)
  const [insights, setInsights] = useState<InsightItem[]>(INSIGHTS);

  // Lifted State: Financial Data (Shared between Settings, Oracle, and Dashboards)
  const [financialData, setFinancialData] = useState<FinancialMetric[]>(MOCK_FINANCIALS);

  // Calculate "New" counts per track for the sidebar badges
  const newCounts = useMemo(() => {
    const counts: Record<string, number> = {
      product: 0,
      landscape: 0,
      portfolio: 0
    };

    const now = new Date();

    insights.forEach(item => {
      const diffTime = Math.abs(now.getTime() - new Date(item.createdAt).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 3) {
        if (item.track === Track.PRODUCT) counts.product++;
        if (item.track === Track.LANDSCAPE) counts.landscape++;
        if (item.track === Track.PORTFOLIO) counts.portfolio++;
      }
    });

    return counts;
  }, [insights]);

  // Map pathname to ViewState for Layout component
  const getActivePageFromPath = (path: string) => {
    if (path === '/') return 'home';
    if (path.startsWith('/oracle')) return 'oracle';
    if (path.startsWith('/product')) return 'product';
    if (path.startsWith('/landscape')) return 'landscape';
    if (path.startsWith('/portfolio')) return 'portfolio';
    if (path.startsWith('/settings')) return 'settings';
    return 'home';
  };

  const activePage = getActivePageFromPath(pathname || '/');

  const handleItemClick = (item: InsightItem) => {
    setSelectedInsight(item);
    setIsDrawerOpen(true);
  };

  // Handlers for Portfolio Actions
  const handleMoveItem = (id: string, newStatus: PortfolioStatus) => {
    setInsights(prev => prev.map(item =>
        item.id === id ? { ...item, status: newStatus } : item
    ));
    if (selectedInsight && selectedInsight.id === id) {
        setSelectedInsight({ ...selectedInsight, status: newStatus });
    }
  };

  const handleRejectItem = (id: string) => {
    setInsights(prev => prev.filter(item => item.id !== id));
    if (selectedInsight && selectedInsight.id === id) {
        setIsDrawerOpen(false);
    }
  };

  return (
    <Layout activePage={activePage as any} onNavigate={() => {}} newCounts={newCounts}>
      {React.cloneElement(children as React.ReactElement, {
        onItemClick: handleItemClick,
        onMove: handleMoveItem,
        onReject: handleRejectItem,
        items: insights.filter((i: InsightItem) => i.track === Track.PORTFOLIO),
        financials: financialData,
        financialData: financialData,
        onUpdateFinancials: setFinancialData,
        onNavigate: () => {}, // Navigation handled by Next.js router
      } as any)}

      <DetailDrawer
        item={selectedInsight}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onMove={handleMoveItem}
        onReject={handleRejectItem}
      />
    </Layout>
  );
}
