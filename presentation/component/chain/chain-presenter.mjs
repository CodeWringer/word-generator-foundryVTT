import WgApplicationData from "../../../business/model/wg-application-data.mjs";
import WgChain from "../../../business/model/wg-chain.mjs";
import AbstractEntityPresenter from "../../abstract-entity-presenter.mjs";
import AbstractPresenter from "../../abstract-presenter.mjs";
import DialogUtility, { MultiSelectOption } from "../../dialog/dialog-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import { DragDropHandler } from "../../util/drag-drop-handler.mjs";
import InfoBubble, { InfoBubbleAutoHidingTypes, InfoBubbleAutoShowingTypes } from "../info-bubble/info-bubble.mjs";
import OrderedListPresenter from "../ordered-list/ordered-list-presenter.mjs";
import { WgChainItemPresenter } from "./item/chain-item-presenter.mjs";

/**
 * This presenter handles a singular chain. 
 * 
 * @property {String} template Path to the Handlebars template that represents the entity. 
 * * Read-only
 * @property {WordGeneratorApplication} application The parent application. 
 * @property {WgChain} entity The represented entity.  
 * @property {String} id
 * * Read-only
 */
export default class WgChainPresenter extends AbstractEntityPresenter {
  /**
   * Returns the data type of the represented entity. 
   * 
   * For use in the drag and drop handler, so that drop events 
   * can be handled appropriately. 
   * 
   * @type {String}
   * @readonly
   * @static
   */
  static entityDataType = "WgChain";

  get template() { return TEMPLATES.CHAIN; }

  get id() { return this.entity.id; }

  get name() { return this.entity.name.value; }

  get isExpanded() { return this.entity.isExpanded.value; }

