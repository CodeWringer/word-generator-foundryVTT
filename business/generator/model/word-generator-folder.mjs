/**
 * Represents a folder within which word generators and other folders may be grouped. 
 * 
 * @property {String} id Unique ID of the folder. 
 * @property {String} name Human readable name of the folder. 
 * @property {Array<String>} itemIds IDs of the contained word generators or other folders. 
 */
export default class WordGeneratorFolder {
  constructor(args = {}) {
    this.id = args.id ?? foundry.utils.randomID(16);
    this.name = args.name ?? "New Folder";
    this.itemIds = args.itemIds ?? [];
  }
}