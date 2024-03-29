import DialogUtility from "../../dialog/dialog-utility.mjs";
import InfoBubble, { InfoBubbleAutoHidingTypes, InfoBubbleAutoShowingTypes } from "../info-bubble/info-bubble.mjs";
import WgApplication from "../../application/application-presenter.mjs";
import { TEMPLATES } from "../../templates.mjs";
import DropDownOption from "../../drop-down-option.mjs";
import WgGenerator from "../../../business/model/wg-generator.mjs";
import { DragDropHandler } from "../../util/drag-drop-handler.mjs";
import WgStrategyPresenter from "../strategy/strategy-presenter.mjs";
import AbstractEntityPresenter from "../../abstract-entity-presenter.mjs";
import WgApplicationData from "../../../business/model/wg-application-data.mjs";

/**
 * This presenter handles a singular generator. 
 * 
 * @property {String} template Path to the Handlebars template that represents the entity. 
 * * Read-only
 * @property {WgApplication} application The parent application. 
 * @property {WgGenerator} entity The represented entity.  
 */
export default class WgGeneratorPresenter extends AbstractEntityPresenter {
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
  static entityDataType = "WgGenerator";

  get template() { return TEMPLATES.GENERATOR; }

  get id() { return this.entity.id; }

  get name() { return this.entity.name.value; }

  get isExpanded() { return this.entity.isExpanded.value; }

  /**
   * Returns `true`, if generation of results is possible. `false` otherwise. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get isGenerationEnabled() {
    return this.entity.samplingStrategy.value.isFullyConfigured()
      && this.entity.sequencingStrategy.value.isFullyConfigured();
  }

  /**
   * @param {Object} args
   * @param {WgApplication} args.application The parent application. 
   * @param {WgGenerator} args.entity The represented entity.  
   */
  constructor(args = {}) {
    super(args);

    // Sample set presenter preparations.
    this.sampleSetStrategies = WgApplication.registeredSamplingStrategies.getAll();
    this.sampleSetStrategyOptions = this.sampleSetStrategies
      .map(it => new DropDownOption({
        value: it.id,
        localizedLabel: it.localizedName,
      }));
    this.sampleSetStrategyPresenter = new WgStrategyPresenter({
      application: this.application,
      entity: this.entity,
      id: `${this.entity.id}-sampling-strategy`,
      localizedLabel: game.i18n.localize("wg.generator.sampleSet.label"),
      strategyOptions: this.sampleSetStrategyOptions,
      activeStrategyField: this.entity.samplingStrategy,
      strategyDefinitions: this.sampleSetStrategies,
    });

    // Sequencing presenter preparations.
    this.sequencingStrategies = WgApplication.registeredSequencingStrategies.getAll();
    this.sequencingStrategyOptions = this.sequencingStrategies
      .map(it => new DropDownOption({
        value: it.id,
        localizedLabel: it.localizedName,
      }));
    this.sequencingStrategyPresenter = new WgStrategyPresenter({
      application: this.application,
      entity: this.entity,
      id: `${this.entity.id}-sequencing-strategy`,
      localizedLabel: game.i18n.localize("wg.generator.sequencingStrategy.label"),
      strategyOptions: this.sequencingStrategyOptions,
      activeStrategyField: this.entity.sequencingStrategy,
      strategyDefinitions: this.sequencingStrategies,
    });

    // Spelling presenter preparations.
    this.spellingStrategies = WgApplication.registeredSpellingStrategies.getAll();
    this.spellingStrategyOptions = this.spellingStrategies
      .map(it => new DropDownOption({
        value: it.id,
        localizedLabel: it.localizedName,
      }));
    this.spellingStrategyPresenter = new WgStrategyPresenter({
      application: this.application,
      entity: this.entity,
      id: `${this.entity.id}-spelling-strategy`,
      localizedLabel: game.i18n.localize("wg.generator.spellingStrategy.label"),
      strategyOptions: this.spellingStrategyOptions,
      activeStrategyField: this.entity.spellingStrategy,
      strategyDefinitions: this.spellingStrategies,
    });

    // Drag and drop handler.
    this._dragDropHandler = new DragDropHandler({
      entityId: this.entity.id,
      entityDataType: WgGeneratorPresenter.entityDataType,
      receiverElementId: `${this.entity.id}-header`,
      draggableElementId: `${this.entity.id}-header`,
      dragOverClass: "wg-dragover",
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
          name: game.i18n.localize("wg.generator.delete"),
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
    
    html.find(`input#${id}-target-length-min`).change((data) => {
      this.entity.targetLengthMin.value = parseInt(this.getValueOrDefault(data, 3));
    });
    html.find(`input#${id}-target-length-max`).change((data) => {
      this.entity.targetLengthMax.value = parseInt(this.getValueOrDefault(data, 10));
    });
    html.find(`input#${id}-entropy`).change((data) => {
      let value = parseFloat(this.getValueOrDefault(data, 0));
      value = Math.max(Math.min(value, 1), 0);
      this.entity.entropy.value = value;
    });
    html.find(`input#${id}-entropy-start`).change((data) => {
      let value = parseFloat(this.getValueOrDefault(data, 0));
      value = Math.max(Math.min(value, 1), 0);
      this.entity.entropyStart.value = value;
    });
    html.find(`input#${id}-entropy-middle`).change((data) => {
      let value = parseFloat(this.getValueOrDefault(data, 0));
      value = Math.max(Math.min(value, 1), 0);
      this.entity.entropyMiddle.value = value;
    });
    html.find(`input#${id}-entropy-end`).change((data) => {
      let value = parseFloat(this.getValueOrDefault(data, 0));
      value = Math.max(Math.min(value, 1), 0);
      this.entity.entropyEnd.value = value;
    });
    html.find(`input#${id}-seed`).change((data) => {
      this.entity.seed.value = this.getValueOrDefault(data, "");
    });

    // Ending pick mode
    const idEndingPickMode = `${id}-ending-pick-mode`;
    html.find(`#${idEndingPickMode}`).change((data) => {
      this.entity.endingPickMode.value = $(data.target).val();
    });
    this.syncDropDownValue(html, idEndingPickMode, this.entity.endingPickMode.value);

    // Drag & drop
    this._dragDropHandler.activateListeners(html);

    // Children

    this.sampleSetStrategyPresenter.activateListeners(html);
    this.sequencingStrategyPresenter.activateListeners(html);
    this.spellingStrategyPresenter.activateListeners(html);
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
        game.i18n.localize("wg.generator.generationImpossible"),
      );

      return;
    }

    const generator = this.entity.toGenerator();
    const results = await generator.generate(count);

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
      localizedTitle: game.i18n.localize("wg.generator.create"),
      localizedInputLabel: game.i18n.localize("wg.generator.name"),
      value: this.entity.name.value,
      modal: true,
    });

    if (dialog.confirmed !== true) return;

    this.entity.name.value = dialog.input;
  }
}
