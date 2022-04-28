import GeneratorSettings from "./generator/generator-settings.mjs";

/**
 * @abstract
 */
export default class AbstractGeneratorDataSource {
  /**
   * 
   * @param {String} userId 
   * @param {String} id 
   * @returns {GeneratorSettings}
   */
  get(userId, id) {
    throw new Error("Not implemented");
  }

  /**
   * 
   * @param {String} userId 
   * @returns {Array<GeneratorSettings>}
   */
  getAll(userId) {
    throw new Error("Not implemented");
  }
  
  /**
   * 
   * @param {String} userId 
   * @param {String} id 
   * @param {GeneratorSettings} generatorSettings 
   */
  set(userId, id, generatorSettings) {
    throw new Error("Not implemented");
  }

  /**
   * 
   * @param {String} userId 
   * @param {String} id 
   * @returns {Boolean} True, if an entry with the given id was removed. 
   */
  remove(userId, id) {
    throw new Error("Not implemented");
  }
  
  /**
   * 
   * @param {String} userId 
   */
  clear(userId) {
    throw new Error("Not implemented");
  }
}
