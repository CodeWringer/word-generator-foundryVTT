import WordGeneratorApplicationData from "../../business/model/word-generator-application-data.mjs";

/**
 * Provides means of reading and writing the `WordGeneratorApplicationData` to user flags. 
 */
export default class WordGeneratorApplicationDataDataSource {
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
  static KEY_FLAG = "word-generator-application-data";

  /**
   * Returns the given user's word generator data. 
   * 
   * @param {String} userId User-ID. 
   * 
   * @returns {WordGeneratorApplicationData}
   */
  get(userId) {
    const user = game.users.get(userId);
    if (user === undefined) return undefined;

    const dto = user.getFlag(
      WordGeneratorApplicationDataDataSource.FLAG_SCOPE,
      WordGeneratorApplicationDataDataSource.KEY_FLAG
    ) ?? new WordGeneratorApplicationData();

    return WordGeneratorApplicationData.fromDto(dto);
  }

  /**
   * Sets (= overwrites) the given user's word generator data with the given data. 
   * 
   * @param {String} userId User-ID. 
   * @param {WordGeneratorApplicationData} data The data to set. 
   */
  set(userId, data) {
    const user = game.users.get(userId);
    if (user === undefined) return undefined;

    if (data === undefined) {
      throw new Error("Cannot set data undefined");
    }

    user.setFlag(
      WordGeneratorApplicationDataDataSource.FLAG_SCOPE,
      WordGeneratorApplicationDataDataSource.KEY_FLAG,
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
      WordGeneratorApplicationDataDataSource.FLAG_SCOPE,
      WordGeneratorApplicationDataDataSource.KEY_FLAG,
      null
    );
  }
}
