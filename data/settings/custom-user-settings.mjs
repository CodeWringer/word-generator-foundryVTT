import CustomSetting from "./custom-setting.mjs";
import CustomSettings from "./custom-settings.mjs";
import { SettingScopes } from "./setting-scopes.mjs";

/**
 * Defines the settings specific to a user. 
 */
export default class CustomUserSettings extends CustomSettings {
  /**
   * @static
   * @type {String}
   * @readonly
   */
  static get KEY_TOGGLE_MOCK() { return "toggleMock"; }

  /**
   * @static
   * @type {String}
   * @readonly
   */
  static get KEY_TOGGLE_DEBUG() { return "toggleDebug"; }

  constructor()
  {
    super();

    this._settings.push(
      new CustomSetting({
        key: CustomUserSettings.KEY_TOGGLE_MOCK,
        name: game.i18n.localize("wg.settings.toggleMock.name"),
        hint: undefined,
        scope: SettingScopes.USER,
        config: true,
        default: false,
        type: Boolean,
      }),
      new CustomSetting({
        key: CustomUserSettings.KEY_TOGGLE_DEBUG,
        name: game.i18n.localize("wg.settings.toggleDebug.name"),
        hint: undefined,
        scope: SettingScopes.USER,
        config: true,
        default: false,
        type: Boolean,
      }),
    );
  }
}
