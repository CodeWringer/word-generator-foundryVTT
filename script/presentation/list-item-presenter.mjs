import * as DialogUtil from "../util/dialog-utility.mjs";
import WordGeneratorApplication from "./word-generator-application.mjs";

/**
 * This presenter handles a singular list item. 
 * 
 * It activates event listeners, sets initial states and performs other such presentation logic. 
 */
export class WordGeneratorListItemPresenter {
  /**
   * @param {WordGeneratorSettings} args.listItem The represented item. 
   * @param {Number} args.listIndex Index of this item in the list. 
   * @param {String} args.userId ID of the user that owns the list. 
   */
  constructor(args) {
    this.listItem = args.listItem;
    this.listIndex = args.listIndex;
    this.userId = args.userId;
  }

  /**
   * 
   * @param {HTMLElement} html 
   * @param {WordGeneratorApplication} application 
   */
  activateListeners(html, application) {
    const thiz = this;
    const id = this.listItem.id;

    html.find(`#${id}-delete`).click(() => {
      DialogUtil.showConfirmationDialog({
        localizableTitle: "wg.generator.confirmDeletion",
      }).then(result => {
        if (result.confirmed === true) {
          application._removeGenerator(id);
        }
      });
    });

    html.find(`#${id}-name`).change((data) => {
      thiz.listItem.name = $(data.target).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-targetLengthMin`).change((data) => {
      thiz.listItem.targetLengthMin = $(data.target).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-targetLengthMax`).change((data) => {
      thiz.listItem.targetLengthMax = $(data.target).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-entropy`).change((data) => {
      thiz.listItem.entropy = $(data.target).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-entropyStart`).change((data) => {
      thiz.listItem.entropyStart = $(data.target).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-entropyMiddle`).change((data) => {
      thiz.listItem.entropyMiddle = $(data.target).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-entropyEnd`).change((data) => {
      thiz.listItem.entropyEnd = $(data.target).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-depth`).change((data) => {
      thiz.listItem.depth = $(data.target).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-seed`).change((data) => {
      thiz.listItem.seed = $(data.target).val();
      application._setGenerator(thiz.listItem);
    });

    // Drop-Downs
    const idEndingPickMode = `${id}-endingPickMode`;
    html.find(`#${idEndingPickMode}`).change((data) => {
      thiz.listItem.endingPickMode = $(data.target).val();
      application._setGenerator(thiz.listItem);
    });
    this._syncDropDownValue(html, idEndingPickMode, this.listItem.endingPickMode);

    const idSequencingStrategy = `${id}-sequencingStrategy`;
    html.find(`#${idSequencingStrategy}`).change((data) => {
      const strategyId = $(data.target).val();
      thiz.listItem.sequencingStrategyId = strategyId;
      
      const strategyDefinition = WordGeneratorApplication.registeredSequencingStrategies.get(strategyId);
      thiz.listItem.sequencingStrategySettings = strategyDefinition.getSettings();

      application._setGenerator(thiz.listItem);
    });
    this._syncDropDownValue(html, idSequencingStrategy, this.listItem.sequencingStrategyId);

    const idSpellingStrategy = `${id}-spellingStrategy`;
    html.find(`#${idSpellingStrategy}`).change((data) => {
      const strategyId = $(data.target).val();
      thiz.listItem.spellingStrategyId = strategyId;

      const strategyDefinition = WordGeneratorApplication.registeredSpellingStrategies.get(strategyId);
      thiz.listItem.spellingStrategySettings = strategyDefinition.getSettings();

      application._setGenerator(thiz.listItem);
    });
    this._syncDropDownValue(html, idSpellingStrategy, this.listItem.spellingStrategyId);

    // Generate
    html.find(`#${id}-generate`).click(() => {
      const generator = this.listItem.toGenerator();
      application._generate(generator);
    });
  }

  /**
   * Ensures the current value is correctly reflected by the drop-down identified via the given id. 
   * @param {JQuery} html FormApplication root element. 
   * @param {String} id The id of the drop-down to synchronize. 
   * @param {Any} currentValue The current value of the field represented by the drop-down. 
   * 
   * @private
   */
  _syncDropDownValue(html, id, currentValue) {
    const selectElement = html.find(`#${id}`);
    const optionElements = selectElement.find('option');
    const currentValueAsString = "" + currentValue;
    for(let i = 0; i < optionElements.length; i++) {
      const optionElement = optionElements[i];
      if (optionElement.value == currentValueAsString) {
        selectElement[0].selectedIndex = i;
        break;
      }
    }
  }
}