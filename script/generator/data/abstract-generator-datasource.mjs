/**
 * @abstract
 */
export default class AbstractGeneratorDataSource {
  /**
   * Returns a single generator setting of a user. 
   * @param {String} userId ID of a user. 
   * @param {String} id 
   * @returns {GeneratorSettings}
   */
  get(userId, id) {
    throw new Error("Not implemented");
  }

  /**
   * Returns all generator settings of a user. 
   * @param {String} userId ID of a user. 
   * @returns {Array<GeneratorSettings>}
   */
  getAll(userId) {
    throw new Error("Not implemented");
  }
  
  /**
   * Adds or overwrites a generator setting of a user. 
   * @param {String} userId ID of a user. 
   * @param {GeneratorSettings} generatorSetting The generator setting to set. 
   */
  set(userId, generatorSetting) {
    throw new Error("Not implemented");
  }

  /**
   * Overwrites all generator setting of a user with the given array of settings. 
   * @param {String} userId ID of a user. 
   * @param {Array<GeneratorSettings>} generatorSettings The generator settings to set. 
   */
  setAll(userId, generatorSettings) {
    throw new Error("Not implemented");
  }

  /**
   * Removes a generator whose ID matches with the given ID of a user. 
   * @param {String} userId ID of a user. 
   * @param {String} id ID of the generator setting to remove. 
   * @returns {Boolean} True, if an entry with the given id was removed. 
   */
  remove(userId, id) {
    throw new Error("Not implemented");
  }
  
  /**
   * Removes all generator settings of a user. 
   * @param {String} userId ID of a user. 
   */
  clear(userId) {
    throw new Error("Not implemented");
  }
}
