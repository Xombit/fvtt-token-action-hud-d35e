# Token Action HUD D35E Discovery Matrix

## Reference Status

- Classic parity reference: `Drental/fvtt-tokenactionhud` cloned locally at `c:\Users\User\src\fvtt-tokenactionhud-classic`.
- Core runtime reference: `Larkinabout/fvtt-token-action-hud-core` cloned locally at `c:\Users\User\src\fvtt-token-action-hud-core`.
- Modern system-module structure reference: `Larkinabout/fvtt-token-action-hud-dnd5e` cloned locally at `c:\Users\User\src\fvtt-token-action-hud-dnd5e`.
- PF1 Core module fallback: `Larkinabout/fvtt-token-action-hud-pf1` was not available at the planned URL, so PF1 discovery uses the Classic PF1 implementation from `fvtt-tokenactionhud-classic`.

## Three-Way Matrix

| Area | Classic PF1 | Classic D35E | Current D35E runtime/API surface | Fit label | Implementation note |
| --- | --- | --- | --- | --- | --- |
| Checks | Ability checks category built from `CONFIG.PF1.abilities` and `abilityCheck` actions. | Same category shape using `CONFIG.D35E.abilities` and `abilityCheck`. | `ActorPF.rollAbilityTest(abilityId, options)` and `rollAbility(abilityId, options)` are present. | adopt PF1 pattern | Keep a direct checks group with stable `check` action IDs. |
| Saves | Save category built from `CONFIG.PF1.savingThrows` and `abilitySave`. | Same category shape using `CONFIG.D35E.savingThrows`. | `ActorPF.rollSavingThrow(saveId, ability, target, options)` exists; the minimal HUD path only needs save id plus options. | adopt PF1 pattern | Keep save actions thin and delegate to actor save methods. |
| Skills | PF1 lists base skills and subskills, with multi-token support. | D35E lists skills plus custom subskills, RT and ACP info. | `ActorPF.rollSkill(skillId, options)` exists; current schema includes custom subskills and skill metadata. | adapt PF1 pattern | Reuse the PF1 structural group, but preserve D35E custom-skill and subskill handling. |
| Inventory and items | PF1 inventory split into weapons, equipment, other, consumables, inconsumables, tools. | Same split with D35E labels. | Item types and quantity/equipped/use data still align with the Classic split. | adopt PF1 pattern | Use PF1-style grouping as the default inventory layout. |
| Attacks | PF1 has bonuses plus melee, ranged, BAB, CMB, and attack items. | D35E swaps PF1 bonus actions for grapple and adds full attacks. | `rollBAB`, `rollMelee`, `rollRanged`, `rollCMB`, attack items, and `full-attack` items exist. | adapt PF1 pattern | Keep a shared combat-roll subgroup, but preserve D35E full-attack handling. |
| Full attacks | Not a distinct PF1 HUD area in Classic. | Dedicated `full-attack` subgroup under attacks. | `ItemUse.use()` has explicit `full-attack` orchestration across linked attack slots. | keep D35E-specific | Keep full attacks as a first-class D35E group and delegate to item use. |
| Spellbook grouping | PF1 groups by spellbook, includes concentration and caster-level actions, then by level. | D35E groups by spellbook and level, but Classic only exposes concentration utility. | Current D35E spellbooks contain concentration, CL, notes, spontaneous/prepared data, and optional power-point fields. | adapt PF1 pattern | Use PF1 spellbook structure, but add D35E-aware concentration, caster level, and power-point context. |
| Concentration and caster level | PF1 exposes both concentration and caster-level per spellbook. | D35E Classic exposes concentration only. | Current D35E actor sheet exposes both concentration and CL rolls from spellbook groups. | adapt PF1 pattern | Restore CL-adjacent actions in Core even though Classic D35E omitted them. |
| Psionics and powers | PF1 reference is not authoritative here. | D35E folds powers into spell items via `isPower`, but Classic still shows them inside the spells area. | Current D35E has `isPower`, `usePowerPoints`, spellbook power-point fields, `psionicFocus`, and `requiresPsionicFocus`. | keep D35E-specific | Break powers out as D35E-named actions/groups instead of forcing them into a generic PF1 spell model. |
| Conditions | PF1 has a dedicated conditions category that toggles actor condition flags. | D35E Classic omitted a condition category. | Current D35E still has `system.attributes.conditions` with stable booleans. | adapt PF1 pattern | Reintroduce a conditions group, but map it to D35E condition keys and labels. |
| Buffs | PF1 uses item toggles with active styling. | D35E uses the same buff-item pattern. | Current D35E buff items still expose `system.active`, timeline, and action payloads. | adapt PF1 pattern | Keep a dedicated buffs group with toggle support from system-owned updates. |
| Feat or feature organization | PF1 groups feature items by active/passive state. | D35E Classic groups feats similarly but with D35E labels. | Current D35E feat items carry `featType`, `abilityType`, `activation`, and D35E-specific associations. | keep D35E-specific | Preserve active/passive grouping as a baseline, but classify by D35E feat metadata rather than PF1 assumptions. |
| Utility and combat | PF1 utility includes rest, combat toggle, visibility, initiative, and end turn. | D35E Classic only includes rest. | Current D35E has `rollInitiative`, sheet rest, and safe token/combat utility pathways; psionic focus is also a frequent state action. | adapt PF1 pattern | Start with initiative and rest, then add D35E-specific state utilities such as psionic focus when the slice is stable. |
| NPC support | PF1 supports NPCs in the same main build path. | D35E Classic supports `npc` and `character` in the same path. | Current D35E actor types still include `character` and `npc`. | adopt PF1 pattern | Build character-first, then extend the same taxonomy to NPCs. |
| Multi-token behavior | PF1 offers shared skills, saves, checks, and utilities for homogeneous selections. | D35E Classic offers shared skills, saves, checks, and utilities. | Current D35E multi-token safety depends on actor/item method behavior, but skills/saves/checks/initiative are safe. | adopt PF1 pattern | Re-enable only safe shared actions first; leave item execution conservative. |

