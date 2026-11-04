// Creates responsive web derivatives from the untouched originals in assets/source
// and writes assets/manifest.json linking every source file to products and placements.
// Usage: npm run assets:build   (idempotent; skips files already produced)
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { looks, duoShots, placements, categories, collections, excludedPhotos } from "./catalog.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const srcPhotos = path.join(root, "assets/source/photos");
const srcReels = path.join(root, "assets/source/reels");
const publicDir = path.join(root, "public");
const outCatalog = path.join(publicDir, "images/products");
const outBrand = path.join(publicDir, "images/brand");
const outVideos = path.join(publicDir, "videos");
const WIDTHS = [480, 800, 1200, 1800];
const FORMATS = /** @type {const} */ (["avif", "webp"]);

sharp.concurrency(2);
fs.mkdirSync(outCatalog, { recursive: true });
fs.mkdirSync(outBrand, { recursive: true });

const viewPhrase = {
  full: "Full-length view",
  "three-quarter": "Three-quarter view",
  side: "Side profile",
  seated: "Seated pose",
  movement: "Movement shot",
  portrait: "Close portrait",
  detail: "Close-up detail",
};

function hash8(file) {
  return crypto.createHash("sha1").update(fs.readFileSync(file)).digest("hex").slice(0, 8);
}

function slugBase(file) {
  return file.replace(/\.jpe?g$/i, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/-+$/, "");
}

