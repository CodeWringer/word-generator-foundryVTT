/**
 * Represents a unique data entity. 
 * 
 * @property {String} id Unique ID of the entity. 
 * * Read-only
 */
export default class AbstractEntity {
  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of the folder. 
   * * By default, generates a new id. 
   */
  constructor(args = {}) {
    this.id = args.id ?? foundry.utils.randomID(16);
  }
}