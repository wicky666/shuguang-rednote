import tailwindcss from "@tailwindcss/postcss";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "./",
  publicDir: false,
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [react()],
  build: {
    outDir: "minitool-dist/unpacked",
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false,
    minify: true,
    assetsInlineLimit: 100000,
    lib: {
      entry: path.resolve(dirname, "src/minitool-main.tsx"),
      name: "ShuguangMiniTool",
      formats: ["iife"],
      fileName: () => "main.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
