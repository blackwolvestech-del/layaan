// Builds labelled contact sheets of the source photographs for visual cataloguing.
// Output goes to scripts/assets/.contact (git-ignored); originals are only read.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const srcDir = path.join(root, "assets/source/photos");
const outDir = path.join(import.meta.dirname, ".contact");
fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(srcDir).filter((f) => /\.jpe?g$/i.test(f)).sort();
const perSheet = 12;
const cols = 6;
const cellW = 260;
const cellH = 390;
const labelH = 26;

for (let s = 0; s * perSheet < files.length; s++) {
  const batch = files.slice(s * perSheet, (s + 1) * perSheet);
  const rows = Math.ceil(batch.length / cols);
  const composites = [];
  for (let i = 0; i < batch.length; i++) {
    const f = batch[i];
    const x = (i % cols) * cellW;
    const y = Math.floor(i / cols) * (cellH + labelH);
    const img = await sharp(path.join(srcDir, f))
      .rotate()
      .resize(cellW - 6, cellH - 6, { fit: "contain", background: "#222" })
      .toBuffer();
    composites.push({ input: img, left: x + 3, top: y + 3 });
    const label = Buffer.from(
      `<svg width="${cellW}" height="${labelH}"><rect width="100%" height="100%" fill="#000"/><text x="6" y="19" font-size="17" font-family="Arial" fill="#fff">${f}</text></svg>`,
    );
    composites.push({ input: label, left: x, top: y + cellH });
  }
  await sharp({
    create: { width: cols * cellW, height: rows * (cellH + labelH), channels: 3, background: "#111" },
  })
    .composite(composites)
    .jpeg({ quality: 72 })
    .toFile(path.join(outDir, `sheet-${String(s + 1).padStart(2, "0")}.jpg`));
}
console.log(`sheets: ${Math.ceil(files.length / perSheet)}`);
