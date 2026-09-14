const ARTIFACT_NAME = "vercel-output";
const ARCHIVE_PATH = "vercel-output.tgz";
const ARCHIVE_COMMAND = `tar -czf ${ARCHIVE_PATH} .vercel/output`;
const PRODUCTION_GUARD =
  "github.event_name == 'push' && github.ref == 'refs/heads/main'";
const REVIEWED_VERCEL_VERSION = "50.44.0";
const ACTION_VERSIONS = new Map([
  ["actions/checkout", "v6"],
  ["actions/upload-artifact", "v7"],
  ["actions/download-artifact", "v8"],
  ["amondnet/vercel-action", "v42"],
]);

const requireContract = (condition, message) => {
  if (!condition) throw new Error(message);
};

const jobBody = (workflow, jobName) => {
  const match = workflow.match(
    new RegExp(
      `^  ${jobName}:\\n(?<body>[\\s\\S]*?)(?=^  [\\w-]+:\\n|(?![\\s\\S]))`,
      "m",
    ),
  );
  requireContract(match?.groups?.body, `Missing workflow job: ${jobName}`);
  return match.groups.body;
};

const steps = (body) => {
  const result = [];
  for (const line of body.split("\n")) {
    if (line.startsWith("      - ")) result.push({ lines: [line] });
    else if (result.length > 0) result.at(-1).lines.push(line);
  }
  return result.map((step, index) => ({
    index,
    text: step.lines.join("\n"),
    action: step.lines.join("\n").match(/^\s+(?:- )?uses: (?<action>\S+)$/m)
      ?.groups?.action,
  }));
};

const scalar = (value) => {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const withValue = (step, key) => {
  const match = step.text.match(
    new RegExp(`^          ${key}:\\s*(?<value>.*)$`, "m"),
  );
  return match?.groups ? scalar(match.groups.value) : undefined;
};

const jobValue = (body, key) => {
  const match = body.match(new RegExp(`^    ${key}:\\s*(?<value>.*)$`, "m"));
  return match?.groups ? scalar(match.groups.value) : undefined;
};

const runCommand = (step) => {
  const match = step.text.match(/^\s+(?:- )?run:\s*(?<command>.*)$/m);
  return match?.groups ? scalar(match.groups.command) : undefined;
};

const actionSteps = (jobSteps, actionName) =>
  jobSteps.filter(({ action }) => action?.startsWith(`${actionName}@`));

const uniqueActionStep = (jobSteps, actionName, jobName) => {
  const matches = actionSteps(jobSteps, actionName);
  requireContract(
    matches.length === 1,
    `${jobName} must contain exactly one ${actionName} step; found ${matches.length}`,
  );
  return matches[0];
};

const validateActionVersions = (workflow) => {
  const actions = [
    ...workflow.matchAll(/^\s+(?:- )?uses: (?<action>\S+)$/gm),
  ].map(({ groups }) => groups.action);
  for (const [actionName, expectedVersion] of ACTION_VERSIONS) {
    const references = actions
      .filter((action) => action.startsWith(`${actionName}@`))
      .map((action) => action.slice(actionName.length + 1));
    requireContract(
      references.length > 0,
      `Workflow must use ${actionName}@${expectedVersion}`,
    );
    requireContract(
      references.every((reference) => reference === expectedVersion),
      `${actionName} must use major ${expectedVersion}`,
    );
  }
};

const validateUpload = (workflow) => {
  const qualitySteps = steps(jobBody(workflow, "quality"));
  const upload = uniqueActionStep(
    qualitySteps,
    "actions/upload-artifact",
    "quality",
  );
  requireContract(
    withValue(upload, "name") === ARTIFACT_NAME,
    `quality must upload artifact "${ARTIFACT_NAME}"`,
  );
  requireContract(
    withValue(upload, "path") === ARCHIVE_PATH,
    `quality artifact "${ARTIFACT_NAME}" must upload ${ARCHIVE_PATH}`,
  );
  const archive = qualitySteps.find(
    (step) => runCommand(step) === ARCHIVE_COMMAND,
  );
  requireContract(
    archive && archive.index < upload.index,
    `quality must create ${ARCHIVE_PATH} from .vercel/output before artifact upload`,
  );
};

const validateDeploy = (workflow, jobName, requiredArguments) => {
  const body = jobBody(workflow, jobName);
  requireContract(
    jobValue(body, "needs") === "quality",
    `${jobName} must depend on the quality job`,
  );
  if (jobName === "deploy-production") {
    requireContract(
      jobValue(body, "if") === PRODUCTION_GUARD,
      "deploy-production must run only for pushes to refs/heads/main",
    );
  }

  const jobSteps = steps(body);
  const checkout = uniqueActionStep(jobSteps, "actions/checkout", jobName);
  const download = uniqueActionStep(
    jobSteps,
    "actions/download-artifact",
    jobName,
  );
  const vercel = uniqueActionStep(jobSteps, "amondnet/vercel-action", jobName);

  requireContract(
    checkout.index < download.index,
    `${jobName} checkout must precede artifact download`,
  );
  requireContract(
    withValue(download, "name") === ARTIFACT_NAME,
    `${jobName} must download artifact "${ARTIFACT_NAME}"`,
  );
  requireContract(
    withValue(download, "path") === undefined,
    `${jobName} must download ${ARTIFACT_NAME} to the workspace root`,
  );

  const extraction = jobSteps.find(
    (step) => runCommand(step) === `tar -xzf ${ARCHIVE_PATH}`,
  );
  requireContract(
    extraction &&
      download.index < extraction.index &&
      extraction.index < vercel.index,
    `${jobName} must extract ${ARCHIVE_PATH} before the Vercel action`,
  );

  const argumentsSet = new Set(
    (withValue(vercel, "vercel-args") ?? "").split(/\s+/).filter(Boolean),
  );
  for (const argument of requiredArguments) {
    requireContract(
      argumentsSet.has(argument),
      `${jobName} Vercel arguments must include ${argument}`,
    );
  }
  requireContract(
    withValue(vercel, "vercel-version") === REVIEWED_VERCEL_VERSION,
    `${jobName} must use Vercel CLI version ${REVIEWED_VERCEL_VERSION}`,
  );
};

export const validateCiWorkflow = (workflow) => {
  validateActionVersions(workflow);
  validateUpload(workflow);
  validateDeploy(workflow, "deploy-preview", ["--prebuilt"]);
  validateDeploy(workflow, "deploy-production", ["--prod", "--prebuilt"]);
};
