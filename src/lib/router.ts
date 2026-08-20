import { useEffect, useState, useCallback } from 'react';

export function getHash(): string {
  const hash = window.location.hash.slice(1);
  return hash || '/';
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function useRoute() {
  const [path, setPath] = useState(getHash());

  useEffect(() => {
    const onChange = () => setPath(getHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}

export function useNavigate() {
  return useCallback((path: string) => navigate(path), []);
}

export function parseRoute(path: string): { base: string; params: string[] } {
  const cleanPath = path.split('?')[0];
  const parts = cleanPath.split('/').filter(Boolean);
  return { base: '/' + (parts[0] || ''), params: parts.slice(1) };
}

export function useParams(): Record<string, string> {
  const route = getHash();
  const parsed = parseRoute(route);
  return { id: parsed.params[0] || '' };
}
