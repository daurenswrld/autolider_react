// Attach the admin session only to this site's API, never to external URLs.
export function adminFetch(input, options = {}) {
  const url = new URL(input, window.location.origin);
  const headers = new Headers(options.headers);
  const token = localStorage.getItem('autolider_admin_token');
  if (token && url.origin === window.location.origin && url.pathname.startsWith('/api/')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...options, headers });
}