async function derive(file, folder) {
  const src = path.join(srcPhotos, file);
  const h = hash8(src);
  const base = `${slugBase(file)}-${h}`;
  const dir = path.join(outCatalog, folder);
  fs.mkdirSync(dir, { recursive: true });
  const meta = await sharp(src).rotate().metadata();
  const width = meta.autoOrient?.width ?? meta.width;
  const height = meta.autoOrient?.height ?? meta.height;
  // Dominant colour as a lightweight placeholder while images load.
  const { dominant } = await sharp(src).resize(64).stats();
  const placeholder = `#${[dominant.r, dominant.g, dominant.b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  for (const w of WIDTHS) {
    for (const fmt of FORMATS) {
      const out = path.join(dir, `${base}-${w}.${fmt}`);
      if (fs.existsSync(out)) continue;
      const img = sharp(src).rotate().resize({ width: w, withoutEnlargement: true });
      if (fmt === "avif") await img.avif({ quality: 52, effort: 4 }).toFile(out);
      else await img.webp({ quality: 74 }).toFile(out);
    }
  }
  // JPEG fallback (and Open Graph image) at 1200px.
  const jpg = path.join(dir, `${base}-1200.jpg`);
  if (!fs.existsSync(jpg)) await sharp(src).rotate().resize({ width: 1200 }).jpeg({ quality: 78, mozjpeg: true }).toFile(jpg);
  return {
    basePath: `/images/products/${folder}/${base}`,
    width,
    height,
    placeholder,
    sha1: h,
  };
}

async function buildLogo() {
  const src = path.join(root, "assets/reference/layaan_logo.jpeg");
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // Key out the cream paper so the supplied gold lettering sits on any surface without recolouring.
  const bg = [data[0], data[1], data[2]];
  for (let i = 0; i < data.length; i += 4) {
    const d = Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);
    const a = Math.max(0, Math.min(1, (d - 14) / 46));
    data[i + 3] = Math.round(a * 255);
  }
  const keyed = sharp(data, { raw: info }).png();
  const trimmed = await keyed.toBuffer().then((b) => sharp(b).trim({ threshold: 1 }).toBuffer());
  await sharp(trimmed).resize({ width: 640 }).png({ compressionLevel: 9 }).toFile(path.join(outBrand, "logo-gold.png"));
  await sharp(trimmed).resize({ width: 640 }).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(outBrand, "logo-gold.webp"));
  const meta = await sharp(trimmed).metadata();
  await sharp(src).resize(512, 512).jpeg({ quality: 85 }).toFile(path.join(outBrand, "logo-square-512.jpg"));
  await sharp(src).resize(180, 180).png().toFile(path.join(outBrand, "apple-touch-icon.png"));
  // Favicon: the initial "L" of the supplied lettering on its cream paper.
  const { width: lw, height: lh } = await sharp(src).metadata();
  await sharp(src)
    .extract({ left: Math.round(lw * 0.135), top: Math.round(lh * 0.415), width: Math.round(lw * 0.12), height: Math.round(lw * 0.12) })
    .resize(64, 64)
    .png()
    .toFile(path.join(outBrand, "favicon-64.png"));
  return { src: "assets/reference/layaan_logo.jpeg", aspect: meta.width / meta.height, files: ["logo-gold.png", "logo-gold.webp", "logo-square-512.jpg", "apple-touch-icon.png", "favicon-64.png"] };
}

function buildReel() {
  const src = path.join(srcReels, "LAYAAN REEL 1.mov");
  if (!fs.existsSync(src)) return null;
  const out = outVideos;
  fs.mkdirSync(out, { recursive: true });
  const mp4 = path.join(out, "layaan-reel-1-720.mp4");
  const poster = path.join(out, "layaan-reel-1-poster.jpg");
  if (!fs.existsSync(mp4)) {
    const r = spawnSync(ffmpegPath, [
      "-y", "-i", src, "-vf", "scale=720:-2", "-c:v", "libx264", "-preset", "slow", "-crf", "25",
      "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart",
      "-c:a", "aac", "-b:a", "128k", mp4,
    ]);
    if (r.status !== 0) throw new Error(r.stderr.toString().slice(-800));
  }
  if (!fs.existsSync(poster)) {
    spawnSync(ffmpegPath, ["-y", "-ss", "2.5", "-i", src, "-frames:v", "1", "-vf", "scale=720:-2", "-q:v", "4", poster]);
    spawnSync(ffmpegPath, ["-y", "-ss", "2.5", "-i", src, "-frames:v", "1", "-vf", "scale=720:-2", poster.replace(".jpg", ".webp")]);
  }
  return {
    source: "assets/source/reels/LAYAAN REEL 1.mov",
    video: "/videos/layaan-reel-1-720.mp4",
    poster: "/videos/layaan-reel-1-poster.jpg",
    posterWebp: "/videos/layaan-reel-1-poster.webp",
    width: 720,
    height: 1280,
    durationSeconds: 27.6,
    sizeBytes: fs.statSync(mp4).size,
  };
}

const manifest = {
  generatedAt: new Date().toISOString(),
  note: "Product groupings, working names, and descriptions are provisional visual descriptions pending approval by LAYAAN Atelier.",
  widths: WIDTHS,
  formats: [...FORMATS, "jpg@1200"],
  categories,
  collections,
  looks: [],
  editorial: [],
  logo: null,
  reel: null,
};

const seen = new Set(excludedPhotos);
for (const look of looks) {
  const images = [];
  let order = 0;
  const entries = Object.entries(look.files).sort(([a], [b]) => (a === look.primary ? -1 : b === look.primary ? 1 : 0));
  for (const [file, view] of entries) {
    if (!fs.existsSync(path.join(srcPhotos, file))) throw new Error(`Missing source ${file}`);
    seen.add(file);
    const d = await derive(file, look.key);
    images.push({
      source: `assets/source/photos/${file}`,
      file,
      view,
      primary: file === look.primary,
      position: order++,
      alt: `${viewPhrase[view]} of the ${look.workingName.toLowerCase()} — ${look.colour.toLowerCase()}, photographed against a ${look.backdrop}.`,
      placements: placements[file] ?? [],
      ...d,
    });
    process.stdout.write(".");
  }
  manifest.looks.push({ ...look, files: undefined, images });
}

for (const [file, keys] of Object.entries(duoShots)) {
  seen.add(file);
  const d = await derive(file, "editorial");
  const names = keys.map((k) => looks.find((l) => l.key === k).workingName.toLowerCase());
  manifest.editorial.push({
    source: `assets/source/photos/${file}`,
    file,
    looks: keys,
    alt: `Two models wearing the ${names.join(" and the ")}, against a green textured backdrop.`,
    placements: placements[file] ?? [],
    ...d,
  });
}

const all = fs.readdirSync(srcPhotos).filter((f) => /\.jpe?g$/i.test(f));
const unassigned = all.filter((f) => !seen.has(f));
if (unassigned.length) throw new Error(`Unassigned photographs: ${unassigned.join(", ")}`);

manifest.logo = await buildLogo();
manifest.reel = buildReel();
manifest.sourceCount = all.length;

fs.writeFileSync(path.join(root, "assets/manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\nmanifest: ${manifest.looks.length} looks, ${all.length} photographs, reel=${!!manifest.reel}`);
