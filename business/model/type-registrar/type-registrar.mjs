import AbstractStrategyDefinition from "../../generator/common/abstract-strategy-definition.mjs";

/**
 * Defines the basic contract with which to 'register' strategy definitions. 
 * Only accepts objects of type `AbstractStrategyDefinition`. 
 * 
 * Prevents registering the same type twice. 
 */
export default class TypeRegistrar {
  /**
   * The list of registered types. 
   * @type {Array<AbstractStrategyDefinition>}
   * @private
   */
  _registered = [];

  /**
   * Registers a given type definition, if it isn't already registered. 
   * 
   * @param {AbstractStrategyDefinition} type The 'definition' to register. 
   * 
   * @throws {Error} Thrown, in case the given type is already registered. 
   */
  register(type) {
    const existing = this._registered.find(it => it.id === type.id)
    
    if (existing !== undefined) {
      throw new Error(`The given type with id ${type.id} is already registered`);
    } else {
      this._registered.push(type);
    }
  }

  /**
   * Un-registers a given type definition, if it is registered. 
   * 
   * Returns true, if the type definition could be removed. 
   * 
   * @param {AbstractStrategyDefinition} type The 'definition' to un-register. 
   * 
   * @returns {Boolean} True, if the type definition could be removed. 
   */
  unregister(type) {
    const index = this._registered.findIndex(it => it.id === type.id);

    if (index >= 0) {
      this._registered.splice(index, 1);
    }
  }

  /**
   * Returns a registered type identified by the given ID or `undefined`, 
   * in case no type with the given ID is registered. 
   * 
   * @param {String} id ID of a type definition to return. 
   * 
   * @returns {AbstractStrategyDefinition | undefined} The definiton object or `undefined`.
   */
  get(id) {
    return this._registered.find(it => it.id === id);
  }

  /**
   * Returns all registered type definitions. 
   * 
   * @returns {Array<AbstractStrategyDefinition>} All registered type definitions. 
   */
  getAll() {
    return this._registered.concat([]); // Return a safe copy. 
  }

  /**
   * Returns a new instance of the type identified by the given ID. 
   * 
   * @param {String} id ID of a type definition to return. 
   * @param {Object} constructorArgs A parameter-object to pass to the `newInstance`-
   * method of the definition. 
   * 
   * @returns {Object} A new instance of the given registered type. 
   */
  newInstanceOf(id, constructorArgs) {
    const existing = this._registered.find(it => it.id === id)

    if (existing === undefined) {
      throw new Error(`No type with id ${id} registered`);
    }

    return existing.newInstance(constructorArgs);
  }
}
