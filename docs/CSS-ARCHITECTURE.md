# CSS architecture (Path A)

This refactor locks the SCSS tree into a shallow, predictable “Path A” layout so each layer has a clear responsibility and token usage stays centralized.

## Folder layout
- `00-settings`: design tokens (`_tokens.scss`) for color, typography, spacing, layout, and radii.
- `10-base`: reset and typography defaults that normalize elements before components layer on styles.
- `20-layout`: page-level primitives (`_container.scss`, `_grid.scss`, `_tillerstead-theme.scss`) for shells, grids, and themed surfaces.
- `30-components`: UI parts (buttons, cards, hero, header/footer, breadcrumbs, forms, plans, deliver, social links) plus a compatibility `theme` import shim.
- `40-utilities`: helper classes for spacing, display, alignment, and quick overrides.

## Tokens to rely on
- **Layout width:** `--layout-max`, `--layout-wide`, `--layout-narrow`, and `--container-gutter` replace scattered hard-coded widths. `--shell-width` now aliases `--layout-max` for back-compat.
- **Spacing:** `--ts-spacing-*` drive vertical rhythm (`--section-padding-y`, `--section-gap`) and are mirrored by `--space-*` aliases. Layout helpers set `--flow-space`, `--stack-gap`, and `--cluster-gap` so spacing can be tuned per block without new utilities.
- **Typography:** `--heading-*`, `--font-size-*`, `--line-height-*`, and `--font-*` define the full type ramp consumed by base headings/body plus component-level usage.
- **Color/shadows:** `--ts-color-*`, gradients, and shadow tokens stay the single source of truth for brand + surface contrast; no ad-hoc hex codes were added.

## Selector approach
- Nested selectors were flattened in typography (lists, links, blockquotes, `pre code`) to keep specificity predictable and closer to plain CSS.
- Layout/grid helpers are authored as simple utility classes (no mixins/functions) so generated CSS stays easy to trace in compiled output.
- The theme shim (`30-components/_theme.scss`) re-exports the layout theme for legacy imports; new work should import from `20-layout/tillerstead-theme`.

## Working style
- Prefer layout primitives (`.container`, `.section`, `.stack`, `.cluster`, `.switcher`, `.grid-cols-*`) before adding component-specific layout rules.
- Reach for tokens first: width (`--layout-*`), spacing (`--ts-spacing-*`), and color variables should back any new component scales.
- Keep helpers incremental—utilities remain in `40-utilities`, while structural spacing stays inside `20-layout` to avoid duplication.
