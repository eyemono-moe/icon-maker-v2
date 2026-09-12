import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const CLIENT_BUILD_DIR = resolve(
  process.argv[2] ?? ".vinxi/build/client/_build",
);
const MANIFEST_PATH = join(CLIENT_BUILD_DIR, ".vite/manifest.json");
const INITIAL_JS_BUDGET = 400_000;
const LAZY_SVG_OPTIMIZER_BUDGET = 700_000;

const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
const entries = Object.entries(manifest);
const entry = entries.find(
  ([, value]) => value.isDynamicEntry && value.name === "index",
);

if (!entry) {
  throw new Error("Unable to find the client entry in the build manifest");
}

const [entryKey, entryMetadata] = entry;
const metadataByKey = new Map(entries);
const initialFiles = new Set();
const visit = (key) => {
  if (initialFiles.has(key)) return;
  const metadata = metadataByKey.get(key);
  if (!metadata) {
    throw new Error(`Manifest import is missing: ${key}`);
  }

  initialFiles.add(key);
  for (const importedKey of metadata.imports ?? []) visit(importedKey);
};
visit(entryKey);

const sizes = await Promise.all(
  [...initialFiles].map(async (key) => {
    const metadata = metadataByKey.get(key);
    const file = metadata.file;
    const bytes = (await stat(join(CLIENT_BUILD_DIR, file))).size;
    return { key, file, bytes };
  }),
);
sizes.sort((a, b) => b.bytes - a.bytes || a.file.localeCompare(b.file));

const initialJs = sizes.filter(({ file }) => file.endsWith(".js"));
const initialJsBytes = initialJs.reduce((sum, chunk) => sum + chunk.bytes, 0);
const forbidden = initialJs.filter(({ file }) =>
  /(?:svgo|css-tree)/i.test(file),
);
const lazyOptimizer = entries.find(
  ([, value]) => value.name === "svg-optimize" && value.isDynamicEntry,
);
const lazyOptimizerBytes = lazyOptimizer
  ? (await stat(join(CLIENT_BUILD_DIR, lazyOptimizer[1].file))).size
  : 0;

console.log(
  `initial client JS: ${initialJsBytes} bytes (budget ${INITIAL_JS_BUDGET})`,
);
for (const chunk of initialJs) {
  console.log(`  ${chunk.file}: ${chunk.bytes} bytes`);
}
console.log(
  `lazy SVG optimizer: ${lazyOptimizerBytes} bytes (budget ${LAZY_SVG_OPTIMIZER_BUDGET})`,
);

const failures = [];
if (initialJsBytes > INITIAL_JS_BUDGET) {
  failures.push("initial client JS exceeds its budget");
}
if (forbidden.length > 0) {
  failures.push(
    `SVGO dependencies are in the initial client graph: ${forbidden
      .map(({ file }) => file)
      .join(", ")}`,
  );
}
if (!entryMetadata.dynamicImports?.includes("src/lib/svg-optimize.ts")) {
  failures.push("SVG optimizer is not represented as a dynamic import");
}
if (lazyOptimizerBytes > LAZY_SVG_OPTIMIZER_BUDGET) {
  failures.push("lazy SVG optimizer exceeds its budget");
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `✖ ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("✓ bundle budgets passed");
}
