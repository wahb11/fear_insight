// CommonJS script - works with plain `node`
// Save as scripts/renameAndGenerate.cjs and run: node scripts/renameAndGenerate.cjs

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://fearinsight.com/product";
const COLOR = "black";      // change if needed
const DRY_RUN = false;      // set true to only log actions without renaming
const PRODUCT_DIR = path.join(process.cwd(), "public", "product");
const OUT_FILE = path.join(process.cwd(), "scripts", "uploaded_urls.txt");

// allowed image extensions (case-insensitive)
const IMAGE_REGEX = /\.(jpe?g|png|webp|gif)$/i;

function pad(n, size = 3) {
  return String(n).padStart(size, "0");
}

function log(...args) {
  console.log("[renameAndGenerate]", ...args);
}

(function main() {
  log("Working directory:", process.cwd());
  log("Product folder:", PRODUCT_DIR);

  if (!fs.existsSync(PRODUCT_DIR)) {
    console.error("ERROR: product directory not found:", PRODUCT_DIR);
    process.exit(1);
  }

  let files = fs.readdirSync(PRODUCT_DIR)
    .filter(f => IMAGE_REGEX.test(f))
    .sort((a,b) => a.localeCompare(b, undefined, { numeric: true }));

  if (files.length === 0) {
    log("No image files found in public/product. Nothing to do.");
    process.exit(0);
  }

  log("Found", files.length, "image(s). Example:", files.slice(0,5));

  // Filter out already named fNNN.* if you want to re-run safely
  files = files.filter(f => !/^f\d{3}\./i.test(f));

  if (files.length === 0) {
    log("After filtering existing f### files, nothing to rename. Exiting.");
    process.exit(0);
  }

  // 1) Rename all originals to temporary unique names to avoid collisions
  const tempNames = [];
  for (let i = 0; i < files.length; i++) {
    const old = files[i];
    const tmp = `.__tmp_rename_${Date.now()}_${i}__${old}`;
    const oldPath = path.join(PRODUCT_DIR, old);
    const tmpPath = path.join(PRODUCT_DIR, tmp);
    if (DRY_RUN) {
      log("[DRY] would rename:", old, "->", tmp);
    } else {
      fs.renameSync(oldPath, tmpPath);
      log("Renamed (tmp):", old, "->", tmp);
    }
    tempNames.push(tmp);
  }

  // 2) Rename temp files to final f### names and build URLs
  const urls = [];
  let counter = 1;
  for (const tmp of tempNames) {
    const tmpPath = path.join(PRODUCT_DIR, tmp);
    const ext = path.extname(tmp).replace(/^\./, "").toLowerCase();
    const finalName = `f${pad(counter)}.${ext}`;
    const finalPath = path.join(PRODUCT_DIR, finalName);

    if (fs.existsSync(finalPath)) {
      // shouldn't normally happen because we filtered earlier, but just in case
      console.error("ERROR: target file already exists, skipping:", finalName);
    } else {
      if (DRY_RUN) {
        log(`[DRY] would rename tmp -> final: ${tmp} -> ${finalName}`);
      } else {
        fs.renameSync(tmpPath, finalPath);
        log("Renamed (final):", tmp, "->", finalName);
      }
    }

    const url = `${BASE_URL}/${finalName}?color=${encodeURIComponent(COLOR)}`;
    urls.push(url);
    counter++;
  }

  // 3) Save URLs to file
  if (!DRY_RUN) {
    try {
      fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
      fs.writeFileSync(OUT_FILE, urls.join("\n") + "\n", "utf8");
      log("Wrote generated URLs to:", OUT_FILE);
    } catch (err) {
      console.error("ERROR writing output file:", err);
    }
  } else {
    log("[DRY] Generated URLs (not saved):\n", urls.join("\n"));
  }

  // final summary
  log("Done. Generated", urls.length, "URLs.");
  console.log(urls.join("\n"));
})();
