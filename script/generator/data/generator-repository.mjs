import LoadMockSettingUseCase from "../../use_case/load-mock-setting-use-case.mjs";
import MockGeneratorDataSource from "./mock-generator-datasource.mjs";
import UserFlagGeneratorSettingsDataSource from "./user-flag-generator-settings-datasource.mjs";

/**
 * Provides access to a generator data source implementation. 
 * 
 * If the user setting for mock is set, will return a mocked data source. 
 * @property {AbstractGeneratorDataSource} dataSource
 */
export default class GeneratorRepository {
  constructor() {
    const mock = new LoadMockSettingUseCase().invoke();

    if (mock === true) {
      this.dataSource = new MockGeneratorDataSource();
    } else {
      this.dataSource = new UserFlagGeneratorSettingsDataSource();
    }
  }
}