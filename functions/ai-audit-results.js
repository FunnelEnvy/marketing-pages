// functions/ai-audit-results.js

export async function onRequest(context) {
  // Get the URL object from the request to determine the origin
  const url = new URL(context.request.url);

  // Construct the URL for the static asset relative to the site's origin
  // Cloudflare Pages Functions can access static assets using context.env.ASSETS.fetch
  const assetUrl = new URL('/embed-jackal.html', url.origin);

  try {
    // Fetch the static HTML file content from the project assets
    const assetResponse = await context.env.ASSETS.fetch(assetUrl);

    // Check if the asset was fetched successfully
    if (!assetResponse.ok) {
      // Log the error for debugging on the Cloudflare side
      console.error(`Failed to fetch asset: ${assetUrl.pathname}, Status: ${assetResponse.status}`);
      // Return a generic 404 to the client
      return new Response('Not Found', { status: 404 });
    }

    // Return the HTML content with the correct content type header
    return new Response(assetResponse.body, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        // Optional: Add cache control headers if needed
        // 'Cache-Control': 'public, max-age=3600', // Cache for 1 hour example
      },
    });
  } catch (error) {
    // Log unexpected errors
    console.error(`Error processing request for ${assetUrl.pathname}:`, error);
    return new Response('Internal Server Error', { status: 500 });
  }
}