import AbstractPresenter from "../../../abstract-presenter.mjs";
import { TEMPLATES } from "../../../templates.mjs";

/**
 * Represents a singular chain dependency. 
 * 
 * @property {String} id Compound-ID of the parent chain and the 
 * represented dependency. 
 * @property {String} itemId ID of the represented dependency. 
 * @property {String | undefined} icon Icon HTML content to display. 
 * E. g. `<i class="fas fa-link"></i>`
 * @property {String | undefined} name Name of the represented dependency. 
 * @property {Function} onRemoveClicked Callback that is 
 * invoked when the item's remove quick action button is clicked. Arguments: 
 * * `itemId: String`
 */
export class WgChainItemPresenter extends AbstractPresenter {
  get template() { return TEMPLATES.CHAIN_ITEM; }

  /**
   * @param {Object} args 
   * @param {String} args.id Compound-ID of the parent chain and the 
   * represented dependency. 
   * @param {String} args.itemId ID of the represented dependency. 
   * @param {String | undefined} args.icon Icon HTML content to display. 
   * E. g. `<i class="fas fa-link"></i>`
   * @param {String | undefined} args.name Name of the represented dependency. 
   * @param {Function | undefined} args.onRemoveClicked Callback that is 
   * invoked when the item's remove quick action button is clicked. Arguments: 
   * * `itemId: String`
   */
  constructor(args = {}) {
    super(args);

    this.id = args.id;
    this.itemId = args.itemId;
    this.icon = args.icon;
    this.name = args.name;
    this.onRemoveClicked = args.onRemoveClicked ?? (() => {});
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(`#${this.id}-remove`).click(() => {
      this.onRemoveClicked(this.itemId);
    });
  }
}
