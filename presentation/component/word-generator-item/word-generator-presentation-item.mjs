import WordGeneratorItem from "../../../business/generator/model/word-generator-item.mjs";
import PresentationalEntity from "../../presentational-entity.mjs";

/**
 * Represents the settings of a word generator item, for presentation. 
 * 
 * @property {WordGeneratorItem} entity The represented entity. 
 * @property {String | undefined} template Path to the template file of this entity. 
 * 
 * @property {Boolean} isExpanded If `true`, the entry is to be rendered fully. Otherwise, 
 * it is rendered collapsed. 
 * @property {Array<DropDownOption>} sequencingStrategies
 * @property {Array<DropDownOption>} spellingStrategies
 */
export default class WordGeneratorPresentationItem extends PresentationalEntity {
  /**
   * @param {Object} args
   * 
   * @param {WordGeneratorItem} args.entity The represented entity. 
   * @param {String | undefined} args.template Path to the template file of this entity. 
   * 
   * @param {Boolean | undefined} args.isExpanded If `true`, the entry is to be rendered fully. Otherwise, 
   * it is rendered collapsed. 
   * * Default `false`
   * @param {Array<DropDownOption> | undefined} sequencingStrategies
   * @param {Array<DropDownOption> | undefined} spellingStrategies
   */
  constructor(args = {}) {
    super(args);

    this.isExpanded = args.isExpanded ?? false;
    this.sequencingStrategies = args.sequencingStrategies ?? [];
    this.spellingStrategies = args.spellingStrategies ?? [];
  }
}
