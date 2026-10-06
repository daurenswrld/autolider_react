// Service credentials stay in the backend; never import this module in React.
function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase backend storage is not configured');
  return { url, key };
}

export async function supabaseRequest(route, options = {}) {
  const { url, key } = config();
  const response = await fetch(`${url}${route}`, {
    ...options,
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...options.headers },
  });
  // Do not expose provider responses or credentials to the browser.
  if (!response.ok) throw new Error(`Persistent storage request failed (${response.status})`);
  return response;
}

export async function readSupabaseState() {
  return (await supabaseRequest('/rest/v1/autolider_state?id=eq.1&select=data,version')).json();
}

export async function writeSupabaseState(data, version) {
  return (await supabaseRequest(`/rest/v1/autolider_state?id=eq.1&version=eq.${version}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ data, version: version + 1, updated_at: new Date().toISOString() }),
  })).json();
}

export async function uploadSupabaseImage(filename, buffer) {
  // Only WebP is accepted: SVG/HTML can execute scripts on a public origin.
  if (buffer.length < 12 || buffer.toString('ascii', 0, 4) !== 'RIFF'
      || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    const error = new Error('Подготовьте изображение в формате WebP и повторите загрузку');
    error.status = 400;
    throw error;
  }
  const bucket = 'autolider-images';
  const objectPath = `uploads/${encodeURIComponent(filename)}`;
  await supabaseRequest(`/storage/v1/object/${bucket}/${objectPath}`, {
    method: 'POST', headers: { 'Content-Type': 'image/webp', 'x-upsert': 'false' }, body: buffer,
  });
  return `${config().url}/storage/v1/object/public/${bucket}/${objectPath}`;
}
