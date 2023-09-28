import WordGeneratorApplicationSettings from "../../business/generator/model/word-generator-application-settings.mjs";

/**
 * Provides means of reading and writing the `WordGeneratorApplicationSettings` to user flags. 
 */
export default class WordGeneratorApplicationSettingsDataSource {
  /**
   * Scope of the user flag. 
   * 
   * @type {String}
   * @readonly
   * @constant
   */
  static FLAG_SCOPE = "core";

  /**
   * Key under which the data will be stored/accessible. 
   * 
   * @type {String}
   * @readonly
   * @constant
   */
  static KEY_FLAG = "word-generator-application-settings";

  /**
   * Returns the given user's word generator data. 
   * 
   * @param {String} userId User-ID. 
   * 
   * @returns {WordGeneratorApplicationSettings}
   */
  get(userId) {
    const user = game.users.get(userId);
    if (user === undefined) return undefined;

    const dto = user.getFlag(
      WordGeneratorApplicationSettingsDataSource.FLAG_SCOPE,
      WordGeneratorApplicationSettingsDataSource.KEY_FLAG
    ) ?? new WordGeneratorApplicationSettings();

    return WordGeneratorApplicationSettings.fromDto(dto);
  }

  /**
   * Sets (= overwrites) the given user's word generator data with the given data. 
   * 
   * @param {String} userId User-ID. 
   * @param {WordGeneratorApplicationSettings} data The data to set. 
   */
  set(userId, data) {
    const user = game.users.get(userId);
    if (user === undefined) return undefined;

    user.setFlag(
      WordGeneratorApplicationSettingsDataSource.FLAG_SCOPE,
      WordGeneratorApplicationSettingsDataSource.KEY_FLAG,
      data.toDto()
    );
  }

  /**
   * Clears out all generator settings for the given user. 
   * @param {String} userId User-ID.
   */
  clear(userId) {
    const user = game.users.get(userId);
    if (user === undefined) return undefined;

    user.setFlag(
      WordGeneratorApplicationSettingsDataSource.FLAG_SCOPE,
      WordGeneratorApplicationSettingsDataSource.KEY_FLAG,
      null
    );
  }
}
