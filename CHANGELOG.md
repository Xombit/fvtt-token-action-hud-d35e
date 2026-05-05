# Changelog

## 0.1.1

### Bug Fixes
- Unidentified items now display their masked name in the HUD instead of the real item name
- Unidentified item tooltips show the unidentified description instead of the real description

### Features
- Feats now appear in their own dedicated **Feats** menu, positioned between Inventory and Effects
- All item-backed actions (feats, inventory, buffs, attacks) now show description tooltips on hover
- Tooltip content is fully enriched, @LinkedDescription tags resolve to the same text shown on the character sheet
- Spells with no remaining uses are hidden from the HUD (prepared casters: unprepared spells hidden; spontaneous casters: spells hidden when the slot level is depleted; at-will spells and powers always shown)

## 0.1.0

- Initial public release scaffolding
- Automated GitHub release workflow for manifest and zip assets
- D35E Token Action HUD Core system module foundation
