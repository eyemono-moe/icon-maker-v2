import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateCiWorkflow } from "./lib/ci-workflow-contract.mjs";

const defaultWorkflowPath = fileURLToPath(
  new URL("../.github/workflows/ci.yaml", import.meta.url),
);

export const checkCiWorkflowFile = async (workflowPath) => {
  validateCiWorkflow(await readFile(workflowPath, "utf8"));
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    await checkCiWorkflowFile(resolve(process.argv[2] ?? defaultWorkflowPath));
    console.log("✓ CI workflow contract is valid");
  } catch (error) {
    console.error(
      `✖ ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  }
}
