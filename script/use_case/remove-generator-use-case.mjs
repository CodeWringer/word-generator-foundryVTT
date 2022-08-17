import GeneratorRepository from "../generator/data/generator-repository.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class RemoveGeneratorUseCase extends AbstractUseCase {
  /**
   * @param {String} args.userId
   * @param {String} args.generatorId
   */
  invoke(args) {
    const ds = new GeneratorRepository().dataSource;
    ds.remove(args.userId, args.generatorId);
  }
}