import { ACTION_TYPE } from "./constants.js";

export let RollHandler = null;

Hooks.once("tokenActionHudCoreApiReady", async coreModule => {
  RollHandler = class RollHandler extends coreModule.api.RollHandler {
    async handleActionClick(event) {
      const { actionType, actionId } = this.action.system;
      if (!this.actor) return;

      switch (actionType) {
        case ACTION_TYPE.attack:
          await this.#handleAttackAction(event, this.actor, actionId);
          break;
        case ACTION_TYPE.buff:
          if (this.isRenderItem()) this.renderItem(this.actor, actionId);
          else await this.#toggleBuff(this.actor, actionId);
          break;
        case ACTION_TYPE.check:
          this.actor.rollAbilityTest(actionId, { event });
          break;
        case ACTION_TYPE.condition:
          await this.#toggleCondition(this.actor, actionId);
          break;
        case ACTION_TYPE.feat:
        case ACTION_TYPE.fullAttack:
        case ACTION_TYPE.item:
        case ACTION_TYPE.power:
        case ACTION_TYPE.spell:
          if (this.isRenderItem()) this.renderItem(this.actor, actionId);
          else await this.#useItem(event, this.actor, actionId);
          break;
        case ACTION_TYPE.save:
          this.actor.rollSavingThrow(actionId, undefined, undefined, { event });
          break;
        case ACTION_TYPE.skill:
          this.actor.rollSkill(actionId, { event });
          break;
        case ACTION_TYPE.utility:
          await this.#performUtilityAction(event, this.actor, this.token, actionId);
          break;
        default:
          break;
      }
    }

    async #handleAttackAction(event, actor, actionId) {
      switch (actionId) {
        case "bab":
          actor.rollBAB({ event });
          break;
        case "cmb":
          actor.rollCMB({ event });
          break;
        case "melee":
          await actor.rollMelee({ event });
          break;
        case "ranged":
          await actor.rollRanged({ event });
          break;
        default:
          break;
      }
    }

    async #performUtilityAction(event, actor, token, actionId) {
      switch (actionId) {
        case "endTurn":
          if (game.combat?.current?.tokenId === token?.id) {
            await game.combat.nextTurn();
          }
          break;
        case "initiative":
          await actor.rollInitiative({ createCombatants: true });
          break;
        case "rest":
          actor.sheet?._onRest?.(event);
          break;
        default:
          break;
      }
    }

    async #toggleBuff(actor, itemId) {
      const item = coreModule.api.Utils.getItem(actor, itemId);
      if (!item) return;
      await item.update({ "system.active": !item.system?.active });
    }

    async #toggleCondition(actor, conditionId) {
      const current = foundry.utils.getProperty(actor.system, `attributes.conditions.${conditionId}`) || false;
      await actor.update({ [`system.attributes.conditions.${conditionId}`]: !current });
    }

    async #useItem(event, actor, itemId) {
      const item = coreModule.api.Utils.getItem(actor, itemId);
      if (!item) return;
      await item.use({ ev: event, skipDialog: !!event?.shiftKey });
    }
  };
});