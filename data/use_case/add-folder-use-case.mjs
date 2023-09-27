import GeneratorRepository from "../generator/data/generator-repository.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class AddFolderUseCase extends AbstractUseCase {
  /**
   * @param {String} args.userId
   * @param {WordGeneratorFolder} args.data
   */
  invoke(args) {
    const ds = new GeneratorRepository().dataSource;
    ds.set(args.userId, args.data);
  }
}