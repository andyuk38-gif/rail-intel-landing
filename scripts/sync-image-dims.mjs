/**
 * Rewrites the width/height (and gallery data-width/data-height) attributes in
 * index.html to match the real pixel size of each screenshot, so the browser
 * always gets the correct aspect ratio and never guesses.
 *
 * Run after any recapture: node scripts/sync-image-dims.mjs
 */
import { readFileSync, writeFileSync, openSync, readSync, closeSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = join(root, "index.html");

/** Reads width/height straight out of the PNG IHDR chunk. */
function pngSize(file) {
  const fd = openSync(file, "r");
  const header = Buffer.alloc(24);
  readSync(fd, header, 0, 24, 0);
  closeSync(fd);
  if (header.toString("ascii", 12, 16) !== "IHDR") {
    throw new Error(`Not a PNG: ${file}`);
  }
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

const sizes = new Map();
function sizeFor(src) {
  if (!sizes.has(src)) sizes.set(src, pngSize(join(root, src)));
  return sizes.get(src);
}

let html = readFileSync(htmlPath, "utf8");
let changed = 0;

// Each <img> or gallery tab button carries the screenshot path, then its
// dimension attributes somewhere later in the same tag.
for (const [attr, wAttr, hAttr] of [
  ["src", "width", "height"],
  ["data-src", "data-width", "data-height"],
]) {
  const tagPattern = new RegExp(`<[^>]*?${attr}="(images/product/[^"]+)"[^>]*?>`, "g");
  html = html.replace(tagPattern, (tag, src) => {
    const { width, height } = sizeFor(src);
    let updated = tag
      .replace(new RegExp(`${wAttr}="\\d+"`), `${wAttr}="${width}"`)
      .replace(new RegExp(`${hAttr}="\\d+"`), `${hAttr}="${height}"`);
    if (updated !== tag) changed += 1;
    return updated;
  });
}

writeFileSync(htmlPath, html);

for (const [src, { width, height }] of sizes) {
  console.log(`${src.replace("images/product/", "")}\t${width}x${height}`);
}
console.log(`\nUpdated ${changed} tags in index.html`);
