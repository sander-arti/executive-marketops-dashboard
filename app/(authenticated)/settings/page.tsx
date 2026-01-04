'use client';

/**
 * Settings Page
 * Note: Props are injected by authenticated layout via React.cloneElement
 */

import { Settings } from '@/page-components/Settings';

export default function SettingsPage() {
  return <Settings financialData={[]} onUpdateFinancials={() => {}} />;
}
