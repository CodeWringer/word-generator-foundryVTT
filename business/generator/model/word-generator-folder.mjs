/**
 * Represents a folder within which word generators and other folders may be grouped. 
 * 
 * @property {String} id Unique ID of the folder. 
 * @property {String} name Human readable name of the folder. 
 * @property {Array<String>} itemIds IDs of the contained word generators or other folders. 
 */
export default class WordGeneratorFolder {
  /**
   * @param {Object} args 
   * @param {String | undefined} id Unique ID of the folder. 
   * @param {String | undefined} name Human readable name of the folder. 
   * @param {Array<String> | undefined} itemIds IDs of the contained word generators or other folders. 
   */
  constructor(args = {}) {
    this.id = args.id ?? foundry.utils.randomID(16);
    this.name = args.name ?? "New Folder";
    this.itemIds = args.itemIds ?? [];
  }
  
  /**
   * Returns an instance of this type parsed from the given data transfer object. 
   * 
   * @param {Object} obj 
   * 
   * @returns {WordGeneratorFolder}
   * 
   * @static
   */
  static fromDto(obj) {
    return new WordGeneratorFolder({
      id: obj.id,
      name: obj.name,
      itemIds: obj.itemIds,
    });
  }

  /**
   * Returns a data transfer object representation of this instance. 
   * 
   * @returns {Object}
   */
  toDto() {
    return {
      id: this.id,
      name: this.name,
      itemIds: this.itemIds,
    };
  }
}