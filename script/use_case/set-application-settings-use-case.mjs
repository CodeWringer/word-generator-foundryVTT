import WordGeneratorApplicationDataSource from "../presentation/data/word-generator-application-datasource.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class SetApplicationSettingsUseCase extends AbstractUseCase {
  /**
   * @param {String} args.userId 
   * @param {WordGeneratorApplicationSettings} args.value 
   */
  invoke(args) {
    const ds = new WordGeneratorApplicationDataSource();
    return ds.set(args.userId, args.value);
  }
}