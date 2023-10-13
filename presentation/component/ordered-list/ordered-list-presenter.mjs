import AbstractPresenter from "../../abstract-presenter.mjs";
import { TEMPLATES } from "../../templates.mjs";

/**
 * Represents an ordered list. 
 * 
 * @property {String} template Path to the Handlebars template. 
 * * Read-only
 * * Abstract
 * @property {Application} application The parent application. 
 * @property {Array<OrderedListItemPresenter>} itemPresenters Wrapper presenters 
 * of the actual content presenters. 
 * @property {Boolean} args.showIndices If `true`, will render every 
   * item's index. 
 * @property {Function} onMoveUpClicked Callback that is 
 * invoked when the "move up" button of an item is clicked. Params:
 * * `maximum: Boolean` - If `true`, the item is to be moved to the boundary.
 * * `itemId: String` - ID of the item to move. 
 * @property {Function} onMoveDownClicked Callback that is 
 * invoked when the "move down" button of an item is clicked. Params:
 * * `maximum: Boolean` - If `true`, the item is to be moved to the boundary.
 * * `itemId: String` - ID of the item to move. 
 * 
 * @extends AbstractPresenter
 */
export default class OrderedListPresenter extends AbstractPresenter {
  get template() { return TEMPLATES.ORDERED_LIST; }
  
  /**
   * @param {Object} args
   * @param {WordGeneratorApplication} args.application The parent application. 
   * @param {Array<AbstractPresenter> | undefined} args.itemPresenters Presenters 
   * of the actual content. 
   * @param {Boolean | undefined} args.showIndices If `true`, will render every 
   * item's index. 
   * * default `false`
   * @param {Function | undefined} args.onMoveUpClicked Callback that is 
   * invoked when the "move up" button of an item is clicked. Params:
   * * `maximum: Boolean` - If `true`, the item is to be moved to the boundary.
   * * `itemId: String` - ID of the item to move. 
   * @param {Function | undefined} args.onMoveDownClicked Callback that is 
   * invoked when the "move down" button of an item is clicked. Params:
   * * `maximum: Boolean` - If `true`, the item is to be moved to the boundary.
   * * `itemId: String` - ID of the item to move. 
   */
  constructor(args = {}) {
    super(args);

    this.showIndices = args.showIndices ?? false;
    this.onMoveUpClicked = args.onMoveUpClicked ?? (() => {});
    this.onMoveDownClicked = args.onMoveDownClicked ?? (() => {});

    this.itemPresenters = [];
    for (let i = 0; i < args.itemPresenters.length; i++) {
      const presenter = args.itemPresenters[i];
      
      this.itemPresenters.push(new OrderedListItemPresenter({
        id: presenter.id,
        enableMoveUp: (i > 0 ? true : false),
        enableMoveDown: (i < args.itemPresenters.length - 1 ? true : false),
        presenter: presenter,
        onMoveUpClicked: (maximum, itemId) => {
          this.onMoveUpClicked(maximum, itemId);
        },
        onMoveDownClicked: (maximum, itemId) => {
          this.onMoveDownClicked(maximum, itemId);
        },
      }));
    }
  }

  /** @override */
  activateListeners(html) {
    for (const presenter of this.itemPresenters) {
      presenter.activateListeners(html);
    }
  }
}

/**
 * Represents a list item of an ordered list. 
 * 
 * Wraps another given presenter. _This_ presenter is used for list-related 
 * handlings and the wrapped presenter handles the actual content. 
 * 
 * @property {String} id ID of the wrapped content. 
 * @property {AbstractPresenter} presenter The wrapped presenter. 
 * @property {Boolean} enableMoveUp If `true`, enables the "move up" button. 
 * @property {Boolean} enableMoveDown If `true`, enables the "move down" button. 
 * @property {Number} index Index of the item. 
 * @property {Function} onMoveUpClicked Callback that is 
 * invoked when the "move up" button of the item is clicked. Params:
 * * `maximum: Boolean` - If `true`, the item is to be moved to the boundary.
 * * `itemId: String` - ID of the item to move. 
 * @property {Function} onMoveDownClicked Callback that is 
 * invoked when the "move down" button of the item is clicked. Params:
 * * `maximum: Boolean` - If `true`, the item is to be moved to the boundary.
 * * `itemId: String` - ID of the item to move. 
 */
export class OrderedListItemPresenter {
  /**
   * @param {Object} args 
   * @param {String} args.id ID of the wrapped content. 
   * @param {AbstractPresenter} args.presenter The wrapped presenter. 
   * @param {Boolean | undefined} args.enableMoveUp If `true`, enables the 
   * "move up" button. 
   * * default `false`
   * @param {Boolean | undefined} args.enableMoveDown If `true`, enables the 
   * "move down" button. 
   * * default `false`
   * @param {Number | undefined} args.index Index of the item. 
   * * default `1`
   * @param {Function | undefined} args.onMoveUpClicked Callback that is 
   * invoked when the "move up" button of the item is clicked. Params:
   * * `maximum: Boolean` - If `true`, the item is to be moved to the boundary.
   * * `itemId: String` - ID of the item to move. 
   * @param {Function | undefined} args.onMoveDownClicked Callback that is 
   * invoked when the "move down" button of the item is clicked. Params:
   * * `maximum: Boolean` - If `true`, the item is to be moved to the boundary.
   * * `itemId: String` - ID of the item to move. 
   */
  constructor(args = {}) {
    this.id = args.id;
    this.presenter = args.presenter;
    this.enableMoveUp = args.enableMoveUp ?? false;
    this.enableMoveDown = args.enableMoveDown ?? false;
    this.index = args.index ?? 1;
    this.onMoveUpClicked = args.onMoveUpClicked ?? (() => {});
    this.onMoveDownClicked = args.onMoveDownClicked ?? (() => {});
  }

  /**
   * Registers event listeners to enable user-interactivity, both for this 
   * list item and its wrapped presenter.
   * 
   * @param {JQuery} html 
   */
  activateListeners(html) {
    html.find(`#${this.id}-move-up`).click(async (event) => {
      event.stopPropagation();

      if (event.ctrlKey || event.shiftKey) {
        this.onMoveUpClicked(true, this.id);
      } else {
        this.onMoveUpClicked(false, this.id);
      }
    });

    html.find(`#${this.id}-move-down`).click(async (event) => {
      event.stopPropagation();

      if (event.ctrlKey || event.shiftKey) {
        this.onMoveDownClicked(true, this.id);
      } else {
        this.onMoveDownClicked(false, this.id);
      }
    });

    // Wrapped presenter.
    this.presenter.activateListeners(html);
  }
}
