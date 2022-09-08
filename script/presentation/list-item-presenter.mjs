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
      application._removeGenerator(id);
    });
    html.find(`#${id}-name`).change(() => {
      thiz.listItem.name = $(this).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-targetLengthMin`).change(() => {
      thiz.listItem.targetLengthMin = $(this).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-targetLengthMax`).change(() => {
      thiz.listItem.targetLengthMax = $(this).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-entropy`).change(() => {
      thiz.listItem.entropy = $(this).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-entropyStart`).change(() => {
      thiz.listItem.entropyStart = $(this).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-entropyMiddle`).change(() => {
      thiz.listItem.entropyMiddle = $(this).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-entropyEnd`).change(() => {
      thiz.listItem.entropyEnd = $(this).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-depth`).change(() => {
      thiz.listItem.depth = $(this).val();
      application._setGenerator(thiz.listItem);
    });

    // Drop-Downs
    html.find(`#${id}-endingPickMode`).change(() => {
      thiz.listItem.endingPickMode = $(this).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-sequencingStrategy`).change(() => {
      thiz.listItem.sequencingStrategy = $(this).val();
      application._setGenerator(thiz.listItem);
    });
    html.find(`#${id}-spellingStrategy`).change(() => {
      thiz.listItem.spellingStrategy = $(this).val();
      application._setGenerator(thiz.listItem);
    });

    // Generate
    html.find(`#${id}-generate`).click(() => {
      const generator = this.listItem.toGenerator();
      application._generate(generator);
    });
  }

  _syncDropDownValue(html, id) {
    const selectElement = html.find(`#${id}`);
    const optionElements = selectElement.find('option');
    const value = this.value;
    for(let i = 0; i < optionElements.length; i++) {
      const optionElement = optionElements[i];
      if (optionElement.value === value) {
        this.element[0].selectedIndex = i;
        break;
      }
    }
  }
}