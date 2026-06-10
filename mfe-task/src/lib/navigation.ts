export type Zone = 'shell' | 'tasks' | 'board';

export interface NavLink {
  label: string;
  href: string;
  zone: Zone;
  icon: string;
}

// href for 'tasks' zone is '/' — basePath-relative so <Link href="/"> → /tasks externally.
// Cross-zone links use absolute hrefs navigated via plain <a> tags.
export const NAV_LINKS: NavLink[] = [
  { label: 'Home',         href: '/',      zone: 'shell', icon: 'home' },
  { label: 'My Tasks',     href: '/',      zone: 'tasks', icon: 'check-square' },
  { label: 'Kanban Board', href: '/board', zone: 'board', icon: 'layout' },
];

export const CURRENT_ZONE: Zone = 'tasks';
