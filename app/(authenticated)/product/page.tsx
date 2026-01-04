'use client';

/**
 * Product Radar Page (Produktradar)
 * Note: Props are injected by authenticated layout via React.cloneElement
 */

import { ProductRadar } from '@/page-components/ProductRadar';

export default function ProductPage() {
  return <ProductRadar onItemClick={() => {}} financials={[]} />;
}
