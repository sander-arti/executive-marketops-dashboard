'use client';

/**
 * Portfolio Page (Porteføljescan + Deal Flow)
 * Note: Props are injected by authenticated layout via React.cloneElement
 */

import { Portfolio } from '@/page-components/Portfolio';

export default function PortfolioPage() {
  return <Portfolio onItemClick={() => {}} onMove={() => {}} onReject={() => {}} />;
}
