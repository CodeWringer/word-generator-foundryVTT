/**
 * @abstract
 */
export default class AbstractGeneratorDataSource {
  /**
   * 
   * @param {String} userId 
   * @param {String} id 
   * @returns {GeneratorSettings}
   * @async
   */
  async get(userId, id) {
    throw new Error("Not implemented");
  }

  /**
   * 
   * @param {String} userId 
   * @returns {Array<GeneratorSettings>}
   * @async
   */
  async getAll(userId) {
    throw new Error("Not implemented");
  }
  
  /**
   * 
   * @param {String} userId 
   * @param {String} id 
   * @param {GeneratorSettings} generatorSettings 
   * @async
   */
  async set(userId, id, generatorSettings) {
    throw new Error("Not implemented");
  }

  /**
   * 
   * @param {String} userId 
   * @param {String} id 
   * @returns {Boolean} True, if an entry with the given id was removed. 
   * @async
   */
  async remove(userId, id) {
    throw new Error("Not implemented");
  }
  
  /**
   * 
   * @param {String} userId 
   * @async
   */
  async clear(userId) {
    throw new Error("Not implemented");
  }
}
