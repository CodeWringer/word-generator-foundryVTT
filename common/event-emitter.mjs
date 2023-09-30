/**
 * Internal listener representing object. 
 * 
 * @property {String} id ID of this listener. 
 * * Used for removing this listener. 
 * @property {Boolean} isOnce If true, will only ever be called once and then removed. 
 * @property {Function} callback The function to call when the associated event is emitted. 
 * 
 * @private
 */
class Listener {
  /**
  * @param {String} id ID of this listener. 
  * * Used for removing this listener. 
  * @param {Boolean} isOnce If true, will only ever be called once and then removed. 
  * @param {Function} callback The function to call when the associated event is emitted. 
   */
  constructor(id, isOnce, callback) {
    this.id = id;
    this.isOnce = isOnce;
    this.callback = callback;
  }
}

/**
 * A simple event emitter system, based on an event bus system. 
 */
export class EventEmitter {
  /**
   * A map of events and their respective listeners. 
   * 
   * @type {Map<String, Array<Listener>>}
   * @private
   */
  _events = new Map();

  /**
   * Registers the given callback to be called whenever the given event is emitted. 
   * 
   * @param {String} event The event to register to. 
   * @param {Function} callback A callback to call when the given event is emitted. 
   * 
   * @returns {String} An id to refer to the registered callback to. 
   */
  on(event, callback) {
    return this._on(event, false, callback);
  }
  
  /**
   * Registers the given callback to be called once, when the given event is emitted 
   * and then automatically un-registered. 
   * 
   * @param {String} event The event to register to. 
   * @param {Function} callback A callback to call when the given event is emitted. 
   * 
   * @returns {String} An id to refer to the registered callback to. 
   */
  once(event, callback) {
    return this._on(event, true, callback);
  }

  /**
   * Un-registers the given callback from the given event. 
   * 
   * @param {String} callbackId 
   */
  off(callbackId) {
    for (const [event, listeners] of this._events) {
      for (let i = 0; i < listeners.length; i++) {
        if (listeners[i].id === callbackId) {
          listeners.splice(i, 1);
          if (listeners.length === 0) {
            this._events.delete(event);
          }
          return;
        }
      }
    }
  }

  /**
   * Un-registers all callbacks from the given event. 
   * 
   * @param {String | undefined} event The event to un-register all listeners from. 
   * If left undefined, un-registers **all** listeners. 
   */
  allOff(event = undefined) {
    if (event === undefined) {
      this._events = new Map();
    } else {
      this._events.delete(event);
    }
  }

  /**
   * Emits the given event, with optional arguments. 
   * 
   * @param {String} event The event to emit. 
   * @param {Any} arguments Optional, additional arguments to pass to the callback. 
   * * Only supports up to 4 additional arguments!
   */
  emit(event) {
    const listeners = this._events.get(event);
    if (listeners === undefined) return;

    // Listeners that are only to be called once and then removed. 
    const toRemove = [];
    // Call every listener's callback. 
    for (const listener of listeners) {
      listener.callback(arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
      if (listener.isOnce === true) {
        // Remember this listener for removal. 
        toRemove.push(listener);
      }
    }

    // Remove now obsolete listeners. 
    for (const listener of toRemove) {
      this.off(listener.id);
    }
  }

  /**
   * Creates aliases for the methods of this object on a given object. 
   * So that calling `object.on()` will actually call _this_ event emitter's `on()`. 
   * 
   * @param {Object} object 
   */
  bind(object) {
    object.on = this.on.bind(this);
    object.once = this.once.bind(this);
    object.off = this.off.bind(this);
    object.allOff = this.allOff.bind(this);
    object.emit = this.emit.bind(this);
  }

  /**
   * Registers the given callback to be called whenever the given event is emitted. 
   * 
   * @param {String} event The event to register to. 
   * @param {Boolean} isOnce If true, will only ever be called once and then removed. 
   * @param {Function} callback A callback to call when the given event is emitted. 
   * 
   * @returns {String} An id to refer to the registered callback to. 
   * 
   * @private
   */
  _on(event, isOnce, callback) {
    // Get the existing list of listeners or create a new one. 
    const listeners = this._events.get(event) ?? [];

    // Create the listener. 
    const uuid = foundry.utils.randomID(16);
    const listener = new Listener(uuid, isOnce, callback);
    listeners.push(listener);
    
    // Update/Add entry on map. 
    this._events.set(event, listeners);

    return uuid;
  }
}