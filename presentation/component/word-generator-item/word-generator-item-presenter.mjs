import DialogUtility from "../../util/dialog-utility.mjs";
import { StrategySettingValueTypes } from "../../../business/generator/strategy-setting.mjs";
import InfoBubble, { InfoBubbleAutoHidingTypes, InfoBubbleAutoShowingTypes } from "../info-bubble/info-bubble.mjs";
import WordGeneratorApplication from "../../application/word-generator-application/word-generator-application.mjs";
import WordGeneratorSamplesApplication from "../../application/word-generator-samples-application/word-generator-samples-application.mjs";
import { TEMPLATES } from "../../templates.mjs";
import DropDownOption from "../../drop-down-option.mjs";
import WordGeneratorItem from "../../../business/model/word-generator-item.mjs";
import AbstractSequencingStrategy from "../../../business/generator/sequencing/abstract-sequencing-strategy.mjs";
import AbstractSpellingStrategy from "../../../business/generator/postprocessing/abstract-spelling-strategy.mjs";
import AbstractEntityPresenter from "../../abstract-entity-presenter.mjs";
import ObservableWordGeneratorItem from "../../../business/model/observable-word-generator-item.mjs";
import { DragDropHandler } from "../../util/drag-drop-handler.mjs";

/**
 * This presenter handles a singular generator. 
 * 
 * @property {String} template Path to the Handlebars template that represents the entity. 
 * * Read-only
 * @property {WordGeneratorApplication} application The parent application. 
 * @property {ObservableWordGeneratorItem} entity The represented entity.  
 * 
 * @property {Array<AbstractSequencingStrategy>} sequencingStrategies
 * @property {Array<DropDownOption>} sequencingStrategyOptions
 * 
 * @property {Array<AbstractSpellingStrategy>} spellingStrategies
 * @property {Array<DropDownOption>} spellingStrategyOptions
 */
export default class WordGeneratorItemPresenter extends AbstractEntityPresenter {
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
  static entityDataType = "WordGeneratorItem";

  get template() { return TEMPLATES.WORD_GENERATOR_LIST_ITEM; }

  get id() { return this.entity.id; }

  get name() { return this.entity.name.value; }

  get isExpanded() { return this.entity.isExpanded.value; }

  get disableMoveUp() {
    const collection = this._getContainingCollection().getAll();
    const index = collection.findIndex(it => it.id === this.entity.id);
    
    if (index <= 0) {
      return true;
    } else {
      return false;
    }
  }

