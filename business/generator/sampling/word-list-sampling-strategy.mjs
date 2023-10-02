import ObservableField from "../../../common/observables/observable-field.mjs";
import AbstractEntityPresenter from "../../../presentation/abstract-entity-presenter.mjs";
import DialogUtility from "../../../presentation/util/dialog-utility.mjs";
import AbstractStrategyDefinition from "../common/abstract-strategy-definition.mjs";
import AbstractSamplingStrategy from "./abstract-sampling-strategy.mjs";

/**
 * Defines a `WordListSamplingStrategy`. 
 * 
 * @extends AbstractStrategyDefinition
 */
export class WordListSamplingStrategyDefinition extends AbstractStrategyDefinition {
  /** @override */
  get id() { return "WordListSamplingStrategy" }

  /** @override */
  get localizedName() { return game.i18n.localize("wg.generator.samplingStrategies.wordList"); }
  
  /** @override */
  newInstance(settings) {
    return new WordListSamplingStrategy(settings);
  }
}

/**
 * This sampling strategy provides a list of words. 
 * 
 * @property {ObservableField<String>} separator This separator is used to determine word boundaries. 
 * @property {ObservableField<String>} sampleSet The samples. 
 * 
 * @extends AbstractSamplingStrategy
 */
export class WordListSamplingStrategy extends AbstractSamplingStrategy {
  /** @override */
  static fromDto(dto) {
    return new WordListSamplingStrategy({
      separator: dto.separator,
      sampleSet: dto.sampleSet,
    });
  }

  /** @override */
  get id() { return new WordListSamplingStrategyDefinition().id; }

  /** @override */
  get settingsPresenter() { return this._settingsPresenter; }

  /** @override */
  get localizedInfoText() { return game.i18n.localize("wg.generator.sampleSet.infoHint"); }

  /**
   * @param {Object} args
   * @param {Application | undefined} args.application The parent application. 
   * * For pass-through to the presenter. 
   * @param {String | undefined} args.separator The separator sequence that is used to  
   * determine word boundaries. 
   * * default `","`
   * @param {String | undefined} args.sampleSet The samples. 
   */
  constructor(args = {}) {
    super();

    this.separator = new ObservableField({ value: args.separator ?? "," });
    this.sampleSet = new ObservableField({ value: args.sampleSet ?? "" });

    this._settingsPresenter = new WordListSamplingStrategySettingsPresenter({
      application: args.application,
      entity: this,
    });
  }

  /** @override */
  toDto() {
    return {
      definitionId: new WordListSamplingStrategyDefinition().id,
      settings: {
        separator: this.separator.value,
        sampleSet: this.sampleSet.value,
      },
    }
  }
  
  /** @override */
  async getSamples() {
    return this.sampleSet.value.split(this.separator.value);
  }
}

/**
 * Handles presentation of a `WordListSamplingStrategy`'s settings. 
 * 
 * @property {String} template Returns the **HTML literal** that represents the strategy's settings.  
 * * Read-only
 * @property {Application} application The parent application. 
 * @property {WordListSamplingStrategy} entity The represented strategy. 
 * 
 * @extends AbstractEntityPresenter
 */
export class WordListSamplingStrategySettingsPresenter extends AbstractEntityPresenter {
  /** @override */
  get template() {
    return `<label for="${this.entity.id}-separator">${game.i18n.localize("wg.generator.sampleSet.separator")}</label>
<input id="${this.entity.id}-separator" type="text" value="${this.entity.separator.value}" class="wg-light" />
<label for="${this.entity.id}-edit-samples">${game.i18n.localize("wg.generator.sampleSet.label")}</label>
<a class="wg-flex center row grow wg-border-box wg-light wg-margin-3" id="${this.entity.id}-edit-samples">
<div class="wg-flex wg-margin-r-3 center"><i class="fas fa-edit"></i></div>
<div class="wg-flex middle"><span>${game.i18n.localize("wg.generator.sampleSet.edit")}</span></div>
</a>`;
  }
  
  activateListeners(html) {
    html.find(`input#${this.entity.id}-separator`).change((data) => {
      this.entity.separator.value = this.getValueOrDefault(data, ",");
    });
    html.find(`a#${this.entity.id}-edit-samples`).click(async (event) => {
      const dialog = await new DialogUtility().showMultiInputDialog({
        localizedTitle: game.i18n.localize("wg.generator.sampleSet.edit"),
        localizedInputLabel: game.i18n.localize("wg.generator.sampleSet.label"),
        value: this.entity.sampleSet.value,
        modal: true,
      });

      if (dialog.confirmed !== true) return;

      this.entity.sampleSet.value = dialog.input;
    });
  }
}
