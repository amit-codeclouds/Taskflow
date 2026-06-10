import { useState, useEffect } from 'react';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const onToken = (e: Event) => setToken((e as CustomEvent).detail.token);
    const onLogout = () => setToken(null);
    window.addEventListener('auth:token', onToken);
    window.addEventListener('auth:logout', onLogout);
    return () => {
      window.removeEventListener('auth:token', onToken);
      window.removeEventListener('auth:logout', onLogout);
    };
  }, []);

  return { token };
}
