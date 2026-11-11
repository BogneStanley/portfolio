import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateSeo, normalizeSiteUrl } from './generate-seo.mjs';

const directory = await mkdtemp(join(tmpdir(), 'portfolio-seo-'));
after(() => rm(directory, { recursive: true, force: true }));

test('accepts only a canonical HTTPS origin', () => {
  assert.equal(normalizeSiteUrl('https://portfolio.example/'), 'https://portfolio.example');
  for (const value of [
    'http://example.com',
    'https://example.com/path',
    'https://user:pass@example.com',
    'https://example.com/?x=1',
    'https://example.com/#x',
  ]) {
    assert.throws(() => normalizeSiteUrl(value));
  }
});

test('uses the deployment domain consistently without changing source files', async () => {
  const source = await readFile(new URL('../src/index.html', import.meta.url), 'utf8');
  await writeFile(join(directory, 'index.html'), source);
  await generateSeo(directory, 'https://portfolio.example');
  const html = await readFile(join(directory, 'index.html'), 'utf8');
  assert.ok(html.includes('https://portfolio.example/social-preview.png'));
  assert.ok(!html.includes('https://stanley-bogne.me'));
  const json = JSON.parse(
    html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1],
  );
  assert.equal(json.mainEntity.url, 'https://portfolio.example/');
  assert.match(
    await readFile(join(directory, 'robots.txt'), 'utf8'),
    /Sitemap: https:\/\/portfolio.example\/sitemap.xml/,
  );
  assert.match(
    await readFile(join(directory, 'sitemap.xml'), 'utf8'),
    /<loc>https:\/\/portfolio.example\/<\/loc>/,
  );
  assert.equal(await readFile(new URL('../src/index.html', import.meta.url), 'utf8'), source);
});
