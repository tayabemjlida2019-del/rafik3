import path from 'node:path';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const root = path.resolve(process.cwd());
const brandingDir = path.join(root, 'branding');
const mobileImagesDir = path.join(root, 'apps', 'mobile', 'assets', 'images');
const webAppDir = path.join(root, 'apps', 'web', 'src', 'app');
const webPublicBrandDir = path.join(root, 'apps', 'web', 'public', 'brand');

const files = {
  mark: path.join(brandingDir, 'rafiq-mark.svg'),
  foreground: path.join(brandingDir, 'rafiq-foreground.svg'),
  wordmark: path.join(brandingDir, 'rafiq-wordmark.svg'),
};

async function ensureDirs() {
  await fs.mkdir(mobileImagesDir, { recursive: true });
  await fs.mkdir(webAppDir, { recursive: true });
  await fs.mkdir(webPublicBrandDir, { recursive: true });
}

async function renderSvgToPng({ svgPath, outPath, size, background }) {
  const svg = await fs.readFile(svgPath);
  const img = sharp(svg, { density: 256 }).resize(size, size, { fit: 'cover' });
  const out = background ? img.flatten({ background }) : img;
  await out.png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(outPath);
}

async function main() {
  await ensureDirs();

  // Mobile: icon (1024), adaptive foreground (1024), splash (1242), favicon (48)
  await renderSvgToPng({
    svgPath: files.mark,
    outPath: path.join(mobileImagesDir, 'icon.png'),
    size: 1024,
    background: '#020617',
  });

  await renderSvgToPng({
    svgPath: files.foreground,
    outPath: path.join(mobileImagesDir, 'adaptive-icon.png'),
    size: 1024,
    background: null, // keep transparent
  });

  // Splash: centered mark on dark background, safe margins
  const splashSize = 1024;
  const splashSvg = await fs.readFile(files.mark, 'utf8');
  const splashPng = await sharp(Buffer.from(splashSvg), { density: 256 })
    .resize(splashSize, splashSize)
    .extend({
      top: 220,
      bottom: 220,
      left: 220,
      right: 220,
      background: { r: 2, g: 6, b: 23, alpha: 1 },
    })
    .resize(1242, 1242, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await fs.writeFile(path.join(mobileImagesDir, 'splash-icon.png'), splashPng);

  await renderSvgToPng({
    svgPath: files.mark,
    outPath: path.join(mobileImagesDir, 'favicon.png'),
    size: 48,
    background: '#020617',
  });

  // Web (Next App Router): icon.png is picked up automatically
  await renderSvgToPng({
    svgPath: files.mark,
    outPath: path.join(webAppDir, 'icon.png'),
    size: 512,
    background: '#020617',
  });

  // Web wordmark (optional): if exported from Figma, copy it for direct use in UI.
  try {
    await fs.access(files.wordmark);
    await fs.copyFile(files.wordmark, path.join(webPublicBrandDir, 'rafiq-wordmark.svg'));
  } catch {
    // No wordmark exported yet — skip.
  }
}

await main();

