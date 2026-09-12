/**
 * Blurs the email on the real MFA login screenshot and writes login-authenticator-code.png.
 * Run: node scripts/prepare-login-authenticator-shot.mjs [source-path]
 */
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_SRC = join(
  process.env.HOME,
  ".cursor/projects/Users-andyhill-Developer-Rail-Intel-Landing/assets/Screenshot_2026-09-12_at_10.55.09-3eba550f-2c87-417a-82c7-198610772739.png"
);

const src = process.argv[2] || DEFAULT_SRC;
if (!existsSync(src)) {
  throw new Error(`Source screenshot not found: ${src}`);
}

const py = `
from PIL import Image, ImageDraw, ImageFilter
import json
import statistics
from pathlib import Path

ROOT = Path(r"${ROOT}")
src = Path(r"${src}")
out = ROOT / "images/screens/main-sys/login-authenticator-code.png"
manifest_path = ROOT / "images/screens/manifest.json"

img = Image.open(src).convert("RGBA")
left, top, right, bottom = 118, 428, 278, 450
bg = img.crop((left, top - 10, right, top))
fill = tuple(int(statistics.mean(p[i] for p in bg.getdata())) for i in range(3))
region = img.crop((left, top, right, bottom))
small = region.resize((8, 2), Image.Resampling.NEAREST)
mosaic = small.resize((right - left, bottom - top), Image.Resampling.NEAREST)
draw = ImageDraw.Draw(mosaic)
draw.rectangle([0, 0, right - left, bottom - top], fill=fill + (255,))
redacted = mosaic.filter(ImageFilter.GaussianBlur(radius=5))
img.paste(redacted, (left, top))
img.save(out, "PNG")

w, h = img.size
manifest = json.loads(manifest_path.read_text())
manifest.pop("images/screens/main-sys/login-mfa-verify.png", None)
manifest.pop("images/screens/main-sys/google-authenticator.png", None)
manifest["images/screens/main-sys/login-authenticator-code.png"] = {"width": w, "height": h}
manifest_path.write_text(json.dumps(manifest, indent=2) + "\\n")
print(f"wrote {out} {w}x{h}")
`;

const result = spawnSync("python3", ["-c", py], { stdio: "inherit" });
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
