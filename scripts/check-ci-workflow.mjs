import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const workflowPath = fileURLToPath(
  new URL("../.github/workflows/ci.yaml", import.meta.url),
);
const workflow = await readFile(workflowPath, "utf8");

const jobBody = (jobName) => {
  const match = workflow.match(
    new RegExp(
      `^  ${jobName}:\\n(?<body>[\\s\\S]*?)(?=^  [\\w-]+:\\n|(?![\\s\\S]))`,
      "m",
    ),
  );
  assert(match?.groups?.body, `Missing workflow job: ${jobName}`);
  return match.groups.body;
};

const usedActions = (body) =>
  [...body.matchAll(/^\s+- uses: (?<action>\S+)$/gm)].map(
    ({ groups }) => groups.action,
  );

assert.match(workflow, /uses: actions\/upload-artifact@v7\b/);
assert.doesNotMatch(workflow, /actions\/upload-artifact@(?!v7\b)/);
assert.match(workflow, /uses: actions\/download-artifact@v8\b/);
assert.doesNotMatch(workflow, /actions\/download-artifact@(?!v8\b)/);

for (const jobName of ["deploy-preview", "deploy-production"]) {
  assert.deepEqual(usedActions(jobBody(jobName)), [
    "actions/checkout@v6",
    "actions/download-artifact@v8",
    "amondnet/vercel-action@v42",
  ]);
}

console.log("CI workflow artifact actions and deploy ordering are valid");
