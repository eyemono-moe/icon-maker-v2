# BLA-37 bundle and persistence measurements

Measurements use the production client build emitted by `pnpm build`. JavaScript
sizes below are the minified, uncompressed sizes reported by Vite; the budget
script measures the same files from the manifest in bytes.

| Client graph                                            |              Before |         After |
| ------------------------------------------------------- | ------------------: | ------------: |
| Editor entry (`index-*.js`)                             |           217.43 kB |     217.78 kB |
| Shared runtime (`index-*.js`)                           |            30.53 kB |      30.53 kB |
| Toast chunk                                             |            68.03 kB |      68.03 kB |
| Bootstrap-only JavaScript (`client-*.js` + HTTP status) |                   — |      21.21 kB |
| SVGO chunk                                              | 294.90 kB (initial) |             — |
| css-tree chunk                                          | 358.70 kB (initial) |             — |
| Initial client JavaScript graph                         |           969.59 kB | 337,666 bytes |
| Lazy SVG optimizer (SVGO + css-tree)                    |                   — | 664,905 bytes |

The initial graph no longer imports either `svgo` or `css-tree`; the optimizer
is loaded only when SVG or PNG save/copy actions run. The remaining Vite
chunk-size warning is expected for the deferred optimizer chunk and is covered
by the 700,000-byte lazy budget in `scripts/check-bundle-size.mjs`.

URL persistence now tracks nested Solid store nodes without encoding on each
edit, then encodes the current state only when the 150 ms debounce flushes (or
when Save is explicit). A burst of edits therefore results in one URL
replacement containing the latest state. Repeated explicit saves with
unchanged state do not issue another history update.

The bundle check requires Vite's `virtual:$vinxi/handler/client` bootstrap entry
and the deterministic index route entry, then verifies that the bootstrap lists
that route as a dynamic import. It measures the union of both entries' static
import closures, and resolves `src/lib/svg-optimize.ts` as a required dynamic
entry before measuring its emitted file. This keeps the budget tied to the
complete JavaScript graph loaded when the index route is bootstrapped in the
browser rather than to a chunk's display name or filename alone.
