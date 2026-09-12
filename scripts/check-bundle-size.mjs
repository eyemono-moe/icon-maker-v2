import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const INITIAL_JS_BUDGET = 400_000;
const LAZY_SVG_OPTIMIZER_BUDGET = 700_000;
const ROUTE_ENTRY_PREFIX = "src/routes/index.tsx?";
const SVG_OPTIMIZER_KEY = "src/lib/svg-optimize.ts";
const FORBIDDEN_INITIAL_MODULE = /(?:^|\/)(?:svgo|css-tree)(?:@|\/|$)/i;

const findUniqueEntry = (entries, predicate, description) => {
  const matches = entries
    .filter((entry) => predicate(entry[0], entry[1]))
    .sort(([a], [b]) => a.localeCompare(b));
  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one ${description}; found ${matches.length}`,
    );
  }
  return matches[0];
};

const readManifestFile = async (clientBuildDir, metadata, key) => {
  if (!metadata || typeof metadata.file !== "string") {
    throw new Error(`Manifest entry has no file: ${key}`);
  }
  try {
    return await stat(join(clientBuildDir, metadata.file));
  } catch (error) {
    throw new Error(`Manifest file is missing for ${key}: ${metadata.file}`, {
      cause: error,
    });
  }
};

export const analyzeBundle = async (clientBuildDir) => {
  const manifestPath = join(clientBuildDir, ".vite/manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const entries = Object.entries(manifest);
  const metadataByKey = new Map(entries);

  const routeEntry = findUniqueEntry(
    entries,
    (_key, value) => value.isEntry && value.src?.startsWith(ROUTE_ENTRY_PREFIX),
    "client route entry",
  );
  const [entryKey] = routeEntry;

  const optimizerEntry = findUniqueEntry(
    entries,
    (key) => key === SVG_OPTIMIZER_KEY,
    "SVG optimizer manifest entry",
  );
  const [optimizerKey, optimizerMetadata] = optimizerEntry;
  if (!optimizerMetadata.isDynamicEntry) {
    throw new Error(`SVG optimizer entry is not dynamic: ${optimizerKey}`);
  }
  const optimizerStat = await readManifestFile(
    clientBuildDir,
    optimizerMetadata,
    optimizerKey,
  );

  const initialKeys = new Set();
  const visit = (key) => {
    if (initialKeys.has(key)) return;
    const metadata = metadataByKey.get(key);
    if (!metadata) throw new Error(`Manifest import is missing: ${key}`);
    initialKeys.add(key);
    for (const importedKey of metadata.imports ?? []) visit(importedKey);
  };
  visit(entryKey);

  const sizes = await Promise.all(
    [...initialKeys].map(async (key) => {
      const metadata = metadataByKey.get(key);
      const fileStat = await readManifestFile(clientBuildDir, metadata, key);
      return { key, file: metadata.file, bytes: fileStat.size };
    }),
  );
  sizes.sort((a, b) => b.bytes - a.bytes || a.file.localeCompare(b.file));

  const initialJs = sizes.filter(({ file }) => file.endsWith(".js"));
  const initialJsBytes = initialJs.reduce((sum, chunk) => sum + chunk.bytes, 0);
  const forbiddenInitialKeys = [...initialKeys].filter((key) =>
    FORBIDDEN_INITIAL_MODULE.test(key),
  );
  const dynamicImports = new Set(
    [...initialKeys].flatMap(
      (key) => metadataByKey.get(key).dynamicImports ?? [],
    ),
  );

  const failures = [];
  if (initialJsBytes > INITIAL_JS_BUDGET) {
    failures.push("initial client JS exceeds its budget");
  }
  if (forbiddenInitialKeys.length > 0) {
    failures.push(
      `SVGO dependencies are in the initial client graph: ${forbiddenInitialKeys.join(", ")}`,
    );
  }
  if (!dynamicImports.has(optimizerKey)) {
    failures.push("SVG optimizer is not represented as a dynamic import");
  }
  if (optimizerStat.size > LAZY_SVG_OPTIMIZER_BUDGET) {
    failures.push("lazy SVG optimizer exceeds its budget");
  }

  return {
    entryKey,
    initialJs,
    initialJsBytes,
    lazyOptimizerBytes: optimizerStat.size,
    forbiddenInitialKeys,
    failures,
  };
};

const printResult = (result) => {
  console.log(
    `initial client JS: ${result.initialJsBytes} bytes (budget ${INITIAL_JS_BUDGET})`,
  );
  for (const chunk of result.initialJs) {
    console.log(`  ${chunk.file}: ${chunk.bytes} bytes`);
  }
  console.log(
    `lazy SVG optimizer: ${result.lazyOptimizerBytes} bytes (budget ${LAZY_SVG_OPTIMIZER_BUDGET})`,
  );
  if (result.failures.length > 0) {
    console.error(result.failures.map((failure) => `✖ ${failure}`).join("\n"));
    process.exitCode = 1;
  } else {
    console.log("✓ bundle budgets passed");
  }
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const clientBuildDir = resolve(
    process.argv[2] ?? ".vinxi/build/client/_build",
  );
  try {
    printResult(await analyzeBundle(clientBuildDir));
  } catch (error) {
    console.error(
      `✖ ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  }
}
