'use client';

/**
 * Company Oracle Page (Bedriftsorakel)
 * Note: Props are injected by authenticated layout via React.cloneElement
 */

import { CompanyOracle } from '@/page-components/CompanyOracle';

export default function OraclePage() {
  return <CompanyOracle financials={[]} />;
}
