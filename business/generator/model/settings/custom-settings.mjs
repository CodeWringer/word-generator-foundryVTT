/**
 * Defines the base contract for system-specific settings. 
 * @abstract
 */
export default class CustomSettings {
  /**
  * The FoundryVTT setting key for the system. 
  * 
  * In case this is a system, this value **must** match the 'name' 
  * field defined in 'system.json'. 
  * 
  * In case this is a module, this value **must** match the 'name' 
  * field defined in 'module.json'. 
  * @type {String}
  * @static
  * @readonly
  */
  static get SETTINGS_NAMESPACE() { return "word-generator"; }

  /**
   * A list of the registered/known/available settings. 
   * @type {Array<CustomSetting>}
   * @private
   * @virtual
   */
  _settings = [];

  /**
   * Sets the value of the setting matching the given key. 
   * @param {String} settingKey Key of the setting to set. 
   * @param {Any} value The value to set. 
   */
  set(settingKey, value) {
    this._ensureSetting(settingKey, value);
    
    game.settings.set(CustomSettings.SETTINGS_NAMESPACE, settingKey, value); 
  }
  
  /**
   * Returns the value of the setting matching the given key. 
   * @param {String} settingKey Key of the setting to get. 
   * @returns {Any}
   */
  get(settingKey) {
    this._ensureSetting(settingKey);
    
    return game.settings.get(CustomSettings.SETTINGS_NAMESPACE, settingKey); 
  }
  
  /**
   * @summary
   * Ensures the setting whose key matches the given key, is registered. 
   * 
   * @description
   * **IMPORTANT**: This **must** be called internally, before every attempt to access 
   * the setting via `game.settings.get` or `game.settings.set`! 
   * @param {String} settingKey Key of the setting to set. 
   * @private
   */
  _ensureSetting(settingKey) {
    const setting = this._settings.find(it => it.key === settingKey);

    if (setting === undefined)
      throw new Error(`NullPointerException: Failed to get setting with key '${settingKey}'`);

    // Ensures the setting is registered and available. 
    game.settings.register(CustomSettings.SETTINGS_NAMESPACE, settingKey, {
      name: setting.name,
      hint: setting.hint,
      scope: setting.scope,
      config: setting.config,
      default: setting.default, 
      type: setting.type,
    });
  }

  /**
   * Ensures all settings are registered. 
   * 
   * This is intended to be called once during system initialization. 
   */
  ensureAllSettings() {
    for (const setting of this._settings) {
      this._ensureSetting(setting.key);
    }
  }
}
