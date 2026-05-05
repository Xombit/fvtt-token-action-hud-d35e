import { ACTION_TYPE, GROUP } from "./constants.js";
import { Utils } from "./utils.js";

export let ActionHandler = null;

Hooks.once("tokenActionHudCoreApiReady", async coreModule => {
  ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
    async buildSystemActions() {
      if (!this.actor || !this.token) return;
      if (!["character", "npc"].includes(this.actor.type)) return;

      this.abbreviateSkills = Utils.getSetting("abbreviateSkills", false);
      this.showUnequippedItems = Utils.getSetting("showUnequippedItems", false);
      this.groupPowersSeparately = Utils.getSetting("groupPowersSeparately", true);
      this.items = Utils.sortItems(Utils.actorItems(this.actor));

      await Promise.all([
        this.#buildChecks(),
        this.#buildSaves(),
        this.#buildSkills(),
        this.#buildCombat(),
        this.#buildAttacks(),
        this.#buildInventory(),
        this.#buildSpellGroups(),
        this.#buildBuffs(),
        this.#buildConditions(),
        this.#buildFeats(),
        this.#buildUtility()
      ]);
    }

    async #buildAttacks() {
      const actorActions = [
        this.#createAction({
          id: "attack-melee",
          name: game.i18n.localize("tokenActionHud.d35e.melee"),
          actionType: ACTION_TYPE.attack,
          actionId: "melee"
        }),
        this.#createAction({
          id: "attack-ranged",
          name: game.i18n.localize("tokenActionHud.d35e.ranged"),
          actionType: ACTION_TYPE.attack,
          actionId: "ranged"
        }),
        this.#createAction({
          id: "attack-bab",
          name: game.i18n.localize("tokenActionHud.d35e.bab"),
          actionType: ACTION_TYPE.attack,
          actionId: "bab"
        }),
        this.#createAction({
          id: "attack-cmb",
          name: game.i18n.localize("tokenActionHud.d35e.grapple"),
          actionType: ACTION_TYPE.attack,
          actionId: "cmb"
        })
      ];

      const attackItems = this.items
        .filter(item => item.type === "attack")
        .map(item => this.#createItemAction(item, ACTION_TYPE.item));
      this.addActions([...actorActions, ...attackItems], { id: GROUP.attacks.id });

      const fullAttackItems = this.items
        .filter(item => item.type === "full-attack")
        .map(item => this.#createItemAction(item, ACTION_TYPE.fullAttack));
      this.addActions(fullAttackItems, { id: GROUP.fullAttacks.id });
    }

    async #buildBuffs() {
      const actions = this.items
        .filter(item => item.type === "buff")
        .map(item => this.#createItemAction(item, ACTION_TYPE.buff, {
          cssClass: `toggle${item.system?.active ? " active" : ""}`
        }));
      this.addActions(actions, { id: GROUP.buffs.id });
    }

    async #buildChecks() {
      const abilities = this.actor.system?.abilities ?? {};
      const actions = Object.entries(CONFIG.D35E?.abilities ?? {})
        .filter(([abilityId]) => abilities[abilityId]?.value !== 0)
        .map(([abilityId, label]) => {
          const total = abilities[abilityId]?.mod ?? 0;
          return this.#createAction({
            id: `check-${abilityId}`,
            name: this.abbreviateSkills ? Utils.capitalize(abilityId) : Utils.localize(label),
            actionType: ACTION_TYPE.check,
            actionId: abilityId,
            info1: { text: coreModule.api.Utils.getModifier(total) }
          });
        });
      this.addActions(actions, { id: GROUP.checks.id });
    }

    async #buildCombat() {
      const combatant = game.combat?.combatants?.find(entry => entry.tokenId === this.token.id);
      const actions = [
        this.#createAction({
          id: "combat-initiative",
          name: game.i18n.localize("tokenActionHud.d35e.rollInitiative"),
          actionType: ACTION_TYPE.utility,
          actionId: "initiative",
          cssClass: `toggle${combatant ? " active" : ""}`,
          info1: combatant?.initiative === null || combatant?.initiative === undefined ? null : { text: `${combatant.initiative}` }
        })
      ];

      if (game.combat?.current?.tokenId === this.token.id) {
        actions.push(this.#createAction({
          id: "combat-end-turn",
          name: game.i18n.localize("tokenActionHud.endTurn"),
          actionType: ACTION_TYPE.utility,
          actionId: "endTurn"
        }));
      }

      this.addActions(actions, { id: GROUP.combat.id });
    }

    async #buildConditions() {
      const conditions = this.actor.system?.attributes?.conditions ?? {};
      const actions = Object.entries(conditions).map(([conditionId, active]) => this.#createAction({
        id: `condition-${conditionId}`,
        name: Utils.capitalize(Utils.localize(CONFIG.D35E?.conditions?.[conditionId] || CONFIG.D35E?.conditionTypes?.[conditionId] || conditionId)),
        actionType: ACTION_TYPE.condition,
        actionId: conditionId,
        cssClass: `toggle${active ? " active" : ""}`
      }));
      this.addActions(actions, { id: GROUP.conditions.id });
    }

    async #buildFeats() {
      const actions = this.items
        .filter(item => item.type === "feat")
        .map(item => this.#createItemAction(item, ACTION_TYPE.feat));
      this.addActions(actions, { id: GROUP.feats.id });
    }

    async #buildInventory() {
      const items = this.items.filter(item => item.system?.quantity > 0);
      const equipped = items.filter(item => item.type !== "consumable" && (item.system?.equipped || this.showUnequippedItems));
      const weapons = equipped.filter(item => item.type === "weapon");
      const equipment = equipped.filter(item => item.type === "equipment");
      const tools = items.filter(item => item.type === "tool");
      const consumables = items.filter(item => item.type === "consumable");
      const other = items.filter(item => !["weapon", "equipment", "tool", "consumable", "attack", "full-attack", "feat", "spell", "buff", "aura"].includes(item.type));

      this.addActions(weapons.map(item => this.#createItemAction(item, ACTION_TYPE.item)), { id: GROUP.inventoryWeapons.id });
      this.addActions(equipment.map(item => this.#createItemAction(item, ACTION_TYPE.item)), { id: GROUP.inventoryEquipment.id });
      this.addActions(consumables.map(item => this.#createItemAction(item, ACTION_TYPE.item, { info1: this.#getUsesInfo(item) })), { id: GROUP.inventoryConsumables.id });
      this.addActions(tools.map(item => this.#createItemAction(item, ACTION_TYPE.item)), { id: GROUP.inventoryTools.id });
      this.addActions(other.map(item => this.#createItemAction(item, ACTION_TYPE.item)), { id: GROUP.inventoryOther.id });
    }

    async #buildSaves() {
      const saves = this.actor.system?.attributes?.savingThrows ?? {};
      const actions = Object.entries(CONFIG.D35E?.savingThrows ?? {}).map(([saveId, label]) => this.#createAction({
        id: `save-${saveId}`,
        name: Utils.localize(label),
        actionType: ACTION_TYPE.save,
        actionId: saveId,
        info1: { text: coreModule.api.Utils.getModifier(saves[saveId]?.total ?? 0) }
      }));
      this.addActions(actions, { id: GROUP.saves.id });
    }

    async #buildSkills() {
      const actions = this.#getSkillEntries().map(({ id, name, skill }) => {
        const rank = skill?.rank ? `R${skill.rank}` : "";
        const tags = [skill?.rt ? "RT" : "", skill?.acp ? "ACP" : ""].filter(Boolean).join(", ");
        return this.#createAction({
          id: `skill-${id}`,
          name: this.abbreviateSkills ? Utils.capitalize(id.split(".").at(-1)) : name,
          actionType: ACTION_TYPE.skill,
          actionId: id,
          info1: rank ? { text: rank } : null,
          info2: tags ? { text: tags } : null
        });
      });
      this.addActions(actions, { id: GROUP.skills.id });
    }

    async #buildSpellGroups() {
      const spellItems = this.items.filter(item => item.type === "spell");
      const spells = spellItems.filter(item => !item.system?.isPower);
      const powers = spellItems.filter(item => !!item.system?.isPower);

      await this.#buildSpellbookGroups(GROUP.spells, spells, ACTION_TYPE.spell);

      if (this.groupPowersSeparately) {
        await this.#buildSpellbookGroups(GROUP.powers, powers, ACTION_TYPE.power);
      } else {
        await this.#buildSpellbookGroups(GROUP.spells, powers, ACTION_TYPE.power);
      }
    }

    async #buildSpellbookGroups(parentGroup, spellItems, actionType) {
      if (!spellItems.length) return;

      const spellbookKeys = [...new Set(spellItems.map(item => item.system?.spellbook).filter(Boolean))].sort();
      for (const spellbookKey of spellbookKeys) {
        const spellbookGroup = {
          id: `${parentGroup.id}-${spellbookKey}`,
          name: Utils.spellbookName(this.actor, spellbookKey),
          type: "system-derived"
        };

        await this.addGroup(spellbookGroup, { id: parentGroup.id, type: parentGroup.type });

        const actions = spellItems
          .filter(item => item.system?.spellbook === spellbookKey)
          .filter(item => this.#hasRemainingUses(item))
          .sort((left, right) => {
            const leftLevel = left.system?.level ?? 0;
            const rightLevel = right.system?.level ?? 0;
            if (leftLevel !== rightLevel) return leftLevel - rightLevel;
            return left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
          })
          .map(item => this.#createItemAction(item, actionType, {
            info1: { text: `${item.system?.level ?? 0}` },
            info2: this.#getSpellbookInfo(item)
          }));

        this.addActions(actions, spellbookGroup);
      }
    }

    async #buildUtility() {
      const actions = [];

      if (this.actor.type === "character") {
        actions.push(this.#createAction({
          id: "utility-rest",
          name: game.i18n.localize("D35E.Rest"),
          actionType: ACTION_TYPE.utility,
          actionId: "rest"
        }));
      }
      this.addActions(actions, { id: GROUP.utility.id });
    }

    #createAction({ id, name, actionType, actionId, cssClass = "", img = "", info1 = null, info2 = null, tooltip = null }) {
      return {
        id,
        name,
        img,
        cssClass,
        info1,
        info2,
        tooltip,
        listName: name,
        hasContextMenu: true,
        system: {
          actionType,
          actionId
        }
      };
    }

    #createItemAction(item, actionType, extra = {}) {
      const quantity = item.system?.quantity;
      const info1 = extra.info1 ?? (quantity > 1 ? { text: `${quantity}` } : null);
      return this.#createAction({
        id: `${actionType}-${item.id}`,
        name: this.#getItemDisplayName(item),
        img: Utils.getImage(item),
        actionType,
        actionId: item.id,
        cssClass: extra.cssClass ?? "",
        info1,
        info2: extra.info2 ?? null,
        tooltip: "tooltip" in extra ? extra.tooltip : this.#getItemTooltip(item)
      });
    }

    #getItemDisplayName(item) {
      if (item.system?.identified === false) {
        return item.system?.unidentified?.name || item.name;
      }
      return item.name;
    }

    #getItemTooltip(item) {
      const isUnidentified = item.system?.identified === false;
      const content = isUnidentified
        ? item.system?.description?.unidentified
        : item.system?.description?.value;
      return content ? { content } : null;
    }

    #hasRemainingUses(item) {
      if (item.system?.atWill === true) return true;
      if (item.system?.isPower) return true;
      const spellbookKey = item.system?.spellbook;
      if (!spellbookKey) return true;
      const spellbook = this.actor.system?.attributes?.spells?.spellbooks?.[spellbookKey];
      if (!spellbook) return true;
      if (spellbook.usePowerPoints) {
        const available = spellbook.powerPoints ?? 0;
        const cost = item.system?.powerPointsCost ?? 0;
        return available >= cost;
      }
      if (spellbook.spontaneous) {
        const level = item.system?.level ?? 0;
        return (spellbook.spells?.[`spell${level}`]?.value ?? 0) > 0;
      }
      return (item.system?.preparation?.preparedAmount ?? 0) > 0;
    }

    #getSkillEntries() {
      const entries = [];
      const skills = this.actor.system?.skills ?? {};
      for (const [skillId, skill] of Object.entries(skills)) {
        const includeBase = !skill?.rt || skill?.rank || skill?.subSkills;
        if (includeBase && !skill?.subSkills) {
          entries.push({ id: skillId, name: this.#getSkillName(skillId, skill), skill });
        }

        if (skill?.subSkills) {
          for (const [subSkillId, subSkill] of Object.entries(skill.subSkills)) {
            if (subSkill?.rt && !subSkill?.rank) continue;
            entries.push({
              id: `${skillId}.subSkills.${subSkillId}`,
              name: `${this.#getSkillName(skillId, skill)} - ${subSkill.name}`,
              skill: subSkill
            });
          }
        }
      }
      return entries.sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }));
    }

    #getSkillName(skillId, skill) {
      return Utils.localize(CONFIG.D35E?.skills?.[skillId] || skill?.name || skillId);
    }

    #getSpellbookInfo(item) {
      const prepared = item.system?.preparation;
      if (prepared && (prepared.maxAmount || prepared.preparedAmount)) {
        return { text: `${prepared.preparedAmount ?? 0}/${prepared.maxAmount ?? 0}` };
      }

      const powerPointCost = item.system?.powerPointsCost;
      if (item.system?.isPower && powerPointCost) {
        return { text: `PP ${powerPointCost}` };
      }

      return null;
    }

    #getUsesInfo(item) {
      const uses = item.system?.uses;
      if (!uses) return null;
      if (uses.max || uses.value) {
        return { text: `${uses.value ?? 0}/${uses.max ?? 0}` };
      }
      return null;
    }
  };
});