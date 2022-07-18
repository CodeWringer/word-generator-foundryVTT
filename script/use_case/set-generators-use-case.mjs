import MockGeneratorDataSource from "../generator/data/mock-generator-datasource.mjs";
import UserFlagGeneratorSettingsDataSource from "../generator/data/user-flag-datasource.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";
import LoadMockSettingUseCase from "./load-mock-setting-use-case.mjs";

export default class SetGeneratorsUseCase extends AbstractUseCase {
  /**
   * @param {String} args.userId
   * @param {Array<GeneratorSettings>} args.generatorSettings
   */
  invoke(args) {
    const mock = new LoadMockSettingUseCase().invoke();

    let ds = undefined;
    if (mock === true) {
      ds = new MockGeneratorDataSource();
    } else {
      ds = new UserFlagGeneratorSettingsDataSource();
    }
    return ds.setAll(args.userId, args.generatorSettings);
  }
}