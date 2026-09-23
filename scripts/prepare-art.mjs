import sharp from 'sharp';
import { readFile, mkdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

// Re-encode generated originals for delivery; no content or composition edits.
const manifest = JSON.parse(
  await readFile(new URL('./art-sources.json', import.meta.url), 'utf8')
);
const sourceDirectory = process.argv[2];
if (!sourceDirectory)
  throw new Error(
    'Usage: npm run assets:prepare -- <generated-originals-directory>'
  );
const destination = resolve('public/assets');
await mkdir(destination, { recursive: true });
let totalBytes = 0;
const tiles = [];
for (const [index, asset] of manifest.entries()) {
  const output = resolve(destination, `${asset.id}.webp`);
  await sharp(resolve(sourceDirectory, asset.source))
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(output);
  totalBytes += (await stat(output)).size;
  tiles.push({
    input: await sharp(output)
      .resize(256, 176, { fit: 'contain', background: '#11151c' })
      .png()
      .toBuffer(),
    left: (index % 4) * 256,
    top: Math.floor(index / 4) * 176,
  });
}
await mkdir('test-results', { recursive: true });
await sharp({
  create: {
    width: 1024,
    height: Math.ceil(manifest.length / 4) * 176,
    channels: 3,
    background: '#11151c',
  },
})
  .composite(tiles)
  .png()
  .toFile('test-results/art-contact-sheet.png');
console.log(
  `${manifest.length} images, ${Math.round(totalBytes / 1024)} KiB total`
);
