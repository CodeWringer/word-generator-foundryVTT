import WordGeneratorApplicationDataSource from "../presentation/data/word-generator-application-datasource.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class LoadApplicationSettingsUseCase extends AbstractUseCase {
  invoke(userId) {
    const ds = new WordGeneratorApplicationDataSource();
    return ds.get(userId);
  }
}