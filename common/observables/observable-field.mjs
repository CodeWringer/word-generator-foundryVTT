import { EventEmitter } from "../event-emitter.mjs";

/**
 * Represents a field on an object, whose value changes can be observed/listened for. 
 * 
 * Wraps a single value. 
 * 
 * @property {any} value The wrapped value. 
 * 
 * @example
 * ```JS
  const field = new ObservableField({ value: 5 });
  field.onChange((field, oldValue, newValue) => {
    console.log(newValue);
  });
  field.value = 42;
 ```
 */
export default class ObservableField {
  /**
   * Event key for the "onChange" event. 
   * 
   * @static
   * @type {String}
   */
  static EVENT_ON_CHANGE = "fieldOnChange";

  /**
   * @type {any}
   * @private
   */
  _value = undefined;

  /**
   * @type {EventEmitter}
   * @private
   */
  _eventEmitter;

  /**
   * Returns the wrapped value. 
   * 
   * @type {any}
   */
  get value() {
    return this._value;
  }
  /**
   * Sets the wrapped value. 
   * 
   * @param {any} value The value to set. 
   */
  set value(value) {
    const oldValue = this._value;
    this._value = value;
    this._eventEmitter.emit(ObservableField.EVENT_ON_CHANGE, this, oldValue, value);
  }

  /**
   * @param {object} args 
   * @param {any} args.value An initial value to set. 
   */
  constructor(args = {}) {
    this._value = args.value;
    this._eventEmitter = new EventEmitter();
  }

  /**
   * Registers an event listener that is invoked whenever the value is changed. 
   * 
   * @param {Function} callback The callback function that is invoked whenever 
   * the value changes. 
   * * Receives the following arguments:
   * * * `field: ObservableField` - a reference to _this_ object. 
   * * * `oldValue: any`
   * * * `newValue: any`
   * 
   * @returns {String} An id to refer to the registered callback to. 
   */
  onChange(callback) {
    return this._eventEmitter.on(ObservableField.EVENT_ON_CHANGE, callback);
  }

  /**
   * Un-registers an event listener with the given id. 
   * 
   * @param {String | undefined} callbackId A callback ID to un-register or 
   * `undefined`, to un-register **all** callbacks. 
   */
  offChange(callbackId) {
    if (callbackId === undefined) {
      this._eventEmitter.allOff(ObservableField.EVENT_ON_CHANGE);
    } else {
      this._eventEmitter.off(callbackId);
    }
  }

  /**
   * Disposes of any working data. 
   */
  dispose() {
    this._eventEmitter.allOff();
  }

  /**
   * Silently sets the given value. That means no change listeners will be triggered. 
   * 
   * This method is to be used **very** carefully! It is intended for scenarios where 
   * invoking the change listeners may introduce unwanted side-effects or circular 
   * recursion. 
   * 
   * @param {any} value The value to set silently. 
  */
  setSilently(value) {
    this._value = value;
  }
}
