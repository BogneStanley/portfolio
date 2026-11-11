import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_SITE_URL = 'https://stanley-bogne.me';

export function normalizeSiteUrl(value) {
  const url = new URL(value);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'SITE_URL doit être une origine HTTPS, sans chemin, identifiants, paramètres ni fragment.',
    );
  }
  return url.origin;
}

export async function generateSeo(outputDirectory, siteUrl) {
  const origin = normalizeSiteUrl(siteUrl);
  const indexPath = resolve(outputDirectory, 'index.html');
  const html = await readFile(indexPath, 'utf8');
  await writeFile(indexPath, html.replaceAll(DEFAULT_SITE_URL, origin));
  await writeFile(
    resolve(outputDirectory, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
  );
  await writeFile(
    resolve(outputDirectory, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>\n`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await generateSeo(resolve('dist/portfolio/browser'), process.env.SITE_URL || DEFAULT_SITE_URL);
}
