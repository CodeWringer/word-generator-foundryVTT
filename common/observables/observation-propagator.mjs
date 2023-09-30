import { EventEmitter } from "../event-emitter.mjs";
import ObservableCollection from "./observable-collection.mjs";
import ObservableField from "./observable-field.mjs";

/**
 * Serves as an interface to objects that aren't observable, but which 
 * contain observables. 
 * 
 * Automatically creates an appropriate `onChange` and `offChange` method 
 * on the client object. 
 */
export default class ObservationPropagator {
  /**
   * Event key for the "onChange" event, invoked by propagated changes. 
   * 
   * @static
   * @type {String}
   */
  static EVENT_ON_CHANGE = "propagatedOnChange";

  /**
   * @type {EventEmitter}
   * @private
   */
  _eventEmitter;

  /**
   * @param {Object} client The client object which to make capable of propagating 
   * its observables' changes. 
   * @param {Array<ObservableField | ObservableCollection>} observables An array of 
   * observables whose changes will be propagated. 
   */
  constructor(client, observables = []) {
    this.client = client;

    this._eventEmitter = new EventEmitter();

    // Ensure the client has the required methods. 
    this.client.onChange = this.onChange.bind(this);
    this.client.offChange = this.offChange.bind(this);

    // Ensure changes are propagated. 
    for (const observable of observables) {
      observable.onChange((arg0, arg1, arg2, arg3, arg4) => {
        this._eventEmitter.emit(ObservationPropagator.EVENT_ON_CHANGE, arg0, arg1, arg2, arg3, arg4);
      });
    }
  }
  
  /**
   * Registers an event listener that is invoked whenever any of the data changes. 
   * 
   * @param {Function} callback 
   * 
   * @returns {String} ID of the listener. Can be used to un-register the listener with 
   * the `offChange` method. 
   */
  onChange(callback) {
    return this._eventEmitter.on(ObservationPropagator.EVENT_ON_CHANGE, callback);
  }

  /**
   * Un-registers an event listener with the given id. 
   * 
   * @param {String | undefined} callbackId A callback ID to un-register or 
   * `undefined`, to un-register **all** callbacks. 
   */
  offChange(callbackId) {
    if (callbackId === undefined) {
      this._eventEmitter.allOff(ObservationPropagator.EVENT_ON_CHANGE);
    } else {
      this._eventEmitter.off(callbackId);
    }
  }
}