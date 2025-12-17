import * as cheerio from 'cheerio';

export interface GoogleSearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Parses Google search HTML and extracts the top results (title, url, snippet)
 * Only official links and snippets are returned (no ads, no news, no videos)
 */
export function parseGoogleSearch(html: string, maxResults = 3): GoogleSearchResult[] {
  const $ = cheerio.load(html);
  const results: GoogleSearchResult[] = [];

  // Google search results are in div.g or div.tF2Cxc (desktop)
  $('div.g, div.tF2Cxc').each((_, el) => {
    if (results.length >= maxResults) return;
    const title = $(el).find('h3').first().text().trim();
    let url = $(el).find('a').first().attr('href') || '';
    // Remove Google redirect if present
    if (url.startsWith('/url?q=')) {
      url = decodeURIComponent(url.split('/url?q=')[1].split('&')[0]);
    }
    const snippet = $(el).find('span.aCOpRe, div.VwiC3b, div.IsZvec').first().text().trim();
    if (title && url && snippet) {
      results.push({ title, url, snippet });
    }
  });

  return results;
}
