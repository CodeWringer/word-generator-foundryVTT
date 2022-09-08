import { TEMPLATES } from "./templates.mjs";

/**
 * Houses the presentation layer logic for the sample set of a generator. 
 * 
 * @example
 * ```
 * const myGeneratorSettings = new WordGeneratorSettings();
 * const myCloseCallback = (data) => { console.log(data.sampleSet); };
 * new WordGeneratorSamplesApplication(myGeneratorSettings, myCloseCallback).render(true);
 * ```
 * 
 * @property {WordGeneratorSettings} _generator 
 * @property {String} _sampleSet The joined sample set, as a single string. 
 * @property {String} _sampleSetSeparator The separator string, used to split samples. 
 * @property {Function<WordGeneratorSamplesApplicationResult> | undefined} _closeCallback Optional. A callback invoked upon closing 
 * the Application. Receives an instance of `WordGeneratorSamplesApplicationResult` as argument. 
 */
export default class WordGeneratorSamplesApplication extends Application {
  /** @override */
  static get defaultOptions() {
    const defaults = super.defaultOptions;
  
    const overrides = {
      height: 'auto',
      id: 'word-generator-application-sampleset',
      template: TEMPLATES.WORD_GENERATOR_SAMPLES_DIALOG,
      userId: game.userId,
      width: 300,
      height: 400,
      resizable: true,
      popOut: true,
      minimizable: false,
      classes: [
        "word-generator-modal"
      ],
    };
  
    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
    
    return mergedOptions;
  }

  /** @override */
  get title() { return game.i18n.localize("wg.generator.sampleSet.application.title").replace("%s", this._generator.name); }

  /**
   * @param {WordGeneratorSettings} generator
   * @param {Function<Boolean> | undefined} closeCallback Optional. A callback invoked upon closing 
   * the Application. Receives an instance of `WordGeneratorSamplesApplicationResult` as argument. 
   */
  constructor(generator, closeCallback) {
    super();

    this._generator = generator;
    this._sampleSet = generator.sampleSet.join(generator.sampleSetSeparator);
    this._sampleSetSeparator = generator.sampleSetSeparator;
    this._closeCallback = closeCallback ?? (() => {});
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // General event handling. 

    html.find(`#sampleSetSeparator`).change((data) => {
      this._updateFromUi(html);
    });
    html.find(`#sampleset`).change((data) => {
      this._updateFromUi(html);
    });

    html.find("#confirm").click(() => {
      this._confirmed = true;
      this._updateFromUi(html);
      this.close();
    });
    html.find("#cancel").click(() => {
      this._confirmed = false;
      this.close();
    });
  }
  
  /** @override */
  close() {
    this._closeCallback(new WordGeneratorSamplesApplicationResult({
      confirmed: this._confirmed,
      sampleSet: this._sampleSet,
      sampleSetSeparator: this._sampleSetSeparator,
    }));
    super.close();
  }

  /** @override */
  async getData(options) {
    return {
      sampleSet: this._sampleSet,
      sampleSetSeparator: this._sampleSetSeparator,
    }
  }

  /**
   * Gets the sample set from the DOM, splits the samples using the separator string and passes the 
   * result as an array to `this._generator`. 
   * 
   * @param {JQuery} html
   * 
   * @private
   */
  _updateFromUi(html) {
    const separator = html.find("#sampleSetSeparator").val();

    const raw = html.find("#sampleset").val();
    const splits = raw.split(separator);

    this._sampleSet = splits;
    this._sampleSetSeparator = separator;
  }
}

/**
 * @property {Boolean} confirmed
 * @property {Array<String>} sampleSet
 * @property {String} sampleSetSeparator
 */
export class WordGeneratorSamplesApplicationResult {
  /**
   * @param {Boolean} confirmed
   * @param {Array<String>} sampleSet
   * @param {String} sampleSetSeparator
   */
  constructor(args = {}) {
    this.confirmed = args.confirmed;
    this.sampleSet = args.sampleSet;
    this.sampleSetSeparator = args.sampleSetSeparator;
  }
}

window.WordGeneratorSamplesApplication = WordGeneratorSamplesApplication;
