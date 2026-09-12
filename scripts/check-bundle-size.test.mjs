import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { analyzeBundle } from "./check-bundle-size.mjs";

const temporaryDirectories = [];

const createFixture = async ({
  includeForbidden = false,
  missingOptimizer = false,
} = {}) => {
  const directory = await mkdtemp(join(tmpdir(), "bundle-size-test-"));
  temporaryDirectories.push(directory);
  await mkdir(join(directory, ".vite"));
  await mkdir(join(directory, "assets"));
  const manifest = {
    "src/routes/index.tsx?pick=default&pick=$css": {
      file: "assets/route.js",
      src: "src/routes/index.tsx?pick=default&pick=$css",
      isEntry: true,
      imports: ["main.js"],
    },
    "main.js": {
      file: "assets/main.js",
      name: "index",
      isDynamicEntry: true,
      dynamicImports: ["src/lib/svg-optimize.ts"],
      imports: includeForbidden
        ? ["node_modules/svgo/index.js"]
        : ["shared.js"],
    },
    "shared.js": { file: "assets/shared.js" },
    "node_modules/svgo/index.js": { file: "assets/vendor.js" },
    "src/lib/svg-optimize.ts": {
      file: "assets/lazy.js",
      name: "unexpected-display-name",
      isDynamicEntry: true,
    },
    "decoy.js": {
      file: "assets/decoy.js",
      name: "index",
      isDynamicEntry: true,
    },
  };
  if (missingOptimizer) manifest["src/lib/svg-optimize.ts"] = undefined;
  await writeFile(
    join(directory, ".vite/manifest.json"),
    JSON.stringify(manifest),
  );
  for (const file of [
    "route.js",
    "main.js",
    "shared.js",
    "vendor.js",
    "decoy.js",
  ]) {
    await writeFile(join(directory, "assets", file), "x");
  }
  if (!missingOptimizer)
    await writeFile(join(directory, "assets/lazy.js"), "lazy");
  return directory;
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true })),
  );
});

describe("analyzeBundle", () => {
  test("measures the route graph and optimizer manifest key", async () => {
    const result = await analyzeBundle(await createFixture());

    expect(result.entryKey).toBe("src/routes/index.tsx?pick=default&pick=$css");
    expect(result.initialJs.map(({ file }) => file)).toEqual([
      "assets/main.js",
      "assets/route.js",
      "assets/shared.js",
    ]);
    expect(result.lazyOptimizerBytes).toBe(4);
    expect(result.failures).toEqual([]);
  });

  test("detects forbidden dependency identities even when the chunk filename is generic", async () => {
    const result = await analyzeBundle(
      await createFixture({ includeForbidden: true }),
    );

    expect(result.forbiddenInitialKeys).toEqual(["node_modules/svgo/index.js"]);
    expect(result.failures).toContain(
      "SVGO dependencies are in the initial client graph: node_modules/svgo/index.js",
    );
  });

  test("fails fast when the optimizer manifest entry is missing", async () => {
    await expect(
      analyzeBundle(await createFixture({ missingOptimizer: true })),
    ).rejects.toThrow(
      "Expected exactly one SVG optimizer manifest entry; found 0",
    );
  });
});
