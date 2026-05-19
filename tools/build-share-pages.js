#!/usr/bin/env node
/**
 * Generate per-artwork share pages with baked-in Open Graph / Twitter Card
 * meta tags, so that links unfurl properly on social platforms.
 *
 * Each generated file lives at gallery/share/{id}.html and immediately
 * redirects to ../view.html?id={id} for human visitors. Crawlers (which
 * do not execute JS) see only the meta tags + a minimal fallback body.
 *
 * Usage:
 *   node tools/build-share-pages.js          # rebuild all
 *   node tools/build-share-pages.js 52       # rebuild a single id
 *   node tools/build-share-pages.js 52 53    # rebuild specific ids
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(REPO_ROOT, 'gallery/recordings/index.json');
const THUMBS_DIR = path.join(REPO_ROOT, 'gallery/thumbs');
const OUT_DIR = path.join(REPO_ROOT, 'gallery/share');
const SITE_BASE = 'https://ileivoivm.github.io/inkField';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readPngSize(file) {
  try {
    const fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(24);
    fs.readSync(fd, buf, 0, 24, 0);
    fs.closeSync(fd);
    if (buf.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') return null;
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  } catch {
    return null;
  }
}

function buildDescription(item) {
  const parts = [];
  const author = item.author || 'Anonymous';
  parts.push(`A digital ink painting by ${author}`);
  if (item.strokeCount) parts.push(`${item.strokeCount} strokes`);
  if (item.durationSec) parts.push(`${item.durationSec}s`);
  if (item.date) parts.push(item.date);
  return parts.join(' · ');
}

function toAbsolute(relPath) {
  // gallery/recordings/index.json uses paths like "./thumbs/1.png?v=..."
  // which are relative to the gallery/ directory.
  const cleaned = relPath.replace(/^\.\//, '');
  return `${SITE_BASE}/gallery/${cleaned}`;
}

function renderPage(item) {
  const id = item.id;
  const title = item.title || 'Untitled';
  const author = item.author || 'Anonymous';
  // If the work's title already begins with "InkField #N", don't duplicate the prefix.
  const titleHasPrefix = new RegExp(`^InkField\\s*#${id}\\b`, 'i').test(title);
  const ogTitle = titleHasPrefix
    ? `${title} by ${author}`
    : `InkField #${id} — ${title} by ${author}`;
  const description = buildDescription(item);
  const shareUrl = `${SITE_BASE}/gallery/share/${id}.html`;
  const viewUrl = `${SITE_BASE}/gallery/view.html?id=${encodeURIComponent(id)}`;
  const imageUrl = item.thumbnail ? toAbsolute(item.thumbnail) : `${SITE_BASE}/gallery/thumbs/${id}.png`;

  const thumbFile = path.join(THUMBS_DIR, `${id}.png`);
  const size = readPngSize(thumbFile) || { width: 512, height: 512 };

  const e = escapeHtml;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${e(ogTitle)} — InkField Gallery</title>
<meta name="description" content="${e(description)}">

<meta property="og:type" content="article">
<meta property="og:site_name" content="InkField Gallery">
<meta property="og:url" content="${e(shareUrl)}">
<meta property="og:title" content="${e(ogTitle)}">
<meta property="og:description" content="${e(description)}">
<meta property="og:image" content="${e(imageUrl)}">
<meta property="og:image:width" content="${size.width}">
<meta property="og:image:height" content="${size.height}">
<meta property="og:image:alt" content="${e(title)} by ${e(author)}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${e(ogTitle)}">
<meta name="twitter:description" content="${e(description)}">
<meta name="twitter:image" content="${e(imageUrl)}">
<meta name="twitter:image:alt" content="${e(title)} by ${e(author)}">

<link rel="canonical" href="${e(viewUrl)}">
<meta http-equiv="refresh" content="0; url=../view.html?id=${e(id)}">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #333; background: #faf8f3; margin: 0; padding: 48px 24px; text-align: center; }
  img { max-width: 320px; width: 100%; height: auto; border: 1px solid #ddd; margin-bottom: 16px; }
  a { color: #5a4a3a; }
</style>
</head>
<body>
<img src="../thumbs/${e(id)}.png" alt="${e(title)} by ${e(author)}">
<h1>${e(ogTitle)}</h1>
<p>${e(description)}</p>
<p><a href="../view.html?id=${e(id)}">Open InkField viewer →</a></p>
<script>location.replace('../view.html?id=' + ${JSON.stringify(String(id))});</script>
</body>
</html>
`;
}

function main() {
  const indexJson = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
  const items = Array.isArray(indexJson.items) ? indexJson.items : [];
  const args = process.argv.slice(2);
  const filter = args.length ? new Set(args.map(String)) : null;

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  let written = 0;
  let skipped = 0;
  for (const item of items) {
    if (!item || !item.id) continue;
    if (filter && !filter.has(String(item.id))) { skipped++; continue; }
    const out = path.join(OUT_DIR, `${item.id}.html`);
    fs.writeFileSync(out, renderPage(item));
    written++;
    console.log(`wrote ${path.relative(REPO_ROOT, out)}`);
  }

  console.log(`\ndone: ${written} written, ${skipped} skipped (of ${items.length} items)`);
  if (filter && written === 0) {
    console.error(`warning: no items matched ids: ${[...filter].join(', ')}`);
    process.exit(1);
  }
}

main();
