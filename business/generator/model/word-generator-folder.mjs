/**
 * Represents a folder. 
 * 
 * @property {String} id
 * @property {String} name
 * @property {Array<String>} itemIds IDs of word generators or other folders. 
 */
export default class WordGeneratorFolder {
  constructor(args = {}) {
    this.id = args.id ?? foundry.utils.randomID(16);
    this.name = args.name ?? "New Folder";
    this.itemIds = args.itemIds ?? [];
  }
}