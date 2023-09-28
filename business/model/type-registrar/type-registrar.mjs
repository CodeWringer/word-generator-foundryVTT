/**
 * @summary
 * This abstract type defines the basic contract with which to 'register' certain types of classes, 
 * so that they may be fetched by ID. 
 * 
 * @description
 * Prevents registering the same type twice and **mandates** that objects to register implement these methods: 
 * * `getDefinitionID()` - must return a String. 
 * * `newInstanceWithArgs(args)` - must return a new instance of that type of definition. 
 * 
 * @abstract
 */
export default class TypeRegistrar {
  /**
   * The list of registered types. 
   * @type {Array<Object>}
   * @private
   */
  _registered = [];

  /**
   * Registers a given type definition, if it isn't already registered. 
   * 
   * @param {Object} type The 'definition' to register. 
   * 
   * @throws {Error} Thrown, in case the given type lacks a 'getDefinitionID' method definition. 
   * @throws {Error} Thrown, in case the given type is already registered. 
   */
  register(type) {
    if (type.getDefinitionID === undefined) {
      throw new Error("The given object lacks a 'getDefinitionID' method definition");
    }

    const existing = this._registered.find(it => it.getDefinitionID() === type.getDefinitionID())
    
    if (existing !== undefined) {
      throw new Error(`The given type with id ${type.getDefinitionID()} is already registered`);
    } else {
      this._registered.push(type);
    }
  }

  /**
   * Un-registers a given type definition, if it is registered. 
   * 
   * Returns true, if the type definition could be removed. 
   * 
   * @param {Object} type The 'definition' to un-register. 
   * 
   * @returns {Boolean} True, if the type definition could be removed. 
   * 
   * @throws {Error} Thrown, in case the given type lacks a 'getDefinitionID' method definition. 
   */
  unregister(type) {
    if (type.getDefinitionID === undefined) {
      throw new Error("The given object lacks a 'getDefinitionID' method definition");
    }

    const index = this._registered.findIndex(it => it.getDefinitionID() === type.getDefinitionID());

    if (index >= 0) {
      this._registered.splice(index, 1);
    }
  }

  /**
   * Returns a registered type identified by the given ID or `undefined`, in case no type with the given ID is registered. 
   * 
   * @param {String} id ID of a type definition to return. 
   * 
   * @returns {Object | undefined} The definiton object or `undefined`.
   */
  get(id) {
    return this._registered.find(it => it.getDefinitionID() === id);
  }

  /**
   * Returns all registered type definitions. 
   * 
   * @returns {Array<Object>} All registered type definitions. 
   */
  getAll() {
    return this._registered.concat([]); // Return a safe copy. 
  }

  /**
   * Returns a new instance of the type identified by the given ID. 
   * 
   * @param {String} id ID of a type definition to return. 
   * @param {Object} constructorArgs A parameter-object to pass to the `newInstanceWithArgs`-method of the definition. 
   * 
   * @returns {Object} A new instance of the given registered type. 
   */
  newInstanceOf(id, constructorArgs) {
    const existing = this._registered.find(it => it.getDefinitionID() === id)

    if (existing === undefined) {
      throw new Error(`No type with id ${id} registered`);
    }

    if (existing.newInstanceWithArgs === undefined) {
      throw new Error("The object lacks a 'newInstanceWithArgs' method definition");
    }
    
    return existing.newInstanceWithArgs(constructorArgs);
  }
}
