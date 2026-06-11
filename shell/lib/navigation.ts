export type Zone = 'shell' | 'tasks' | 'board';

export interface NavLink {
  label: string;
  href: string;
  zone: Zone;
  icon: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Home',     href: '/',       zone: 'shell', icon: 'home'   },
  { label: 'My Teams', href: '/teams',  zone: 'shell', icon: 'users'  },
  { label: 'People',   href: '/people', zone: 'shell', icon: 'person' },
];

export const SHELL_ZONE_PATHS = ['/', '/teams', '/people', '/settings'];
export const TASK_ZONE_PATHS  = ['/tasks'];
export const BOARD_ZONE_PATHS = ['/board'];

export function getZoneForPath(pathname: string): Zone {
  if (pathname.startsWith('/tasks')) return 'tasks';
  if (pathname.startsWith('/board')) return 'board';
  return 'shell';
}

export function isSameZone(href: string, currentPathname: string): boolean {
  return getZoneForPath(href) === getZoneForPath(currentPathname);
}
