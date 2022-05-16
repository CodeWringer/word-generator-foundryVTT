import { ENDING_PICK_MODES } from "../concatenation/sequence-concatenator.mjs";
import AbstractGeneratorDataSource from "./abstract-generator-datasource.mjs";
import GeneratorSettings from "./generator-settings.mjs";
import { SPELLING_STRATEGIES } from "./generator-settings.mjs";
import { SEQUENCING_STRATEGIES } from "./generator-settings.mjs";

export default class MockGeneratorDataSource extends AbstractGeneratorDataSource {
  _list = [
    new GeneratorSettings({
      id: "abc-0123",
      name: "Simple Generator 1",
      sampleSet: [
        "Bob",
        "Bobby",
        "Bobette",
        "Billy",
        "Steve",
        "Alfred",
        "Albert",
        "Annie",
      ],
      targetLengthMin: 3,
      targetLengthMax: 7,
      sequencingStrategy: SEQUENCING_STRATEGIES.CHAR_DEPTH,
      spellingStrategy: SPELLING_STRATEGIES.CAPITALIZE_FIRST_LETTER,
      entropy: 0,
      entropyStart: 0.1,
      entropyMiddle: 0.2,
      entropyEnd: 0.3,
      endingPickMode: ENDING_PICK_MODES.FOLLOW_BRANCH,
    }),
    new GeneratorSettings({
      id: "abc-0124",
      name: "Simple Generator 2",
      sampleSet: [
        "Bob",
        "Bobby",
        "Billy",
        "Steve",
        "Albert",
        "Annie",
      ],
      targetLengthMin: 3,
      targetLengthMax: 10,
      sequencingStrategy: SEQUENCING_STRATEGIES.CHAR_DEPTH,
      spellingStrategy: SPELLING_STRATEGIES.CAPITALIZE_FIRST_LETTER,
      entropy: 0,
      entropyStart: 0.1,
      entropyMiddle: 0.2,
      entropyEnd: 0.3,
      endingPickMode: ENDING_PICK_MODES.FOLLOW_BRANCH,
    }),
  ];

  /** @override */
  async get(userId, id) {
    return this._list.find(it => it.id === id);
  }

  /** @override */
  async getAll(userId) {
    return this._list;
  }

  /** @override */
  async set(userId, id, generatorSettings) {
    const index = this._list.findIndex(it => it.id === id);
    if (index >= 0) {
      this._list.splice(index, 1, generatorSettings);
    } else {
      this._list.push(generatorSettings);
    }
  }

  /** @override */
  async remove(userId, id) {
    const index = this._list.findIndex(it => it.id === id);
    if (index >= 0) {
      this._list.splice(index, 1);
    }
  }

  /** @override */
  async clear(userId) {
    this._list = [];
  }
}