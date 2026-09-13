# eyemono.moe icon maker

<https://icon.eyemono.moe>

![site ogp](https://icon.eyemono.moe/ogp?p=N4IgFghglgTiBcoBGEDOBTAwgewDbbnhAGIBOUgFgAYAhGkAGhABcBPAB3QRFTAOZABfJulbpUCUOwCu7KLhposeAt2IBRdQCYtANl2MQ2TgDsEARibtsqKMyjYziEAA8EVJq3fCWHLkQATdAAzCGlcAR8IAGNo8VQCKHEEAG0AXSYUaIBrAHMYbGkTALU6TX1DUXQkAoB3CWc2Tm4g0PDIpjB0CBLGvxaQsIjDa1t7R0lXd09vJgLmCHGnDxAUDBx8QhIAMW3MfcwhJgBbQuYwSab-EFahgSZjdGXBQSA)

This is the SolidStart application that powers the eyemono.moe icon editor and
its SVG, PNG, and OGP image endpoints.

## Requirements

- Node.js 24.11.0, pinned in `.node-version`
- pnpm 9.6.0, pinned in `package.json`

The production framework matrix remains `solid-js@1.9.5`,
`@ark-ui/solid@4.10.2`, `@solidjs/start@1.1.1`, and `vinxi@0.5.3`.
Vite+ is deferred because its Vite 8 build is not compatible with this
SolidStart/Vinxi stack. See
[`docs/investigations/vite-plus-solidstart-compatibility.md`](docs/investigations/vite-plus-solidstart-compatibility.md).

## Local development

```sh
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm start` serves an existing production build. Run `pnpm build` first.

## Quality gates

Run the checks in the same order as CI:

```sh
pnpm check
pnpm type
pnpm test
pnpm test:browser
pnpm build
pnpm check:bundle
```

The commands have separate responsibilities:

- `pnpm check` verifies Oxfmt formatting and runs Oxlint without writing files.
- `pnpm type` runs the TypeScript compiler.
- `pnpm test` runs unit tests with Vitest.
- `pnpm test:browser` builds the Node test server and runs Playwright in Chromium.
- `pnpm build` creates the Vercel production output.
- `pnpm check:bundle` checks the already-built client bundles against size budgets.

Use `pnpm fix` for safe formatting and lint fixes. `pnpm fix:force` also applies
Oxlint's potentially behavior-changing fixes and should be reviewed before commit.

## Image URLs

- `/image?f=svg` returns SVG; `/image?f=png` returns PNG.
- `/image.svg` and `/image.png` are extension aliases.
- `s=<width>x<height>` sets PNG dimensions, subject to the validated limits.
- `p=<encoded-state>` renders a shared editor state.
- `/ogp` returns the 1000 by 525 PNG used for social previews.

Invalid, repeated, or oversized parameters return HTTP 400.

## CI and deployment

CI performs one frozen dependency install, then runs format/lint, type, unit,
browser, production build, and bundle gates in order. It archives the resulting
`.vercel/output` once so deployment jobs do not reinstall dependencies or rebuild.

Same-repository pull requests deploy that verified artifact to a Vercel preview
after all quality gates pass. Pushes to `main` deploy the verified artifact to
Vercel production. Fork and Dependabot pull requests run all quality gates but do
not receive deployment secrets.

Dependabot checks npm dependencies every Tuesday and groups security updates.
GitHub's Dependency Review action rejects pull requests that add a high or
critical vulnerability. Dependabot alerts and security updates must also remain
enabled in the repository's Code security settings.
