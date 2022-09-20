/**
 * @property {String} name Internal name of the setting. 
 * @property {String} localizableName A localizable string to display as the name of the setting. 
 * @property {StrategySettingValueTypes} valueType Indicates the data type of the value. 
 * @property {Any} value The current value. 
 * @property {Any} defaultValue On initialization, the default value to set. 
 */
export class StrategySetting {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.valueType = args.valueType;
    this.value = args.value;
    this.defaultValue = args.defaultValue;
  }
}

export const StrategySettingValueTypes = {
  STRING: 0,
  INTEGER: 1,
  FLOAT: 2,
  BOOLEAN: 3,
  OBJECT: 4,
}