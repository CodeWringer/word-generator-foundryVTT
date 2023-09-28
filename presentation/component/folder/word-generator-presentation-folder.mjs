import WordGeneratorFolder from "../../../business/generator/model/word-generator-folder.mjs";
import WordGeneratorItem from "../../../business/generator/model/word-generator-item.mjs";
import PresentationalEntity from "../../presentational-entity.mjs";

/**
 * Represents a folder within which word generators and other folders may be grouped, 
 * with all the necessary data for a folder to be represented by the UI. 
 * 
 * @property {WordGeneratorFolder} entity The represented entity. 
 * @property {String | undefined} template Path to the template file of this entity. 
 * 
 * @property {Array<WordGeneratorItem>} items The contained word generators. 
 * @property {WordGeneratorPresentationFolder | undefined} parent The parent folder, if there is one. 
 * @property {Array<WordGeneratorPresentationFolder>} children Nested folders. 
 * @property {Boolean} isExpanded If `true`, the entry is to be rendered fully. Otherwise, 
 * it is rendered collapsed. 
 */
export default class WordGeneratorPresentationFolder extends PresentationalEntity {
  /**
   * @param {Object} args 
   * 
   * @param {WordGeneratorFolder} args.entity The represented entity. 
   * @param {String | undefined} args.template Path to the template file of this entity. 
   * 
   * @param {Array<WordGeneratorItem> | undefined} args.items The contained word generators. 
   * @param {WordGeneratorPresentationFolder | undefined} args.parent The parent folder, if there is one. 
   * @param {Array<WordGeneratorPresentationFolder> | undefined} args.children Nested folders. 
   * @param {Boolean | undefined} args.isExpanded If `true`, the entry is to be rendered fully. Otherwise, 
   * it is rendered collapsed. 
   * * Default `false`
   */
  constructor(args = {}) {
    super(args);

    this.items = args.items ?? [];
    this.parent = args.parent;
    this.children = args.children ?? [];
    this.isExpanded = args.isExpanded ?? false;
  }
}