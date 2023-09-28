import GeneratorRepository from "../generator/data/generator-repository.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class SetGeneratorsUseCase extends AbstractUseCase {
  /**
   * @param {String} args.userId
   * @param {Array<WordGeneratorItem>} args.generatorSettings
   */
  invoke(args) {
    const ds = new GeneratorRepository().dataSource;
    return ds.setAll(args.userId, args.generatorSettings);
  }
}