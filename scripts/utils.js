import { MODULE } from "./constants.js";

export let Utils = null;

Hooks.once("tokenActionHudCoreApiReady", async coreModule => {
  Utils = class Utils {
    static actorItems(actor) {
      return actor?.items?.contents ?? Array.from(actor?.items?.values?.() ?? []);
    }

    static capitalize(value) {
      if (!value) return "";
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    static getImage(document) {
      return coreModule.api.Utils.getImage(document) || document?.img || "";
    }

    static getSetting(key, defaultValue = null) {
      let value = defaultValue;
      try {
        value = game.settings.get(MODULE.ID, key);
      } catch {
        coreModule.api.Logger.debug(`Setting '${key}' not found`);
      }
      return value;
    }

    static localize(value) {
      if (typeof value !== "string" || value.length === 0) return value ?? "";
      const localized = game.i18n.localize(value);
      return localized === value ? value : localized;
    }

    static sortItems(items) {
      return [...items].sort((left, right) => {
        const leftSort = left?.sort ?? 0;
        const rightSort = right?.sort ?? 0;
        if (leftSort !== rightSort) return leftSort - rightSort;
        return (left?.name ?? "").localeCompare(right?.name ?? "", undefined, { sensitivity: "base" });
      });
    }

    static spellbookName(actor, spellbookKey) {
      const spellbook = actor?.system?.attributes?.spells?.spellbooks?.[spellbookKey];
      const name = spellbook?.name || spellbook?.class || spellbookKey;
      return Utils.capitalize(name);
    }
  };
});