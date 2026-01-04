
import React, { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ViewState, InsightItem, Track, PortfolioStatus, FinancialMetric } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { DetailDrawer } from './components/DetailDrawer';
import { Home } from './pages/Home';
import { ProductRadar } from './pages/ProductRadar';
import { MarketLandscape } from './pages/MarketLandscape';
import { Portfolio } from './pages/Portfolio';
import { Settings } from './pages/Settings';
import { CompanyOracle } from './pages/CompanyOracle';
import Login from './pages/Login';
import { INSIGHTS, MOCK_FINANCIALS } from './mock/data';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Authenticated App Content
const AuthenticatedApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState<ViewState>('home');
  const [navParams, setNavParams] = useState<any>(null); // Store context for navigation (e.g. { product: 'Proponent' })
  const [selectedInsight, setSelectedInsight] = useState<InsightItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Lifted State: Manage insights here to support actions (Move/Reject)
  const [insights, setInsights] = useState<InsightItem[]>(INSIGHTS);

  // Lifted State: Financial Data (Shared between Settings, Oracle, and Dashboards)
  const [financialData, setFinancialData] = useState<FinancialMetric[]>(MOCK_FINANCIALS);

  // Calculate "New" counts per track for the sidebar badges (MOVED BEFORE CONDITIONAL RETURNS)
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

  // Show loading state while checking session
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg
              className="animate-spin h-8 w-8 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login />;
  }

  const handleItemClick = (item: InsightItem) => {
    setSelectedInsight(item);
    setIsDrawerOpen(true);
  };

  const handleNavigate = (page: ViewState, params?: any) => {
    setActivePage(page);
    if (params) {
      setNavParams(params);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return <Home onItemClick={handleItemClick} onNavigate={handleNavigate} />;
      case 'oracle':
        return <CompanyOracle financials={financialData} />;
      case 'product':
        return (
            <ProductRadar 
                onItemClick={handleItemClick} 
                initialProduct={navParams?.product} 
                financials={financialData}
            />
        );
      case 'landscape':
        return <MarketLandscape onItemClick={handleItemClick} />;
      case 'portfolio':
        return (
            <Portfolio 
                onItemClick={handleItemClick} 
                items={insights.filter(i => i.track === Track.PORTFOLIO)}
                onMove={handleMoveItem}
                onReject={handleRejectItem}
            />
        );
      case 'settings':
        return (
            <Settings 
                financialData={financialData}
                onUpdateFinancials={setFinancialData}
            />
        );
      default:
        return <Home onItemClick={handleItemClick} onNavigate={handleNavigate} />;
    }
  };

  // Render main app (user is authenticated)
  return (
    <Layout activePage={activePage} onNavigate={(page) => handleNavigate(page)} newCounts={newCounts}>
      {renderContent()}

      <DetailDrawer
        item={selectedInsight}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onMove={handleMoveItem}
        onReject={handleRejectItem}
      />
    </Layout>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AuthenticatedApp />
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
