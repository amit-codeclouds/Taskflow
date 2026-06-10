'use client';

import { init, loadRemote } from '@module-federation/runtime';

let initialized = false;

export function initMF() {
  if (initialized) return;
  init({
    name: 'shell',
    remotes: [
      {
        name: 'taskMfe',
        entry: 'http://localhost:3001/_next/static/chunks/remoteEntry.js',
      },
      {
        name: 'boardMfe',
        entry: 'http://localhost:4200/remoteEntry.js',
      },
    ],
  });
  initialized = true;
}

export function loadRemoteModule<T = unknown>(scope: string, module: string): Promise<T> {
  initMF();
  return loadRemote<T>(`${scope}/${module}`) as Promise<T>;
}
