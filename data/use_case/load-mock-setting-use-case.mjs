import CustomUserSettings from "../settings/custom-user-settings.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class LoadMockSettingUseCase extends AbstractUseCase {
  invoke(args) {
    const ds = new CustomUserSettings();
    return ds.get(CustomUserSettings.KEY_TOGGLE_MOCK);
  }
}