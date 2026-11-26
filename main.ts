import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const sourcePath = fileURLToPath(new URL("./POST.json", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputPath = join(outputDir, "POST.json");

const rawPost = await readFile(sourcePath, "utf8");
if (Buffer.byteLength(rawPost, "utf8") > 16_384) {
  throw new Error("POST.json must be at most 16384 bytes");
}

const post: unknown = JSON.parse(rawPost);

if (typeof post !== "object" || post === null || Array.isArray(post)) {
  throw new Error("POST.json must contain a JSON object");
}

const postKeys = Object.keys(post);
if (postKeys.length !== 1 || postKeys[0] !== "url") {
  throw new Error("POST.json must contain only the url field");
}

const url = (post as { url?: unknown }).url;
if (typeof url !== "string") {
  throw new Error("POST.json must contain a string url");
}

const postUrl = new URL(url);
const allowedHosts = new Set(["x.com", "twitter.com", "www.x.com", "www.twitter.com", "mobile.x.com", "mobile.twitter.com"]);
if (!allowedHosts.has(postUrl.hostname)) {
  throw new Error("POST.json url must point to X");
}

const statusMatch = postUrl.pathname.match(/^\/(?:i\/web\/)?(?:[^/]+\/)?status\/(\d+)$/);
if (!statusMatch) {
  throw new Error("POST.json url must name an X status");
}

await mkdir(dirname(outputPath), { recursive: true });
await copyFile(sourcePath, outputPath);

console.log(`Copied POST.json for X status ${statusMatch[1]} to ${outputPath}`);
