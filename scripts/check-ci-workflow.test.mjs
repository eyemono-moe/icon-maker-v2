import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

const execFileAsync = promisify(execFile);
const checkerPath = fileURLToPath(
  new URL("./check-ci-workflow.mjs", import.meta.url),
);
const workflowPath = new URL("../.github/workflows/ci.yaml", import.meta.url);
const temporaryDirectories = [];
let validWorkflow;

const replaceOnce = (source, before, after) => {
  expect(source).toContain(before);
  return source.replace(before, after);
};

const replacePattern = (source, pattern, replacement) => {
  const mutated = source.replace(pattern, replacement);
  expect(mutated).not.toBe(source);
  return mutated;
};

const runChecker = async (workflow) => {
  const directory = await mkdtemp(join(tmpdir(), "ci-workflow-test-"));
  temporaryDirectories.push(directory);
  const fixturePath = join(directory, "ci.yaml");
  await writeFile(fixturePath, workflow);
  return execFileAsync(process.execPath, [checkerPath, fixturePath]);
};

beforeAll(async () => {
  validWorkflow = await readFile(workflowPath, "utf8");
});

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true })),
  );
});

describe("CI workflow contract checker", () => {
  test("accepts the checked-in workflow", async () => {
    await expect(runChecker(validWorkflow)).resolves.toMatchObject({
      stderr: "",
      stdout: expect.stringContaining("CI workflow contract is valid"),
    });
  });

  test("rejects a deploy job that does not extract the downloaded archive", async () => {
    const workflow = replaceOnce(
      validWorkflow,
      "      - run: tar -xzf vercel-output.tgz\n",
      "",
    );

    await expect(runChecker(workflow)).rejects.toMatchObject({
      stderr: expect.stringContaining(
        "deploy-preview must extract vercel-output.tgz before the Vercel action",
      ),
    });
  });

  test("rejects a preview deploy that omits --prebuilt", async () => {
    const workflow = replaceOnce(
      validWorkflow,
      "          vercel-args: --prebuilt\n",
      '          vercel-args: ""\n',
    );

    await expect(runChecker(workflow)).rejects.toMatchObject({
      stderr: expect.stringContaining(
        "deploy-preview Vercel arguments must include --prebuilt",
      ),
    });
  });

  test("rejects a deploy artifact name that differs from the upload", async () => {
    const workflow = replacePattern(
      validWorkflow,
      /(deploy-preview:[\s\S]*?name:) vercel-output/,
      "$1 mismatched-output",
    );

    await expect(runChecker(workflow)).rejects.toMatchObject({
      stderr: expect.stringContaining(
        'deploy-preview must download artifact "vercel-output"',
      ),
    });
  });

  test("rejects a production artifact name that differs from the upload", async () => {
    const workflow = replacePattern(
      validWorkflow,
      /(deploy-production:[\s\S]*?name:) vercel-output/,
      "$1 mismatched-output",
    );

    await expect(runChecker(workflow)).rejects.toMatchObject({
      stderr: expect.stringContaining(
        'deploy-production must download artifact "vercel-output"',
      ),
    });
  });

  test("rejects an incorrect upload artifact name", async () => {
    const workflow = replaceOnce(
      validWorkflow,
      "          name: vercel-output\n          path: vercel-output.tgz\n",
      "          name: renamed-output\n          path: vercel-output.tgz\n",
    );

    await expect(runChecker(workflow)).rejects.toMatchObject({
      stderr: expect.stringContaining(
        'quality must upload artifact "vercel-output"',
      ),
    });
  });

  test("rejects an incorrect upload archive path", async () => {
    const workflow = replaceOnce(
      validWorkflow,
      "          path: vercel-output.tgz\n",
      "          path: renamed-output.tgz\n",
    );

    await expect(runChecker(workflow)).rejects.toMatchObject({
      stderr: expect.stringContaining(
        'quality artifact "vercel-output" must upload vercel-output.tgz',
      ),
    });
  });

  test("rejects download before checkout", async () => {
    const workflow = replaceOnce(
      validWorkflow,
      `      - uses: actions/checkout@v6
      - uses: actions/download-artifact@v8
        with:
          name: vercel-output
`,
      `      - uses: actions/download-artifact@v8
        with:
          name: vercel-output
      - uses: actions/checkout@v6
`,
    );

    await expect(runChecker(workflow)).rejects.toMatchObject({
      stderr: expect.stringContaining(
        "deploy-preview checkout must precede artifact download",
      ),
    });
  });

  test("rejects archive extraction after the Vercel action", async () => {
    const extraction = "      - run: tar -xzf vercel-output.tgz\n";
    const withoutExtraction = replaceOnce(validWorkflow, extraction, "");
    const nextJob = withoutExtraction.indexOf("\n  deploy-production:");
    const workflow =
      withoutExtraction.slice(0, nextJob) +
      extraction +
      withoutExtraction.slice(nextJob);

    await expect(runChecker(workflow)).rejects.toMatchObject({
      stderr: expect.stringContaining(
        "deploy-preview must extract vercel-output.tgz before the Vercel action",
      ),
    });
  });

  test("rejects a production deploy that omits a required Vercel argument", async () => {
    const workflow = replaceOnce(
      validWorkflow,
      "          vercel-args: --prod --prebuilt\n",
      "          vercel-args: --prod\n",
    );

    await expect(runChecker(workflow)).rejects.toMatchObject({
      stderr: expect.stringContaining(
        "deploy-production Vercel arguments must include --prebuilt",
      ),
    });
  });

  test("rejects a production deploy that omits --prod", async () => {
    const workflow = replaceOnce(
      validWorkflow,
      "          vercel-args: --prod --prebuilt\n",
      "          vercel-args: --prebuilt\n",
    );

    await expect(runChecker(workflow)).rejects.toMatchObject({
      stderr: expect.stringContaining(
        "deploy-production Vercel arguments must include --prod",
      ),
    });
  });

  test.each([
    ["actions/checkout@v5", "actions/checkout must use major v6"],
    ["actions/upload-artifact@v6", "actions/upload-artifact must use major v7"],
    [
      "actions/download-artifact@v7",
      "actions/download-artifact must use major v8",
    ],
    ["amondnet/vercel-action@v41", "amondnet/vercel-action must use major v42"],
  ])("rejects unsupported action version %s", async (replacement, message) => {
    const action = replacement.replace(/@v\d+$/, "");
    const expectedVersion = {
      "actions/checkout": 6,
      "actions/upload-artifact": 7,
      "actions/download-artifact": 8,
      "amondnet/vercel-action": 42,
    }[action];
    const workflow = replaceOnce(
      validWorkflow,
      `${action}@v${expectedVersion}`,
      replacement,
    );

    await expect(runChecker(workflow)).rejects.toMatchObject({
      stderr: expect.stringContaining(message),
    });
  });
});
