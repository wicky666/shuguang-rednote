import { spawn } from "node:child_process";
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const unpacked = path.join(root, "minitool-dist", "unpacked");
const zipPath = path.join(root, "minitool-dist", "shuguang-minitool.zip");

function run(command, args, cwd = root) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with ${code}`));
    });
  });
}

async function collectFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await collectFiles(full, files);
    else files.push(full);
  }
  return files;
}

async function normalizeBundle() {
  const files = await collectFiles(unpacked);
  const assetsDir = path.join(unpacked, "assets");
  await mkdir(assetsDir, { recursive: true });

  for (const file of files) {
    const name = path.basename(file);
    if (name.endsWith(".js") && path.relative(unpacked, file) !== path.join("assets", "main.js")) {
      await copyFile(file, path.join(assetsDir, "main.js"));
      if (file !== path.join(assetsDir, "main.js")) await rm(file);
    }
    if (name.endsWith(".css") && path.relative(unpacked, file) !== path.join("assets", "style.css")) {
      await copyFile(file, path.join(assetsDir, "style.css"));
      if (file !== path.join(assetsDir, "style.css")) await rm(file);
    }
  }

  await writeFile(
    path.join(unpacked, "index.html"),
    await readFile(path.join(root, "minitool", "index.html"), "utf8"),
    "utf8",
  );
  await copyFile(path.join(root, "public", "favicon.svg"), path.join(unpacked, "favicon.svg"));
}

async function validate(unpackedDir) {
  const errors = [];
  const indexHtml = await readFile(path.join(unpackedDir, "index.html"), "utf8");
  if (!/^<!DOCTYPE html>/i.test(indexHtml)) errors.push("index.html missing doctype");
  if (!indexHtml.includes('lang="zh-CN"')) errors.push("index.html missing lang=zh-CN");
  if (!indexHtml.includes("viewport-fit=cover")) errors.push("index.html missing viewport-fit=cover");
  if (/type=["']module["']/.test(indexHtml)) errors.push("index.html still uses type=module");
  if (/<script(?![^>]*src=)/i.test(indexHtml)) errors.push("inline script found");
  if (/onclick=/.test(indexHtml)) errors.push("inline onclick found");
  if (indexHtml.includes("<base ")) errors.push("base href is forbidden");
  if (indexHtml.includes("http://") || /src=["']https?:\/\//.test(indexHtml) || /href=["']https?:\/\//.test(indexHtml)) {
    errors.push("index.html references a remote URL");
  }

  const files = await collectFiles(unpackedDir);
  const allowed = new Set([".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".woff", ".woff2", ".json"]);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const relative = path.relative(unpackedDir, file);
    if (!allowed.has(ext)) errors.push(`unsupported file type: ${relative}`);
    if (relative.includes("node_modules") || relative.endsWith(".map")) errors.push(`forbidden file: ${relative}`);
  }

  const jsFiles = files.filter((file) => file.endsWith(".js"));
  for (const file of jsFiles) {
    const text = await readFile(file, "utf8");
    const relative = path.relative(unpackedDir, file);
    if (/\bnavigator\.clipboard\b|\bexecCommand\s*\(/.test(text)) errors.push(`${relative} uses clipboard APIs`);
    if (/\bdocument\.execCommand\b/.test(text)) errors.push(`${relative} uses execCommand`);
  }

  const cssFiles = files.filter((file) => file.endsWith(".css"));
  for (const file of cssFiles) {
    const text = await readFile(file, "utf8");
    if (/url\(\s*["']?https?:\/\//.test(text)) {
      errors.push(`${path.relative(unpackedDir, file)} loads a remote url()`);
    }
  }

  if (!files.some((file) => path.relative(unpackedDir, file) === path.join("assets", "main.js"))) {
    errors.push("missing assets/main.js");
  }
  if (!files.some((file) => path.relative(unpackedDir, file) === path.join("assets", "style.css"))) {
    errors.push("missing assets/style.css");
  }
  if (!files.some((file) => path.basename(file) === "index.html" && path.dirname(file) === unpackedDir)) {
    errors.push("index.html is not at zip root");
  }

  return errors;
}

async function main() {
  await rm(path.join(root, "minitool-dist"), { recursive: true, force: true });
  await run("npx", ["vite", "build", "--config", "vite.minitool.config.ts"]);
  await normalizeBundle();

  const leftoverDirs = await readdir(unpacked, { withFileTypes: true });
  for (const entry of leftoverDirs) {
    if (entry.isDirectory() && entry.name !== "assets") {
      await rm(path.join(unpacked, entry.name), { recursive: true, force: true });
    }
  }

  const errors = await validate(unpacked);
  if (errors.length) {
    console.error("Mini-tool package failed validation:\n- " + errors.join("\n- "));
    process.exit(1);
  }

  await rm(zipPath, { force: true });
  await run("zip", ["-r", "-X", zipPath, ".", "-x", "*.DS_Store"], unpacked);

  const zipStat = await stat(zipPath);
  const sizeMb = zipStat.size / (1024 * 1024);
  if (zipStat.size > 10 * 1024 * 1024) {
    console.error(`zip is ${sizeMb.toFixed(2)}MB, exceeds 10MB limit`);
    process.exit(1);
  }

  const releasesDir = path.join(root, "releases");
  await mkdir(releasesDir, { recursive: true });
  await copyFile(zipPath, path.join(releasesDir, "shuguang-minitool.zip"));
  await copyFile(path.join(root, "public", "minitool-icon.png"), path.join(releasesDir, "shuguang-icon.png"));

  console.log(`Mini-tool zip ready: ${zipPath} (${sizeMb.toFixed(2)}MB)`);
  console.log(`Also copied to: ${path.join(releasesDir, "shuguang-minitool.zip")}`);
}

await main();
