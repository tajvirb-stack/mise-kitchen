// Fetch a recipe URL server-side and return clean text content.
// Browser can't do this directly due to CORS.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Missing url' });

    let validUrl;
    try {
      validUrl = new URL(url);
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        return res.status(400).json({ error: 'Only http(s) URLs allowed' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    const upstream = await fetch(validUrl.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MiseKitchenBot/1.0; +https://mise-kitchen.vercel.app)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      // Don't follow more than a few redirects
      redirect: 'follow',
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: `Failed to fetch URL (${upstream.status})`,
      });
    }

    const html = await upstream.text();

    // Try to extract JSON-LD schema (most recipe sites include this — fastest path)
    let jsonLd = null;
    const ldMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const m of ldMatches) {
      try {
        const obj = JSON.parse(m[1]);
        const arr = Array.isArray(obj) ? obj : [obj];
        const findRecipe = (item) => {
          if (!item) return null;
          if (item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
            return item;
          }
          if (item['@graph']) {
            for (const g of item['@graph']) {
              const found = findRecipe(g);
              if (found) return found;
            }
          }
          return null;
        };
        for (const item of arr) {
          const recipe = findRecipe(item);
          if (recipe) {
            jsonLd = recipe;
            break;
          }
        }
        if (jsonLd) break;
      } catch {
        // Skip malformed JSON-LD
      }
    }

    // If we have JSON-LD, send that (very clean for the AI). Otherwise, extract main text.
    if (jsonLd) {
      return res.status(200).json({
        type: 'json_ld',
        url: validUrl.href,
        recipe: jsonLd,
      });
    }

    // Fallback: extract main text — strip scripts/styles/tags
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<aside[\s\S]*?<\/aside>/gi, '')
      .replace(/<form[\s\S]*?<\/form>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#\d+;/g, '')
      .replace(/&#x[0-9a-f]+;/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 12000); // Cap at 12KB to avoid token blow-up

    return res.status(200).json({
      type: 'text',
      url: validUrl.href,
      text: cleaned,
    });
  } catch (err) {
    console.error('Fetch URL handler error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};
