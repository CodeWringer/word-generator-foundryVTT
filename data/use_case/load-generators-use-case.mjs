import GeneratorRepository from "../generator/data/generator-repository.mjs";
import WordGeneratorItem from "../generator/data/word-generator-settings.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class LoadGeneratorsUseCase extends AbstractUseCase {
  invoke(userId) {
    const ds = new GeneratorRepository().dataSource;
    const generatorSettings = ds.getAll(userId);
    return generatorSettings.map(it => WordGeneratorItem.fromObject(it));
  }
}