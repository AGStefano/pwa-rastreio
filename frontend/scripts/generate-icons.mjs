// Gera os ícones PNG do manifest a partir de SVGs inline. Rodar apenas quando a
// arte do ícone mudar (npm run generate-icons). Depende de "sharp", que é
// instalado sob demanda e não fica como dependência permanente do projeto.
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const OUT_DIR = new URL("../public/icons/", import.meta.url);

const svgAny = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed" />
      <stop offset="50%" stop-color="#ec4899" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)" />
  <polygon points="256,146 366,206 256,266 146,206" fill="#bef264" />
  <polygon points="146,206 256,266 256,386 146,326" fill="#84cc16" />
  <polygon points="366,206 256,266 256,386 366,326" fill="#4d7c0f" />
</svg>`;

// Fundo sangrado (sem cantos arredondados) e glífo dentro da safe zone de ~80%
// para não ser cortado quando o SO aplicar sua própria máscara.
const svgMaskable = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed" />
      <stop offset="50%" stop-color="#ec4899" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)" />
  <polygon points="256,181.6 324.2,218.8 256,256 187.8,218.8" fill="#bef264" />
  <polygon points="187.8,218.8 256,256 256,330.4 187.8,303.2" fill="#84cc16" />
  <polygon points="324.2,218.8 256,256 256,330.4 324.2,303.2" fill="#4d7c0f" />
</svg>`;

async function render(svg, size, filename) {
  const buffer = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  await writeFile(new URL(filename, OUT_DIR), buffer);
  console.log(`gerado: ${filename} (${size}x${size})`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await render(svgAny, 192, "icon-192.png");
  await render(svgAny, 512, "icon-512.png");
  await render(svgAny, 32, "favicon-32.png");
  await render(svgAny, 180, "apple-touch-icon.png");
  await render(svgMaskable, 192, "icon-maskable-192.png");
  await render(svgMaskable, 512, "icon-maskable-512.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
