export async function onRequest(context) {
  // Allow both production and dev origins
  const allowedOrigins = [
    'https://www.funnelenvy.com',
    'https://funnelenvydev.wpengine.com'
  ];
  const requestOrigin = context.request.headers.get('Origin');
  const originHeader = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];

  try {
    // Only allow POST requests
    if (context.request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': originHeader,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Parse the incoming JSON body
    const body = await context.request.json();
    const websiteUrl = (body.url || '').trim();

    if (!websiteUrl) {
      return new Response(JSON.stringify({ error: 'Missing website URL' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': originHeader,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
      });
    }

    // Call the Jackal API
    const jackalResponse = await fetch('https://www.tryjackal.com/api/v1/create-audit', {
      method: 'POST',
      headers: {
        'x-api-key': 'jkl_a43bbed7272f7f7676227aae46bb3c2327d889dd',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: websiteUrl }),
    });

    if (!jackalResponse.ok) {
      return new Response(JSON.stringify({ error: 'API error' }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': originHeader,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
      });
    }

    const data = await jackalResponse.json();
    const jackalUrl = data.url;

    // Extract jackalId from the returned URL
    // Expected format: https://www.tryjackal.com/funnelenvy/${jackalId}
    const match = jackalUrl && jackalUrl.match(/\/funnelenvy\/([^/?#]+)/);
    const jackalId = match ? match[1] : null;

    if (!jackalId) {
      return new Response(JSON.stringify({ error: 'Invalid Response URL format' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': originHeader,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
      });
    }

    // Construct the new URL
    const resultUrl = `https://mp.funnelenvy.com/ai-audit-results?id=${encodeURIComponent(jackalId)}`;

    return new Response(JSON.stringify({ url: resultUrl }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': originHeader,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': originHeader,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
    });
  }
}