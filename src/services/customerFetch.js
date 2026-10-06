export function customerFetch(input, options = {}) {
  const url = new URL(input, window.location.origin);
  const headers = new Headers(options.headers);
  const token = localStorage.getItem('autolider_token');
  if (token && url.origin === window.location.origin && url.pathname.startsWith('/api/')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...options, headers });
}
