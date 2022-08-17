import GeneratorRepository from "../generator/data/generator-repository.mjs";
import { SORTING_ORDERS } from "../presentation/sorting-orders.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class SortGeneratorsUseCase extends AbstractUseCase {
  /**
   * 
   * @param {String} args.userId
   * @param {SORTING_ORDERS} args.sortingOrder
   */
  invoke(args) {
    const ds = new GeneratorRepository().dataSource;
    
    const generators = ds.getAll(args.userId);

    const sorted = generators.map(it => it);
    if (args.sortingOrder === SORTING_ORDERS.DESC) {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    }
    return sorted;
  }
}