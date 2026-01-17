// Supabase Edge Function: google-search
import { serve } from 'std/server';
import cheerio from 'cheerio';

serve(async (req) => {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing query' }), { status: 400 });
    }
    // Fake user-agent to avoid Google bot detection
    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=ar`;
    const res = await fetch(url, {
      headers: { 'User-Agent': userAgent },
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const results: { title: string; url: string; snippet: string }[] = [];
    $('div.g, div.tF2Cxc').each((_, el) => {
      if (results.length >= 3) return;
      const title = $(el).find('h3').first().text().trim();
      let link = $(el).find('a').first().attr('href') || '';
      if (link.startsWith('/url?q=')) {
        link = decodeURIComponent(link.split('/url?q=')[1].split('&')[0]);
      }
      const snippet = $(el).find('span.aCOpRe, div.VwiC3b, div.IsZvec').first().text().trim();
      if (title && link && snippet) {
        results.push({ title, url: link, snippet });
      }
    });
    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }
});
