/**
 * Cloudflare Worker: Mail.tm API Proxy
 *
 * This worker proxies requests to mail.tm API to avoid CORS issues.
 *
 * Setup:
 * 1. Go to Cloudflare Dashboard → Workers & Pages → Create Worker
 * 2. Paste this code into the worker editor
 * 3. Set the worker route or bind to your Cloudflare Pages
 */

const API_BASE = 'https://api.mail.tm';

// Map of endpoints to forward
const ENDPOINTS = {
  'POST:/accounts': '/accounts',
  'GET:/accounts': '/accounts',
  'GET:/domains': '/domains',
  'POST:/token': '/token',
  'DELETE:/token': '/token',
  'GET:/messages': '/messages',
  'GET:/messages/': '/messages/',
  'GET:/sources/': '/sources/',
};

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Find matching endpoint
  let targetPath = null;
  let method = request.method;

  for (const [key, value] of Object.entries(ENDPOINTS)) {
    const [epMethod, epPath] = key.split(':');
    if (method === epMethod && pathname.startsWith(epPath)) {
      targetPath = value === '/messages/'
        ? `/messages/${pathname.split('/messages/')[1]}`
        : value === '/sources/'
          ? `/sources/${pathname.split('/sources/')[1]}`
          : value;
      break;
    }
  }

  if (!targetPath) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const targetUrl = `${API_BASE}${targetPath}`;

  // Forward the request
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  // Copy relevant headers from original request
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    headers.set('Authorization', authHeader);
  }

  let body = null;
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    body = await request.text();
  }

  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Proxy error', message: error.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

addEventListener('fetch', (event) => {
  if (event.request.method === 'OPTIONS') {
    // Handle CORS preflight
    event.respondWith(
      new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    );
  } else {
    event.respondWith(handleRequest(event.request));
  }
});
