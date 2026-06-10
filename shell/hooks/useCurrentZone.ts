'use client';

import { usePathname } from 'next/navigation';
import { getZoneForPath, type Zone } from '@/lib/navigation';

export function useCurrentZone(): Zone {
  const pathname = usePathname();
  return getZoneForPath(pathname);
}
