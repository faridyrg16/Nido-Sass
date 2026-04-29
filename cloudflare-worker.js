// ============================================================
// Cloudflare Worker — Proxy seguro para OpenAI API
// Copia este código en tu Worker de Cloudflare
// NO subas este archivo a GitHub (es solo referencia local)
// ============================================================

export default {
  async fetch(request, env) {
    // Headers CORS para que tu GitHub Pages pueda llamarlo
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const url = new URL(request.url);
    let targetUrl;

    // Rutas del proxy
    if (url.pathname === '/chat') {
      targetUrl = 'https://api.openai.com/v1/chat/completions';
    } else if (url.pathname === '/audio') {
      targetUrl = 'https://api.openai.com/v1/audio/transcriptions';
    } else {
      return new Response('Not found', { status: 404, headers: corsHeaders });
    }

    // Reenviar la petición a OpenAI con la key secreta
    const newHeaders = new Headers();
    newHeaders.set('Authorization', `Bearer ${env.OPENAI_API_KEY}`);

    // Para /chat necesitamos Content-Type JSON
    if (url.pathname === '/chat') {
      newHeaders.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: url.pathname === '/audio'
          ? { 'Authorization': `Bearer ${env.OPENAI_API_KEY}` }
          : newHeaders,
        body: request.body,
      });

      const responseBody = await response.text();
      return new Response(responseBody, {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
