# BLA-37 bundle and persistence measurements

Measurements use the production client build emitted by `pnpm build`. JavaScript
sizes below are the minified, uncompressed sizes reported by Vite; the budget
script measures the same files from the manifest in bytes.

| Client graph | Before | After |
| --- | ---: | ---: |
| Editor entry (`index-*.js`) | 217.43 kB | 217.25 kB |
| Shared runtime (`index-*.js`) | 30.53 kB | 30.53 kB |
| Toast chunk | 68.03 kB | 68.03 kB |
| SVGO chunk | 294.90 kB (initial) | — |
| css-tree chunk | 358.70 kB (initial) | — |
| Initial client JavaScript graph | 969.59 kB | 315,815 bytes |
| Lazy SVG optimizer (SVGO + css-tree) | — | 664,905 bytes |

The initial graph no longer imports either `svgo` or `css-tree`; the optimizer
is loaded only when SVG or PNG save/copy actions run. The remaining Vite
chunk-size warning is expected for the deferred optimizer chunk and is covered
by the 700,000-byte lazy budget in `scripts/check-bundle-size.mjs`.

URL persistence now debounces changes by 150 ms and shares the encoded-state
memo between autosave and explicit Save, so a burst of edits results in one
URL replacement. Repeated explicit saves with unchanged state do not issue
another history update.
