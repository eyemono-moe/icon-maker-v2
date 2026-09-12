import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const reproduction = resolve(import.meta.dirname);

function run(command, args) {
  return spawnSync(command, args, {
    cwd: reproduction,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function output(result) {
  return `${result.stdout}${result.stderr}`;
}

function requirePass(label, result) {
  if (result.status !== 0) {
    console.error(`${label} unexpectedly failed:\n${output(result)}`);
    process.exit(1);
  }
  console.log(`${label}: passed`);
}

function requireExpectedFailure(label, result, patterns) {
  const text = output(result);
  if (result.status === 0) {
    console.error(`${label} unexpectedly succeeded`);
    process.exit(1);
  }
  const diagnostics = text
    .split("\n")
    .filter((line) =>
      /error TS|failed to resolve import|not exported/.test(line),
    );
  if (
    diagnostics.length === 0 ||
    patterns.some((pattern) => !pattern.test(text))
  ) {
    console.error(
      `${label} did not contain the expected diagnostic signatures:\n${text}`,
    );
    process.exit(1);
  }
  const expectedSource =
    /(?:@ark-ui\+solid|@zag-js\+solid|@solid-primitives\+keyed|src\.tsx)/;
  const unexpected = diagnostics.filter((line) => !expectedSource.test(line));
  if (unexpected.length > 0) {
    console.error(
      `${label} contained unrelated diagnostics:\n${unexpected.join("\n")}`,
    );
    process.exit(1);
  }
  console.log(`${label}: expected failure`);
}

requirePass(
  "nested frozen install",
  run("pnpm", ["install", "--frozen-lockfile", "--ignore-workspace"]),
);
requirePass(
  "Router/Meta Solid 2 type probe",
  run("pnpm", ["exec", "tsc", "--project", "tsconfig.router-meta.json"]),
);
requireExpectedFailure(
  "Ark type probe",
  run("pnpm", ["exec", "tsc", "--project", "tsconfig.json"]),
  [/Namespace '.*solid-js.*' has no exported member 'JSX'/],
);
requireExpectedFailure(
  "Ark production build",
  run("pnpm", ["exec", "vite", "build"]),
  [/(?:solid-js|@solidjs\/web).*web|["']\.\/web["'].*not exported/],
);
