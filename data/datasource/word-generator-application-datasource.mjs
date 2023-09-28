import WordGeneratorApplicationSettings from "../../business/generator/model/word-generator-application-settings.mjs";

export default class WordGeneratorApplicationDataSource {
  static FLAG_SCOPE = "core";
  static KEY_FLAG = "word-generator-application-settings";

  /**
   * Returns the application settings of a user. 
   * @param {String} userId ID of a user. 
   * 
   * @returns {WordGeneratorApplicationSettings}
   */
  get(userId) {
    const user = game.users.get(userId);
    
    if (user === undefined) return undefined;

    const flag = user.getFlag(
      WordGeneratorApplicationDataSource.FLAG_SCOPE,
      WordGeneratorApplicationDataSource.KEY_FLAG
    ) ?? {
      amountToGenerate: 10,
    };

    return WordGeneratorApplicationSettings.fromObject(flag);
  }

  /**
   * Adds or overwrites an application setting of a user. 
   * @param {String} userId ID of a user. 
   * @param {WordGeneratorApplicationSettings} settings The settings to persist. 
   */
  set(userId, settings) {
    const user = game.users.get(userId);

    if (user === undefined) return;

    user.setFlag(
      WordGeneratorApplicationDataSource.FLAG_SCOPE,
      WordGeneratorApplicationDataSource.KEY_FLAG,
      settings.toObject()
    );
  }
}
