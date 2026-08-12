/**
 * Copies the uploaded app screenshots out of the untracked "App Screenshots"
 * working folder into images/screens/ under web-safe kebab-case names, and
 * records each file's real pixel size in images/screens/manifest.json.
 *
 * The manifest is what the page generator uses to set width/height at exactly
 * half the native size, which keeps every screenshot at 2x on Retina.
 *
 * Run: node scripts/import-screens.mjs
 */
import { readdirSync, mkdirSync, copyFileSync, writeFileSync, openSync, readSync, closeSync, statSync } from "fs";
import { dirname, join, extname, basename } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "App Screenshots");
const DEST = join(root, "images/screens");

function pngSize(file) {
  const fd = openSync(file, "r");
  const header = Buffer.alloc(24);
  readSync(fd, header, 0, 24, 0);
  closeSync(fd);
  if (header.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

const kebab = (value) =>
  value
    .replace(/\.[^.]+$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

mkdirSync(DEST, { recursive: true });

const manifest = {};
let copied = 0;

for (const category of readdirSync(SRC)) {
  const categoryPath = join(SRC, category);
  if (!statSync(categoryPath).isDirectory()) continue;

  const categorySlug = kebab(category);
  mkdirSync(join(DEST, categorySlug), { recursive: true });

  for (const file of readdirSync(categoryPath)) {
    if (extname(file).toLowerCase() !== ".png") continue;

    const from = join(categoryPath, file);
    const relative = `images/screens/${categorySlug}/${kebab(basename(file))}.png`;
    copyFileSync(from, join(root, relative));

    const size = pngSize(from);
    if (size) manifest[relative] = size;
    copied += 1;
  }
}

writeFileSync(
  join(DEST, "manifest.json"),
  JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2) + "\n"
);

console.log(`copied ${copied} screenshots into images/screens/`);
for (const [path, size] of Object.entries(manifest).sort()) {
  console.log(`  ${path}\t${size.width}x${size.height}`);
}
