import { MODULE, REQUIRED_CORE_MODULE_VERSION } from "./constants.js";
import { SystemManager } from "./system-manager.js";

Hooks.on("tokenActionHudCoreApiReady", async () => {
  const module = game.modules.get(MODULE.ID);
  module.api = {
    requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
    SystemManager
  };

  Hooks.call("tokenActionHudSystemReady", module);
});

/**
 * After the HUD renders, enrich all action-button tooltips so that
 * @LinkedDescription[...] tags and other Foundry enrichers are resolved
 * to the same HTML a player would see on their character sheet.
 * Plain descriptions (no special tags) pass through TextEditor.enrichHTML
 * essentially unchanged.
 */
Hooks.on("renderTokenActionHud", async (_app, element) => {
  const buttons = element.querySelectorAll("button.tah-action-button[data-tooltip]");
  await Promise.all(Array.from(buttons).map(async btn => {
    const raw = btn.getAttribute("data-tooltip");
    if (!raw?.trim()) return;
    try {
      const enriched = await TextEditor.enrichHTML(raw, { async: true });
      btn.setAttribute("data-tooltip", enriched);
    } catch (_err) {
      // Leave the raw content in place if enrichment fails
    }
  }));
});