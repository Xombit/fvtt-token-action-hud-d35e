import { MODULE } from "./constants.js";

export function register(updateFunc) {
  game.settings.register(MODULE.ID, "abbreviateSkills", {
    name: game.i18n.localize("tokenActionHud.d35e.settings.abbreviateSkills.name"),
    hint: game.i18n.localize("tokenActionHud.d35e.settings.abbreviateSkills.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: value => updateFunc(value)
  });

  game.settings.register(MODULE.ID, "showUnequippedItems", {
    name: game.i18n.localize("tokenActionHud.d35e.settings.showUnequippedItems.name"),
    hint: game.i18n.localize("tokenActionHud.d35e.settings.showUnequippedItems.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: value => updateFunc(value)
  });

  game.settings.register(MODULE.ID, "groupPowersSeparately", {
    name: game.i18n.localize("tokenActionHud.d35e.settings.groupPowersSeparately.name"),
    hint: game.i18n.localize("tokenActionHud.d35e.settings.groupPowersSeparately.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: value => updateFunc(value)
  });
}