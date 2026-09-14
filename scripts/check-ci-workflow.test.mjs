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
const reviewedVercelVersion = "50.44.0";
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

const validVercelConfig = JSON.stringify({
  framework: "solidstart-1",
  github: { enabled: false },
  outputDirectory: ".vercel",
  version: 2,
});

const runChecker = async (workflow, vercelConfig = validVercelConfig) => {
  const directory = await mkdtemp(join(tmpdir(), "ci-workflow-test-"));
  temporaryDirectories.push(directory);
  const fixturePath = join(directory, "ci.yaml");
  const vercelConfigPath = join(directory, "vercel.json");
  await writeFile(fixturePath, workflow);
  await writeFile(vercelConfigPath, vercelConfig);
  return execFileAsync(process.execPath, [
    checkerPath,
    fixturePath,
    vercelConfigPath,
  ]);
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

  test("rejects deployment config properties unsupported by the reviewed Vercel CLI", async () => {
    const config = JSON.stringify({
      ...JSON.parse(validVercelConfig),
      public: false,
    });

    await expect(runChecker(validWorkflow, config)).rejects.toMatchObject({
      stderr: expect.stringContaining(
        'Vercel deployment config must not contain unsupported property "public"',
      ),
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

  test.each(["deploy-preview", "deploy-production"])(
    "rejects %s without the quality dependency",
    async (jobName) => {
      const workflow = replacePattern(
        validWorkflow,
        new RegExp(`(${jobName}:[\\s\\S]*?)    needs: quality\\n`),
        "$1",
      );

      await expect(runChecker(workflow)).rejects.toMatchObject({
        stderr: expect.stringContaining(
          `${jobName} must depend on the quality job`,
        ),
      });
    },
  );

  test.each([
    ["removes", ""],
    ["weakens", "    if: github.event_name == 'push'\n"],
  ])("%s the production main-branch push guard", async (_, replacement) => {
    const workflow = replaceOnce(
      validWorkflow,
      "    if: github.event_name == 'push' && github.ref == 'refs/heads/main'\n",
      replacement,
    );

    await expect(runChecker(workflow)).rejects.toMatchObject({
      stderr: expect.stringContaining(
        "deploy-production must run only for pushes to refs/heads/main",
      ),
    });
  });

  test("rejects a quality job that does not create the deployment archive", async () => {
    const workflow = replaceOnce(
      validWorkflow,
      `      - name: Archive Vercel output
        if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
        run: tar -czf vercel-output.tgz .vercel/output
`,
      "",
    );

    await expect(runChecker(workflow)).rejects.toMatchObject({
      stderr: expect.stringContaining(
        "quality must create vercel-output.tgz from .vercel/output before artifact upload",
      ),
    });
  });

  test("rejects deployment archive creation after artifact upload", async () => {
    const archiveStep = `      - name: Archive Vercel output
        if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
        run: tar -czf vercel-output.tgz .vercel/output
`;
    const withoutArchive = replaceOnce(validWorkflow, archiveStep, "");
    const nextJob = withoutArchive.indexOf("\n  deploy-preview:");
    const workflow =
      withoutArchive.slice(0, nextJob) +
      archiveStep +
      withoutArchive.slice(nextJob);

    await expect(runChecker(workflow)).rejects.toMatchObject({
      stderr: expect.stringContaining(
        "quality must create vercel-output.tgz from .vercel/output before artifact upload",
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

  test.each(["deploy-preview", "deploy-production"])(
    "rejects %s downloading the archive outside the workspace root",
    async (jobName) => {
      const workflow = replacePattern(
        validWorkflow,
        new RegExp(
          `(${jobName}:[\\s\\S]*?actions/download-artifact@v8\\n        with:\\n          name: vercel-output\\n)`,
        ),
        "$1          path: nested\n",
      );

      await expect(runChecker(workflow)).rejects.toMatchObject({
        stderr: expect.stringContaining(
          `${jobName} must download vercel-output to the workspace root`,
        ),
      });
    },
  );

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
    ["deploy-preview", "latest"],
    ["deploy-preview", "59.16.0"],
    ["deploy-production", "latest"],
    ["deploy-production", "59.16.0"],
  ])("rejects %s using Vercel CLI version %s", async (jobName, replacement) => {
    const reviewedWorkflow = validWorkflow.replace(
      /^          vercel-version: .*$/gm,
      `          vercel-version: ${reviewedVercelVersion}`,
    );
    expect(reviewedWorkflow.match(/vercel-version:/g)).toHaveLength(2);
    const workflow = replacePattern(
      reviewedWorkflow,
      new RegExp(
        `(${jobName}:[\\s\\S]*?vercel-version:) ${reviewedVercelVersion}`,
      ),
      `$1 ${replacement}`,
    );

    await expect(runChecker(workflow)).rejects.toMatchObject({
      stderr: expect.stringContaining(
        `${jobName} must use Vercel CLI version ${reviewedVercelVersion}`,
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
