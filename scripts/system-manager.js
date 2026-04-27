import { ActionHandler } from "./action-handler.js";
import { DEFAULTS } from "./defaults.js";
import { RollHandler as Core } from "./roll-handler.js";
import * as systemSettings from "./settings.js";

export let SystemManager = null;

Hooks.once("tokenActionHudCoreApiReady", async coreModule => {
  SystemManager = class SystemManager extends coreModule.api.SystemManager {
    getActionHandler() {
      return new ActionHandler();
    }

    getAvailableRollHandlers() {
      return { core: "Core D35E" };
    }

    getRollHandler(rollHandlerId) {
      switch (rollHandlerId) {
        case "core":
        default:
          return new Core();
      }
    }

    registerSettings(onChangeFunction) {
      systemSettings.register(onChangeFunction);
    }

    async registerDefaults() {
      return DEFAULTS;
    }
  };
});