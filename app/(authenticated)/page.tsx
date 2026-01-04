'use client';

/**
 * Home Page (Root route /)
 * Wraps the Home component from pages/Home.tsx
 * Note: Props are injected by authenticated layout via React.cloneElement
 */

import { Home } from '@/page-components/Home';

export default function HomePage() {
  return <Home onItemClick={() => {}} onNavigate={() => {}} />;
}
