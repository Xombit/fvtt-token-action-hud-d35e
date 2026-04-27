import { GROUP } from "./constants.js";

export let DEFAULTS = null;

Hooks.once("tokenActionHudCoreApiReady", async coreModule => {
  const groups = GROUP;
  Object.values(groups).forEach(group => {
    group.name = coreModule.api.Utils.i18n(group.name);
    group.listName = `Group: ${group.name}`;
  });

  DEFAULTS = {
    layout: [
      {
        nestId: "attributes",
        id: "attributes",
        name: coreModule.api.Utils.i18n("tokenActionHud.d35e.attributes"),
        groups: [
          { ...groups.checks, nestId: "attributes_checks" },
          { ...groups.saves, nestId: "attributes_saves" },
          { ...groups.skills, nestId: "attributes_skills" }
        ]
      },
      {
        nestId: "combat",
        id: "combat",
        name: coreModule.api.Utils.i18n("tokenActionHud.combat"),
        groups: [
          { ...groups.combat, nestId: "combat_combat" },
          { ...groups.attacks, nestId: "combat_attacks" },
          { ...groups.fullAttacks, nestId: "combat_full-attacks" }
        ]
      },
      {
        nestId: "magic",
        id: "magic",
        name: coreModule.api.Utils.i18n("tokenActionHud.magic"),
        groups: [
          { ...groups.spellbookUtility, nestId: "magic_spellbook-utility" },
          { ...groups.spells, nestId: "magic_spells" },
          { ...groups.powers, nestId: "magic_powers" }
        ]
      },
      {
        nestId: "inventory",
        id: "inventory",
        name: coreModule.api.Utils.i18n("tokenActionHud.d35e.inventory"),
        groups: [
          { ...groups.inventoryWeapons, nestId: "inventory_weapons" },
          { ...groups.inventoryEquipment, nestId: "inventory_equipment" },
          { ...groups.inventoryConsumables, nestId: "inventory_consumables" },
          { ...groups.inventoryTools, nestId: "inventory_tools" },
          { ...groups.inventoryOther, nestId: "inventory_other" }
        ]
      },
      {
        nestId: "effects",
        id: "effects",
        name: coreModule.api.Utils.i18n("tokenActionHud.effects"),
        groups: [
          { ...groups.buffs, nestId: "effects_buffs" },
          { ...groups.conditions, nestId: "effects_conditions" },
          { ...groups.feats, nestId: "effects_feats" }
        ]
      },
      {
        nestId: "utility",
        id: "utility",
        name: coreModule.api.Utils.i18n("tokenActionHud.utility"),
        groups: [
          { ...groups.utility, nestId: "utility_utility" }
        ]
      }
    ],
    groups: Object.values(groups)
  };
});