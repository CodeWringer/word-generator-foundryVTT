import MockGeneratorDataSource from "../generator/data/mock-generator-datasource.mjs";
import UserFlagGeneratorSettingsDataSource from "../generator/data/user-flag-datasource.mjs";
import { SORTING_ORDERS } from "../presentation/sorting-orders.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";
import LoadMockSettingUseCase from "./load-mock-setting-use-case.mjs";

export default class SortGeneratorsUseCase extends AbstractUseCase {
  /**
   * 
   * @param {String} args.userId
   * @param {SORTING_ORDERS} args.sortingOrder
   */
  invoke(args) {
    const mock = new LoadMockSettingUseCase().invoke();

    let ds = undefined;
    if (mock === true) {
      ds = new MockGeneratorDataSource();
    } else {
      ds = new UserFlagGeneratorSettingsDataSource();
    }
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