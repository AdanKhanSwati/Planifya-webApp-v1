const PLANIFYA_API = 'https://api.planifya.pk';
const FIREBASE_KEY = 'AIzaSyBYm61RGgVLjE4e5Ebo2DjQazOwaC53-TU';
const FIREBASE_ACTIONS = new Set([
  'accounts:signInWithPassword',
  'accounts:signUp',
  'accounts:update',
  'accounts:lookup',
  'accounts:sendOobCode',
]);

function upstreamRequest(request, target) {
  const headers = new Headers(request.headers);
  // Never disclose the private Sites session cookie or its origin gate to the
  // Planifya/Firebase upstreams. Planifya authorization remains the explicit
  // Firebase bearer token, exactly as it is in the Android application.
  headers.delete('cookie');
  headers.delete('origin');
  headers.delete('referer');
  headers.delete('host');
  headers.set('x-planifya-client', 'web');
  return new Request(target, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
  });
}

async function proxy(request, target) {
  const response = await fetch(upstreamRequest(request, target));
  const headers = new Headers(response.headers);
  headers.delete('set-cookie');
  headers.set('x-content-type-options', 'nosniff');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/')) {
      return proxy(request, `${PLANIFYA_API}${url.pathname}${url.search}`);
    }

    if (url.pathname === '/__firebase/token') {
      return proxy(request, `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_KEY}`);
    }

    if (url.pathname.startsWith('/__firebase/')) {
      const action = decodeURIComponent(url.pathname.slice('/__firebase/'.length));
      if (!FIREBASE_ACTIONS.has(action)) return new Response('Unsupported authentication action', { status: 404 });
      return proxy(request, `https://identitytoolkit.googleapis.com/v1/${action}?key=${FIREBASE_KEY}`);
    }

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set('x-frame-options', 'DENY');
    headers.set('referrer-policy', 'strict-origin-when-cross-origin');
    headers.set('permissions-policy', 'camera=(self), microphone=(self), geolocation=(self)');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};
