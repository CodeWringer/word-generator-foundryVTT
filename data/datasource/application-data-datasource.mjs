import WgApplicationData from "../../business/model/wg-application-data.mjs";

/**
 * Provides means of reading and writing the `WgApplicationData` to user flags. 
 */
export default class ApplicationDataDataSource {
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
   * @returns {WgApplicationData}
   */
  get(userId) {
    const user = game.users.get(userId);
    if (user === undefined) return undefined;

    const dto = user.getFlag(
      ApplicationDataDataSource.FLAG_SCOPE,
      ApplicationDataDataSource.KEY_FLAG
    ) ?? {};

    return WgApplicationData.fromDto(dto);
  }

  /**
   * Sets (= overwrites) the given user's word generator data with the given data. 
   * 
   * @param {String} userId User-ID. 
   * @param {WgApplicationData} data The data to set. 
   */
  set(userId, data) {
    const user = game.users.get(userId);
    if (user === undefined) return undefined;

    if (data === undefined) {
      throw new Error("Cannot set data undefined");
    }

    user.setFlag(
      ApplicationDataDataSource.FLAG_SCOPE,
      ApplicationDataDataSource.KEY_FLAG,
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
      ApplicationDataDataSource.FLAG_SCOPE,
      ApplicationDataDataSource.KEY_FLAG,
      null
    );
  }
}
