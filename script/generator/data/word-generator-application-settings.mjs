/**
 * @property {Number} amountToGenerate The number of words to generate. 
 */
export default class WordGeneratorApplicationSettings {
  /**
   * @param {Number} args.amountToGenerate The number of words to generate. 
   */
  constructor(args = {}) {
    this.amountToGenerate = args.amountToGenerate;
  }

  /**
   * Returns an instance of this type parsed from the given plain-object. 
   * 
   * @param {Object} obj 
   * 
   * @returns {WordGeneratorApplicationSettings}
   * 
   * @static
   */
  static fromObject(obj) {
    return new WordGeneratorApplicationSettings({
      amountToGenerate: obj.amountToGenerate,
    });
  }

  /**
   * Returns a plain-object representation of this instance. 
   * 
   * @returns {Object}
   */
  toObject() {
    return {
      amountToGenerate: this.amountToGenerate,
    };
  }
}