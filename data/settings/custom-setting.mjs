/**
 * Represents a known system-specific setting. 
 * @property {String} key An internal name by which to identify the setting. 
 * @property {String} name A localized name of the setting to display to a user. 
 * @property {SettingScopes} scope The scope that defines where the setting will be stored. 
 * @property {Boolean | undefined} config Optional. Whether the setting is shown in the configuration menu and 
 * can thus be changed by a user. 
 * * Default `false`. 
 * @property {Any | undefined} default Optional. The default value of the setting. 
 * @property {String} hint Optional. A localized hint to display to the user. 
 * @property {String | Boolean | Number | undefined} type Optional. The data type of the setting. 
 * * Default `String`. If `undefined`, will use default value, instead. 
 */
export default class CustomSetting {
  constructor(args = {})
  {
    this.key = args.key;
    this.name = args.name;
    this.hint = args.hint;
    this.scope = args.scope;
    this.config = args.config ?? false;
    this.default = args.default;
    this.type = args.type ?? String;
  }
}