  /**
   * Returns `true`, if generation of results is possible. `false` otherwise. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get isGenerationEnabled() { return this.entity.items.getAll().length > 0; }

  /**
   * @param {Object} args
   * @param {WordGeneratorApplication} args.application The parent application. 
   * @param {WgChain} args.entity The represented entity.  
   */
  constructor(args = {}) {
    super(args);

    const generators = this.application.data.rootFolder.getGenerators();
    const chains = this.application.data.rootFolder.getChains();

    this.itemsPresenter = new OrderedListPresenter({
      application: args.application,
      itemPresenters: args.entity.items.getAll().map(item => {
        let iconHtml = "";
        if (generators.find(generator => generator.id === item.id) !== undefined) {
          iconHtml = '<i class="fas fa-scroll"></i>';
        } else if (chains.find(chain => chain.id === item.id) !== undefined) {
          iconHtml = '<i class="fas fa-link"></i>';
        }

        return new WgChainItemPresenter({
          id: `${this.entity.id}-${item.id}`,
          itemId: item.id,
          icon: iconHtml,
          name: item.name.value,
          onRemoveClicked: (itemId) => {
            const toRemove = this.entity.items.find(it => it.id === itemId);
            this.entity.items.remove(toRemove);
          },
        });
      }),
      showIndices: true,
      onMoveUpClicked: (maximum, compoundId) => {
        const itemId = compoundId.split("-")[1];
        const toMove = this.entity.items.find(it => it.id === itemId);
        
        const originIndex = this.entity.items.indexOf(toMove);
        const destinationIndex = maximum === true ? 0 : Math.max(0, originIndex - 1);

        this.entity.items.move(originIndex, destinationIndex);
      },
      onMoveDownClicked: (maximum, compoundId) => {
        const itemId = compoundId.split("-")[1];
        const toMove = this.entity.items.find(it => it.id === itemId);
        
        const originIndex = this.entity.items.indexOf(toMove);
        const maxIndex = this.entity.items.length - 1;
        let destinationIndex = maximum === true ? maxIndex : Math.min(maxIndex, originIndex + 1);

        this.entity.items.move(originIndex, destinationIndex);
      },
    });

    // Drag and drop handler.
    this._dragDropHandler = new DragDropHandler({
      entityId: this.entity.id,
      entityDataType: WgChainPresenter.entityDataType,
      receiverElementId: `${this.entity.id}-header`,
      draggableElementId: `${this.entity.id}-header`,
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    const id = this.entity.id;

    this._infoBubble = new InfoBubble({
      html: html,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      map: [
        {
          element: html.find(`#${this.id}-separator-info`),
          text: game.i18n.localize("wg.chain.separator.infoHint"),
        },
        {
          element: html.find(`#${this.id}-items-info`),
          text: game.i18n.localize("wg.chain.items.infoHint"),
        },
      ]
    });

    const headerElement = html.find(`#${id}-header`);
    headerElement.click((event) => {
      event.stopPropagation();

      this.entity.isExpanded.value = !this.entity.isExpanded.value;
    });

    new ContextMenu(
      html, 
      `#${id}-header`,
      [
        {
          name: game.i18n.localize("wg.chain.edit"),
          icon: '<i class="fas fa-edit"></i>',
          callback: async () => {
            this._edit();
          }
        },
        {
          name: game.i18n.localize("wg.generator.generate"),
          icon: '<i class="fas fa-pen-nib"></i>',
          callback: async () => {
            this.generate(this.application.data.amountToGenerate.value);
          }
        },
        {
          name: game.i18n.localize("wg.general.moveToRootLevel"),
          icon: '<i class="fas fa-angle-double-up"></i>',
          callback: async () => {
            this.application.suspendRendering = true;
            this.entity.moveToRootLevel();
            this.application.suspendRendering = false;
            this.application.render();
          },
          condition: () => {
            return this.entity.parent.value !== undefined
              && this.entity.parent.value.id !== WgApplicationData.ROOT_FOLDER_ID;
          }
        },
        {
          name: game.i18n.localize("wg.chain.delete"),
          icon: '<i class="fas fa-trash"></i>',
          callback: async () => {
            this.delete();
          }
        },
      ]
    );

    html.find(`#${id}-generate`).click(async (event) => {
      event.stopPropagation();
      this.generate(this.application.data.amountToGenerate.value);
    });
    html.find(`input#${id}-separator`).change((data) => {
      this.entity.separator.value = this.getValueOrDefault(data, " ");
    });
    html.find(`#${id}-edit-items`).click(async () => {
      const generators = this.application.data.rootFolder.getGenerators();
      const chains = this.application.data.rootFolder.getChains();
      const allChoices = generators.concat(chains.filter(it => 
        it.id !== this.entity.id
      ));

      const options = allChoices.map(toMap => 
        new MultiSelectOption({
          id: toMap.id,
          localizedLabel: toMap.name.value,
          isSelected: this.entity.items.any(item => item.id === toMap.id),
        })
      );

      const dialog = await new DialogUtility().showMultiSelectDialog({
        localizedTitle: game.i18n.localize("wg.chain.items.edit"),
        localizedInputLabel: game.i18n.localize("wg.chain.items.label"),
        modal: true,
        options: options,
      });

      if (dialog.confirmed !== true) return;

      const selected = dialog.selected.map(option => 
        allChoices.find(it => it.id === option.id)
      );
      
      this.application.suspendRendering = true;

      this.entity.items.clear();

      this.application.suspendRendering = false;

      this.entity.items.addAll(selected);
    });

    this.itemsPresenter.activateListeners(html);

    // Drag & drop
    this._dragDropHandler.activateListeners(html);
  }
  
  /**
   * Generates results using the represented generator. 
   * 
   * @param {Number} count The number of results to generate. 
   * 
   * @async
   */
  async generate(count) {
    if (this.isGenerationEnabled !== true) {
      const generateButtonElement = this._html.find(`#${this.id}-generate`);
      this._infoBubble.show(
        generateButtonElement, 
        game.i18n.localize("wg.chain.generationImpossible"),
      );

      return;
    }

    const results = await this.entity.generate(count);

    this.application.suspendRendering = true;
    this.application.data.generatedResults.clear();
    this.application.suspendRendering = false;
    this.application.data.generatedResults.addAll(results);
  }

  /**
   * Prompts the user to enter a new name and if confirmed, applies it. 
   * 
   * @private
   * @async
   */
  async _edit() {
    const dialog = await new DialogUtility().showSingleInputDialog({
      localizedTitle: game.i18n.localize("wg.chain.edit"),
      localizedInputLabel: game.i18n.localize("wg.chain.name"),
      value: this.entity.name.value,
      modal: true,
    });

    if (dialog.confirmed !== true) return;

    this.entity.name.value = dialog.input;
  }
}
