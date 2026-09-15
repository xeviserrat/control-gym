import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="108" fill="#0d9488"/>
  <circle cx="160" cy="256" r="36" fill="none" stroke="#ffffff" stroke-width="28"/>
  <circle cx="352" cy="256" r="36" fill="none" stroke="#ffffff" stroke-width="28"/>
  <rect x="196" y="242" width="120" height="28" rx="14" fill="#ffffff"/>
</svg>`;

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of sizes) {
  const buffer = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  writeFileSync(join(publicDir, name), buffer);
  console.log(`Wrote public/${name}`);
}