## PF1 Fit Analysis

| Area | Decision | Why |
| --- | --- | --- |
| Checks | adopt PF1 pattern | Current D35E matches PF1 structurally and method-wise. |
| Saves | adopt PF1 pattern | Current D35E still exposes the same top-level save concept. |
| Skills | adapt PF1 pattern | The broad shape fits, but D35E custom skills and subskills need system-specific handling. |
| Inventory and item grouping | adopt PF1 pattern | The item taxonomy still lines up with the Classic PF1 split. |
| Spellbook grouping | adapt PF1 pattern | D35E spellbooks retain PF1 ancestry but now carry power-point and CL-specific fields. |
| Concentration and caster-level actions | adapt PF1 pattern | PF1 is the right structural model, but D35E arguments and spellbook data are not identical. |
| Conditions | adapt PF1 pattern | The condition toggles map cleanly, but D35E labels and condition keys differ. |
| Buffs | adapt PF1 pattern | Same toggle concept, but D35E uses its own item fields and active-state semantics. |
| Feat organization | keep D35E-specific | Current D35E feat typing is rich enough that PF1-only assumptions would hide useful distinctions. |

## D35E-Specific Carve-Outs

- Psionics and powers: keep separate from generic spellbook treatment because powers are still spell items but depend on `isPower`, power points, and psionic focus.
- Full attacks: keep as a dedicated D35E action area because the underlying item type drives multi-attack sequencing that PF1 does not model the same way.
- Feat and ability subtypes: keep D35E-specific categorization available because current feat data exposes D35E-centric subtype signals.
- Utility and state toggles: reserve D35E-specific utility slots for psionic focus and other system-owned toggles that are common at the table.

## Replacement Scope Bands

### Band A

- Checks
- Saves
- Skills
- Initiative
- Inventory
- Attacks
- Full attacks
- Spellbooks
- Psionics and powers
- Basic NPC support

### Band B

- Buffs
- Conditions
- Feat organization
- Caster-level and concentration utilities
- Multi-token safe actions

### Band C

- Niche utility toggles
- Edge-case feat or ability subtype splits
- Additional context actions beyond item-sheet open and core toggles

## Stable Taxonomy Plan

### PF1-derived groups to keep

- `checks`
- `saves`
- `skills`
- `inventory`
- `spells`
- `buffs`
- `conditions`
- `combat`
- `utility`

### D35E-specific groups to add or preserve

- `full-attacks`
- `powers`
- `feats`
- `spellbook-utility`

### Stable internal action types for the first implementation bands

- `check`
- `save`
- `skill`
- `attack`
- `full-attack`
- `item`
- `spell`
- `power`
- `buff`
- `condition`
- `utility`

### Vertical Slice Target

- Single controlled character token.
- Checks, saves, and skills.
- Initiative under combat.
- One item-driven group proving sheet-open and item use.
- Core registration, HUD build, action IDs, and roll delegation validated against current D35E methods rather than copied Classic behavior.