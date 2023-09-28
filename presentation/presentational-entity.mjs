/**
 * Represents a single entity, for display in the presentational layer. 
 * 
 * @property {Object} entity The represented entity. 
 * @property {String | undefined} template Path to the template file of this entity. 
 */
export default class PresentationalEntity {
  /**
   * @param {Object} args
   * @param {Object} args.entity The represented entity. 
   * @param {String | undefined} args.template Path to the template file of this entity. 
   */
  constructor(args = {}) {
    this.entity = args.entity;
    this.template = args.template;
  }
}