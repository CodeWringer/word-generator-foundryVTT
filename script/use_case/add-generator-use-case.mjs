import GeneratorRepository from "../generator/data/generator-repository.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class AddGeneratorUseCase extends AbstractUseCase {
  /**
   * @param {String} args.userId
   * @param {WordGeneratorSettings} args.generatorSettings
   */
  invoke(args) {
    const ds = new GeneratorRepository().dataSource;
    ds.set(args.userId, args.generatorSettings);
  }
}