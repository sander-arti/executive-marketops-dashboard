'use client';

/**
 * Market Landscape Page (Markedsrapport)
 * Note: Props are injected by authenticated layout via React.cloneElement
 */

import { MarketLandscape } from '@/page-components/MarketLandscape';

export default function LandscapePage() {
  return <MarketLandscape onItemClick={() => {}} />;
}