  get disableMoveDown() {
    const collection = this._getContainingCollection().getAll();
    const maxIndex = collection.length - 1;
    const index = collection.findIndex(it => it.id === this.entity.id);
    
    if (index >= maxIndex) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * @param {Object} args
   * @param {WordGeneratorApplication} args.application The parent application. 
   * @param {ObservableWordGeneratorItem} args.entity The represented entity.  
   */
  constructor(args = {}) {
    super(args);

    this.sampleSetStrategies = WordGeneratorApplication.registeredSamplingStrategies.getAll();
    this.sampleSetStrategyOptions = this.sampleSetStrategies
    .map(it => new DropDownOption({
      value: it.getDefinitionID(),
      localizedLabel: it.getHumanReadableName(),
    }));

    this.sequencingStrategies = WordGeneratorApplication.registeredSequencingStrategies.getAll();
    this.sequencingStrategyOptions = this.sequencingStrategies
      .map(it => new DropDownOption({
        value: it.getDefinitionID(),
        localizedLabel: it.getHumanReadableName(),
      }));

    this.spellingStrategies = WordGeneratorApplication.registeredSpellingStrategies.getAll();
    this.spellingStrategyOptions = this.spellingStrategies
      .map(it => new DropDownOption({
        value: it.getDefinitionID(),
        localizedLabel: it.getHumanReadableName(),
      }));

    this._dragDropHandler = new DragDropHandler({
      entityId: this.entity.id,
      entityDataType: WordGeneratorItemPresenter.entityDataType,
      receiverElementId: `${this.entity.id}-header`,
      draggableElementId: `${this.entity.id}-header`,
    });
  }

  activateListeners(html) {
    const id = this.entity.id;

    this._infoBubble = new InfoBubble({
      html: html,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      map: [
        {
          element: html.find(`#${this.id}-sample-set-strategy-info`),
          text: game.i18n.localize("wg.generator.sampleSet.infoHint"),
        },
        {
          element: html.find(`#${this.id}-target-length-min-info`),
          text: game.i18n.localize("wg.generator.targetLength.infoHint"),
        },
        {
          element: html.find(`#${this.id}-target-length-max-info`),
          text: game.i18n.localize("wg.generator.targetLength.infoHint"),
        },
        {
          element: html.find(`#${this.id}-entropy-info`),
          text: game.i18n.localize("wg.generator.entropy.infoHint"),
        },
        {
          element: html.find(`#${this.id}-entropy-start-info`),
          text: game.i18n.localize("wg.generator.entropy.start.infoHint"),
        },
        {
          element: html.find(`#${this.id}-entropy-middle-info`),
          text: game.i18n.localize("wg.generator.entropy.middle.infoHint"),
        },
        {
          element: html.find(`#${this.id}-entropy-end-info`),
          text: game.i18n.localize("wg.generator.entropy.end.infoHint"),
        },
        {
          element: html.find(`#${this.id}-ending-pick-mode-info`),
          text: game.i18n.localize("wg.generator.endingPickMode.infoHint"),
        },
        {
          element: html.find(`#${this.id}-seed-info`),
          text: game.i18n.localize("wg.generator.seed.infoHint"),
        },
        {
          element: html.find(`#${this.id}-sequencing-strategy-info`),
          text: game.i18n.localize("wg.generator.sequencingStrategy.infoHint"),
        },
        {
          element: html.find(`#${this.id}-spelling-strategy-info`),
          text: game.i18n.localize("wg.generator.spellingStrategy.infoHint"),
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
          name: game.i18n.localize("wg.generator.edit"),
          icon: '<i class="fas fa-edit"></i>',
          callback: async () => {
            this._edit();
          }
        },
        {
          name: game.i18n.localize("wg.generator.generate"),
          icon: '<i class="fas fa-pen-nib"></i>',
          callback: async () => {
            this._generate();
          }
        },
        {
          name: game.i18n.localize("wg.general.moveToRootLevel"),
          icon: '<i class="fas fa-angle-double-up"></i>',
          callback: async () => {
            this._moveToRootLevel();
          },
          condition: () => {
            return this.entity.parent.value !== undefined;
          }
        },
        {
          name: game.i18n.localize("wg.generator.delete"),
          icon: '<i class="fas fa-trash"></i>',
          callback: async () => {
            this._delete();
          }
        },
      ]
    );

    html.find(`#${id}-generate`).click((event) => {
      event.stopPropagation();
      this._generate();
    });
    
    html.find(`#${id}-move-up`).click(async (event) => {
      event.stopPropagation();

      if (event.ctrlKey || event.shiftKey) {
        this._moveUp(true);
      } else {
        this._moveUp(false);
      }
    });

    html.find(`#${id}-move-down`).click(async (event) => {
      event.stopPropagation();

      if (event.ctrlKey || event.shiftKey) {
        this._moveDown(true);
      } else {
        this._moveDown(false);
      }
    });

    html.find(`input#${id}-target-length-min`).change((data) => {
      this.entity.targetLengthMin.value = this.getValueOrDefault(data, 1);
    });
    html.find(`input#${id}-target-length-max`).change((data) => {
      this.entity.targetLengthMax.value = this.getValueOrDefault(data, 1);
    });
    html.find(`input#${id}-entropy`).change((data) => {
      this.entity.entropy.value = this.getValueOrDefault(data, 1);
    });
    html.find(`input#${id}-entropy-start`).change((data) => {
      this.entity.entropyStart.value = this.getValueOrDefault(data, 1);
    });
    html.find(`input#${id}-entropy-middle`).change((data) => {
      this.entity.entropyMiddle.value = this.getValueOrDefault(data, 1);
    });
    html.find(`input#${id}-entropy-end`).change((data) => {
      this.entity.entropyEnd.value = this.getValueOrDefault(data, 1);
    });
    html.find(`input#${id}-seed`).change((data) => {
      this.entity.seed.value = this.getValueOrDefault(data, 1);
    });

    // Ending pick mode
    const idEndingPickMode = `${id}-ending-pick-mode`;
    html.find(`#${idEndingPickMode}`).change((data) => {
      this.entity.endingPickMode.value = $(data.target).val();
    });
    this.syncDropDownValue(html, idEndingPickMode, this.entity.endingPickMode.value);

    
    // html.find(`#${id}-edit-sample-set`).click(() => {
    //   new WordGeneratorSamplesApplication(this.entity, (data) => {
    //     if (data.confirmed === true) {
    //       this.entity.sampleSet.value = data.sampleSet;
    //       this.entity.sampleSetSeparator.value = data.sampleSetSeparator;
    //       this._updateRender()
    //     }
    //   }).render(true);
    // });

    // Sample set


    // Sequencing settings
    // html.find(`#${id}-sequencing-settings > li > input`).change(data => {
    //   const id = $(data.target)[0].id;
    //   const setting = this.entity.sequencingStrategySettings.getAll().find(it => it.name === id);
    //   setting.value = this._parseSettingValue(setting, data.target);
    // });

    // // Spelling settings
    // html.find(`#${id}-spelling-settings > li > input`).change(data => {
    //   const id = $(data.target)[0].id;
    //   const setting = this.entity.spellingStrategySettings.getAll().find(it => it.name === id);
    //   setting.value = this._parseSettingValue(setting, data.target);
    // });

    // Drag & drop
    this._dragDropHandler.activateListeners(html);
  }

  /**
   * Returns a value that the given `StrategySetting` instance would accept,
   * based on the given DOM element's current value. 
   * @param {StrategySetting} setting 
   * @param {JQuery | HTMLElement} element 
   * 
   * @returns {String | Number | Boolean}
   * 
   * @private
   */
  _parseSettingValue(setting, element) {
    const jElement = $(element);

    switch (setting.valueType) {
      case StrategySettingValueTypes.INTEGER:
        return parseInt($(jElement).val());
      case StrategySettingValueTypes.FLOAT:
        return parseFloat($(jElement).val());
      case StrategySettingValueTypes.BOOLEAN:
        return $(jElement)[0].checked;
      default:
        return $(jElement).val();
    }
  }
  
  /**
   * Returns the parent collection.
   * 
   * @returns {ObservableCollection<ObservableWordGeneratorItem>}
   */
  _getContainingCollection() {
    let generators;
    if (this.entity.parent.value === undefined) {
      generators = this.application._data.generators;
    } else {
      generators = this.entity.parent.value.items;
    }
    return generators;
  }

  /**
   * Moves this generator to the root level, if possible. 
   * 
   * @private
   */
  _moveToRootLevel() {
    if (this.entity.parent.value === undefined) return; // Already at root level. 

    this.application.suspendRendering = true;

    // Remove from current parent. 
    const collection = this._getContainingCollection();
    collection.remove(this.entity);

    this.application.suspendRendering = false;

    // Add to root level collection. 
    this.application._data.generators.add(this.entity);
  }

  /**
   * Moves the generator up one index in its containing collection, if possible. 
   * 
   * @param {Boolean | undefined} toStart If `true`, moves up all the way to the first index. 
   * * default `false`
   * 
   * @private
   */
  _moveUp(toStart = false) {
    if (this.disableMoveUp === true) return;

      const collection = this._getContainingCollection();
      const index = collection.getAll().findIndex(it => it.id === this.entity.id);

      let newIndex;
      if (toStart === true) {
        newIndex = 0;
      } else {
        newIndex = Math.max(0, index - 1);
      }

      collection.move(index, newIndex);
  }

  /**
   * Moves the generator down one index in its containing collection, if possible. 
   * 
   * @param {Boolean | undefined} toEnd If `true`, moves down all the way to the last index. 
   * * default `false`
   * 
   * @private
   */
  _moveDown(toEnd = false) {
    if (this.disableMoveDown === true) return;

    const collection = this._getContainingCollection();
    const index = collection.getAll().findIndex(it => it.id === this.entity.id);
    const maxIndex = collection.length - 1;
    
    let newIndex;
    if (toEnd === true) {
      newIndex = maxIndex;
    } else {
      newIndex = Math.max(maxIndex, index + 1);
    }

    collection.move(index, newIndex);
  }

  /**
   * Generates results using the represented generator. 
   * 
   * @private
   */
  _generate() {
    const generator = this.entity.toGenerator();
    const results = generator.generate(this.application._data.amountToGenerate.value);

    this.application.suspendRendering = true;
    this.application._data.generatedResults.clear();
    this.application.suspendRendering = false;
    this.application._data.generatedResults.addAll(results);
  }

  /**
   * Prompts the user to enter a new name and if confirmed, applies it. 
   * 
   * @private
   * @async
   */
  async _edit() {
    const dialog = await new DialogUtility().showSingleInputDialog({
      localizedTitle: game.i18n.localize("wg.generator.create"),
      localizedInputLabel: game.i18n.localize("wg.generator.name"),
      value: this.entity.name.value,
      modal: true,
    });

    if (dialog.confirmed !== true) return;

    this.entity.name.value = dialog.input;
  }
  
  /**
   * Prompts the user to confirm and if confirmed, deletes this generator. 
   * 
   * @private
   * @async
   */
  async _delete() {
    const dialog = await new DialogUtility().showConfirmationDialog({
      localizedTitle: game.i18n.localize("wg.generator.confirmDeletion"),
      content: game.i18n.localize("wg.general.confirmDeletionOf").replace("%s", this.entity.name.value),
      modal: true,
    });

    if (dialog.confirmed !== true) return;

    const collection = this._getContainingCollection();
    collection.remove(this.entity);
  }
}