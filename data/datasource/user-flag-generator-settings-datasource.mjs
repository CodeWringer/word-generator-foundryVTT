import WordGeneratorItem from "../../business/generator/model/word-generator-item.mjs";

/**
 * Provides a means of storing `WordGeneratorItem` on user flags. 
 * 
 * @deprecated Deprecated in favor of `WordGeneratorApplicationDataDataSource`! This type is kept for migration purposes, but should no longer be used!
 */
export default class UserFlagGeneratorSettingsDataSource {
  static FLAG_SCOPE = "core";
  static KEY_FLAG = "word-generator-settings";

  /** @override */
  get(userId, id) {
    const user = game.users.get(userId);
    
    if (user === undefined) return undefined;

    const arr = user.getFlag(
      UserFlagGeneratorSettingsDataSource.FLAG_SCOPE,
      UserFlagGeneratorSettingsDataSource.KEY_FLAG
    ) ?? [];

    return WordGeneratorItem.fromDto(arr.find(it => it.id === id));
  }
  
  /** @override */
  getAll(userId) {
    const user = game.users.get(userId);
    
    if (user === undefined) return undefined;

    return (user.getFlag(
      UserFlagGeneratorSettingsDataSource.FLAG_SCOPE,
      UserFlagGeneratorSettingsDataSource.KEY_FLAG
    ) ?? []).map(it => WordGeneratorItem.fromDto(it));
  }
  
  /** @override */
  set(userId, generatorSetting) {
    const user = game.users.get(userId);

    if (user === undefined) return;

    const arr = user.getFlag(
      UserFlagGeneratorSettingsDataSource.FLAG_SCOPE,
      UserFlagGeneratorSettingsDataSource.KEY_FLAG
    ) ?? [];

    const objectifiedSettings = generatorSetting.toDto();
    const index = arr.findIndex(it => it.id === generatorSetting.id);
    if (index >= 0) {
      arr.splice(index, 1, objectifiedSettings);
    } else {
      arr.push(objectifiedSettings);
    }

    user.setFlag(
      UserFlagGeneratorSettingsDataSource.FLAG_SCOPE,
      UserFlagGeneratorSettingsDataSource.KEY_FLAG,
      arr
    );
  }

  /** @override */
  setAll(userId, generatorSettings) {
    const user = game.users.get(userId);

    if (user === undefined) return;

    user.setFlag(
      UserFlagGeneratorSettingsDataSource.FLAG_SCOPE,
      UserFlagGeneratorSettingsDataSource.KEY_FLAG,
      generatorSettings ?? []
    );
  }

  /** @override */
  remove(userId, id) {
    const user = game.users.get(userId);
    
    if (user === undefined) return undefined;

    const arr = user.getFlag(
      UserFlagGeneratorSettingsDataSource.FLAG_SCOPE,
      UserFlagGeneratorSettingsDataSource.KEY_FLAG
    ) ?? [];

    const index = arr.findIndex(it => it.id === id);
    if (index >= 0) {
      arr.splice(index, 1);
    }

    user.setFlag(
      UserFlagGeneratorSettingsDataSource.FLAG_SCOPE,
      UserFlagGeneratorSettingsDataSource.KEY_FLAG,
      arr
    );
  }
  
  /** @override */
  clear(userId) {
    const user = game.users.get(userId);
    
    if (user === undefined) return undefined;

    user.setFlag(
      UserFlagGeneratorSettingsDataSource.FLAG_SCOPE,
      UserFlagGeneratorSettingsDataSource.KEY_FLAG,
      []
    );
  }
}