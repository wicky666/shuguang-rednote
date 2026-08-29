import { mkdir, rm, writeFile } from "node:fs/promises";
import { build } from "vite";

await rm(new URL("../dist", import.meta.url), { recursive: true, force: true });
await build();

const serverDirectory = new URL("../dist/server/", import.meta.url);
await mkdir(serverDirectory, { recursive: true });

const worker = `export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const url = new URL(request.url);
    url.pathname = "/index.html";
    return env.ASSETS.fetch(new Request(url, request));
  },
};
`;

const wrangler = {
  name: "shuguang-rednote",
  main: "index.js",
  compatibility_date: "2026-05-22",
  assets: {
    directory: "../client",
    binding: "ASSETS",
    not_found_handling: "single-page-application",
  },
};

await writeFile(new URL("index.js", serverDirectory), worker, "utf8");
await writeFile(new URL("wrangler.json", serverDirectory), `${JSON.stringify(wrangler, null, 2)}\n`, "utf8");
