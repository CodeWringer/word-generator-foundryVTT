import GeneratorRepository from "../generator/data/generator-repository.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class LoadGeneratorsUseCase extends AbstractUseCase {
  invoke(userId) {
    const ds = new GeneratorRepository().dataSource;
    return ds.getAll(userId);
  }
}