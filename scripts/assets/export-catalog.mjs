// Exports the subset of assets/manifest.json the storefront needs into
// src/data/catalog.generated.json. Run after build-derivatives.mjs.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "assets/manifest.json"), "utf8"));

const img = (i) => ({
  file: i.file,
  basePath: i.basePath,
  width: i.width,
  height: i.height,
  placeholder: i.placeholder,
  alt: i.alt,
  view: i.view ?? null,
  placements: i.placements ?? [],
});

const out = {
  note: manifest.note,
  widths: manifest.widths,
  categories: manifest.categories,
  collections: manifest.collections,
  looks: manifest.looks.map((l) => ({
    key: l.key,
    workingName: l.workingName,
    colour: l.colour,
    category: l.category,
    collections: l.collections,
    visual: l.visual,
    pieces: l.pieces,
    unconfirmedPieces: l.unconfirmedPieces,
    stylingProps: l.stylingProps,
    images: l.images.map(img),
  })),
  editorial: manifest.editorial.map((e) => ({ ...img(e), looks: e.looks })),
  reel: manifest.reel,
  logoAspect: manifest.logo?.aspect ?? 3.2,
};

const dest = path.join(root, "src/data/catalog.generated.json");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out));
console.log(`wrote ${path.relative(root, dest)} (${out.looks.length} looks)`);
