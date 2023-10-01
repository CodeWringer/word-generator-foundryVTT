/**
 * @property {String} name Internal name of the setting. 
 * @property {String} localizableName A localizable string to display as the name of the setting. 
 * @property {StrategySettingValueTypes} valueType Indicates the data type of the value. 
 * @property {Any} value The current value. 
 * @property {Any} defaultValue On initialization, the default value to set. 
 */
export class StrategySetting {
  /**
   * @param {Object} args
   * @param {String} args.name Internal name of the setting. 
   * @param {String} args.localizableName A localizable string to display as the name of the setting. 
   * @param {StrategySettingValueTypes} args.valueType Indicates the data type of the value. 
   * @param {Any} args.value The current value. 
   * @param {Any} args.defaultValue On initialization, the default value to set. 
   */
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.valueType = args.valueType;
    this.value = args.value;
    this.defaultValue = args.defaultValue;
  }
}

/**
 * Values to define the value type of a `StrategySetting`. 
 * 
 * @property {StrategySettingValueTypes} STRING
 * @property {StrategySettingValueTypes} INTEGER
 * @property {StrategySettingValueTypes} FLOAT
 * @property {StrategySettingValueTypes} BOOLEAN
 * @property {StrategySettingValueTypes} OBJECT
 */
export const StrategySettingValueTypes = {
  STRING: 0,
  INTEGER: 1,
  FLOAT: 2,
  BOOLEAN: 3,
  OBJECT: 4,
}