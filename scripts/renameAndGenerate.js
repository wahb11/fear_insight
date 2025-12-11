const fs = require("fs");
const path = require("path");

console.log("[renameAndGenerate] Working directory:", process.cwd());

const productFolder = path.join(process.cwd(), "public", "product");
console.log("[renameAndGenerate] Product folder:", productFolder);

if (!fs.existsSync(productFolder)) {
  console.error("ERROR: product directory not found:", productFolder);
  process.exit(1);
}

const files = fs.readdirSync(productFolder);
console.log("[renameAndGenerate] Found", files.length, "file(s). Example:", files.slice(0, 5));

const validExt = [".jpg", ".jpeg", ".png", ".webp"];

// Files already matching f001.jpg pattern
const patternFiles = files.filter((file) => /^f\d{3}\./.test(file));

// Find highest fXXX number
let maxNum = 0;
for (const file of patternFiles) {
  const num = parseInt(file.substring(1, 4));
  if (num > maxNum) maxNum = num;
}

let renamedFiles = [];

for (const file of files) {
  if (file.startsWith(".__tmp_rename")) continue;

  const ext = path.extname(file).toLowerCase();
  if (!validExt.includes(ext)) continue;

  if (/^f\d{3}\./.test(file)) {
    // Already correct pattern
    renamedFiles.push(file);
    continue;
  }

  // Rename file
  maxNum++;
  const newName = `f${String(maxNum).padStart(3, "0")}${ext}`;
  fs.renameSync(path.join(productFolder, file), path.join(productFolder, newName));

  console.log(`[renameAndGenerate] Renamed: ${file} -> ${newName}`);
  renamedFiles.push(newName);
}

// Generate URLs ending with ?color=
const urls = renamedFiles.map(
  (file) => `https://fearinsight.com/product/${file}?color=`
);

const outputPath = path.join(process.cwd(), "scripts", "uploaded_urls.txt");
fs.writeFileSync(outputPath, JSON.stringify(urls, null, 2));

console.log(`[renameAndGenerate] Done. Generated ${urls.length} URLs.`);
console.log(urls);
