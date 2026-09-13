import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { analyzeBundle } from "./check-bundle-size.mjs";

const temporaryDirectories = [];

const createFixture = async ({
  includeForbidden = false,
  missingBootstrap = false,
  missingOptimizer = false,
  unreachableRoute = false,
} = {}) => {
  const directory = await mkdtemp(join(tmpdir(), "bundle-size-test-"));
  temporaryDirectories.push(directory);
  await mkdir(join(directory, ".vite"));
  await mkdir(join(directory, "assets"));
  const manifest = {
    "virtual:$vinxi/handler/client": {
      file: "assets/client.js",
      src: "virtual:$vinxi/handler/client",
      isEntry: true,
      imports: ["bootstrap-only.js", "shared.js"],
      dynamicImports: unreachableRoute
        ? []
        : ["src/routes/index.tsx?pick=default&pick=$css"],
    },
    "src/routes/index.tsx?pick=default&pick=$css": {
      file: "assets/route.js",
      src: "src/routes/index.tsx?pick=default&pick=$css",
      isEntry: true,
      imports: ["main.js", "shared.js"],
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
    "bootstrap-only.js": { file: "assets/bootstrap-only.js" },
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
  if (missingBootstrap) manifest["virtual:$vinxi/handler/client"] = undefined;
  if (missingOptimizer) manifest["src/lib/svg-optimize.ts"] = undefined;
  await writeFile(
    join(directory, ".vite/manifest.json"),
    JSON.stringify(manifest),
  );
  for (const [file, contents] of Object.entries({
    "client.js": "cc",
    "bootstrap-only.js": "bbb",
    "route.js": "rrrrr",
    "main.js": "mmmmmmm",
    "shared.js": "sssssssssss",
    "vendor.js": "v",
    "decoy.js": "d",
  })) {
    await writeFile(join(directory, "assets", file), contents);
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
  test("measures the union of bootstrap and route static graphs", async () => {
    const result = await analyzeBundle(await createFixture());

    expect(result.bootstrapKey).toBe("virtual:$vinxi/handler/client");
    expect(result.entryKey).toBe("src/routes/index.tsx?pick=default&pick=$css");
    expect(result.initialJs.map(({ file }) => file)).toEqual([
      "assets/shared.js",
      "assets/main.js",
      "assets/route.js",
      "assets/bootstrap-only.js",
      "assets/client.js",
    ]);
    expect(result.initialJsBytes).toBe(28);
    expect(result.lazyOptimizerBytes).toBe(4);
    expect(result.failures).toEqual([]);
  });

  test("fails fast when the bootstrap manifest entry is missing", async () => {
    await expect(
      analyzeBundle(await createFixture({ missingBootstrap: true })),
    ).rejects.toThrow(
      "Expected exactly one client bootstrap manifest entry; found 0",
    );
  });

  test("fails fast when the index route is not reachable from the bootstrap", async () => {
    await expect(
      analyzeBundle(await createFixture({ unreachableRoute: true })),
    ).rejects.toThrow(
      "Client index route is not reachable from bootstrap dynamic imports",
    );
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
