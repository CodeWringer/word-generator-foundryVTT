/**
 * Represents a folder within which word generators and other folders may be grouped. 
 * 
 * @property {String} id Unique ID of the folder. 
 * @property {String} name Human readable name of the folder. 
 * @property {Array<String>} itemIds IDs of the contained word generators. 
 * @property {String | undefined} parentId Unique ID of the parent folder, if there is one. 
 * @property {Array<String>} childIds Unique IDs of nested folders. 
 */
export default class WordGeneratorFolder {
  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of the folder. 
   * @param {String | undefined} args.name Human readable name of the folder. 
   * * Default localized `New Folder`
   * @param {Array<String> | undefined} args.itemIds IDs of the contained word generators. 
   * @param {String | undefined} args.parentId Unique ID of the parent folder, if there is one. 
   * @param {Array<String> | undefined} args.childIds Unique IDs of contained folders. 
   */
  constructor(args = {}) {
    this.id = args.id ?? foundry.utils.randomID(16);
    this.name = args.name ?? game.i18n.localize("wg.folder.defaultName");
    this.itemIds = args.itemIds ?? [];
    this.parentId = args.parentId;
    this.childIds = args.childIds ?? [];
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
      parentId: obj.parentId,
      childIds: obj.childIds,
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
      parentId: this.parentId,
      childIds: this.childIds,
    };
  }
}