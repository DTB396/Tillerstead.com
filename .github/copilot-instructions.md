# Tillerstead.com Include System

Goal: Reduce and standardize Jekyll includes. Prefer canonical includes, delete wrappers, update references, keep builds working.

## Taxonomy
- _includes/layout/ : page shells used by layouts
- _includes/navigation/ : nav UI only
- _includes/sections/ : big blocks used by pages (homepage sections etc.)
- _includes/components/ : small reusable parts (cards, icons, CTA, etc.)
- _includes/schema/ : JSON-LD blocks only
- _includes/forms/ : forms only
- _includes/content/ : avoid; only if truly needed; prefer _data + components

## Naming Rules
- sections: section-<name>.html
- components: c-<name>.html
- schema: schema-<type>.html
- page-level include shells: page-<slug>.html

## Refactor Rules
1) For any concept duplicated in multiple paths (e.g., ts-services in root + components + content):
   - choose one canonical file under sections/ or components/
   - convert others into thin wrappers that call the canonical include, or delete them after references updated
2) Do not change markup semantics unless necessary; preserve CSS hooks.
3) Every change must update include references in layouts/pages accordingly.
4) Run includes audit reports and ensure:
   - duplicates shrink over time
   - unused list shrinks
   - build succeeds

## Deliverables
- a mapping table (include → purpose → used-by → canonical/new-path → action)
- merged canonical includes where redundant
- wrappers or updated references

