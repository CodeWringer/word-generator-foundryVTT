import { EventEmitter } from "../event-emitter.mjs";

/**
 * Represents the possible changes of a collection. 
 * 
 * @property {Number} ADD One or more elements were added. 
 * @property {Number} REMOVE One or more elements were removed. 
 * @property {Number} MOVE One or more elements were moved / re-ordered. 
 * @property {Number} REPLACE One or more elements were replaced. 
 * @property {Number} ELEMENT One or more elements' internal state changed. 
 * * This type is only valid for elements that implement a `onChange` method. 
 * 
 * @constant
 */
export const CollectionChangeTypes = {
  ADD: 0,
  REMOVE: 1,
  MOVE: 2,
  REPLACE: 3,
  ELEMENT: 4,
};

/**
 * Represents a collection/list whose data set changes can be observed/listened for. 
 * 
 * @property {Number} length Returns the current number of items in the collection. 
 * * Read-only
 * 
 * @example
 * ```JS
  const initialValues = [1, 2, 3];
  const observable = new ObservableCollection(initialValues);
  observable.onChange((collection, change, args) => {
    if (change === CollectionChangeTypes.ADD) {
      for (const element of args.elements) {
        console.log(element);
      }
    }
  });
  observable.add(42);
 ```
 */
export default class ObservableCollection {
  /**
   * Event key for the "onChange" event. 
   * 
   * @static
   * @type {String}
   */
  static EVENT_ON_CHANGE = "collectionOnChange";

  /**
   * A wrapped array instance. 
   * 
   * As a collection user DO **NOT** MODIFY THIS ARRAY DIRECTLY! 
   * Changes will not be trackable, if applied directly to this array. 
   * 
   * @type {Array<Any>}
   * @private
   */
  _array = [];

  /**
   * Internally handles the `onChange` event. 
   * 
   * @type {EventEmitter}
   * @private
   */
  _eventEmitter;

  /**
   * Maps elements to their `onChange` callback IDs. 
   * 
   * @type {Map<any, String>}
   * @private
   */
  _elementCallbackIds = new Map();

  /**
   * Returns the current number of elements in the collection. 
   * 
   * @type {number}
   * @readonly
   */
  get length() { return this._array.length; }

  /**
   * @param {Object} args 
   * @param {Array<Any> | undefined} args.elements An initial set of elements to 
   * add to the collection. 
   */
  constructor(args = {}) {
    // Ensure a safe-copy of the array. Using the given array reference would imply 
    // allowing this class to modify the given array, which would be unexpected behavior. 
    this._array = (args.elements ?? []).concat([]);
    this._eventEmitter = new EventEmitter();

    for (const element of this._array) {
      this._setOnChangeOnElementIfPossible(element);
    }
  }

  /**
   * Registers an event listener that is invoked whenever the value is changed. 
   * 
   * @param {Function | undefined} onChange Callback that is invoked whenever 
   * the data set changes in any way. 
   * * Receives the following arguments:
   * * * `collection: ObservableCollection` - a reference to _this_ object. 
   * * * `change: CollectionChangeTypes` - indicates the type of change.
   * * * `args: Object` - contains the data that was changed. 
   * * * * In case of `change === CollectionChangeTypes.ADD` -> `args: { elements: Array<Any>, index: Number }`
   * * * * In case of `change === CollectionChangeTypes.REMOVE` -> `args: { elements: Array<Any>, index: Number }`
   * * * * In case of `change === CollectionChangeTypes.MOVE` -> `args: { changes: Array<{ element: Any, oldIndex: Number, newIndex: Number }> }`
   * * * * In case of `change === CollectionChangeTypes.REPLACE` -> `args: { replaced: Any, replacedWith: Any, replacedIndex: Number }`
   * * * * In case of `change === CollectionChangeTypes.ELEMENT` -> `args: { field: ObservableField, oldValue: Any, newValue: Any }`
   * 
   * @returns {String} An id to refer to the registered callback to. 
   */
  onChange(callback) {
    return this._eventEmitter.on(ObservableCollection.EVENT_ON_CHANGE, callback);
  }

  /**
   * Un-registers an event listener with the given id. 
   * 
   * @param {String | undefined} callbackId A callback ID to un-register or 
   * `undefined`, to un-register **all** callbacks. 
   */
  offChange(callbackId) {
    if (callbackId === undefined) {
      this._eventEmitter.allOff(ObservableCollection.EVENT_ON_CHANGE);
    } else {
      this._eventEmitter.off(callbackId);
    }
  }

  /**
   * Returns the element at the given index. 
   * 
   * @param {Number} index The index of the element to get. 
   * 
   * @returns {Any | undefined} The element at the given index or `undefined`, 
   * if there is no element at the given index. 
   */
  get(index) {
    if (index < 0 || index > this._array.length - 1) {
      return undefined;
    } else {
      return this._array[index];
    }
  }

  /**
   * Returns the index of the given element, if possible. If the element could 
   * not be found, returns `-1`. 
   * 
   * @param {any} element The element whose index to return. 
   * 
   * @returns {Number} The index of the element or -1, if no element 
   * was found. 
   */
  indexOf(element) {
    return this._array.indexOf(element);
  }

  /**
   * Returns true, if the given element is contained.
   * 
   * @param {any} element The element to check for whether it is contained. 
   * 
   * @returns {Boolean} True, if the element is contained.
   */
  contains(element) {
    return this.indexOf(element) > -1;
  }

  /**
   * Returns the value of the first element in the array where predicate is true, 
   * and undefined otherwise.
   * 
   * @param {Function} predicate This is called once for each element of the array, 
   * in ascending order, until one is found where `predicate` returns true. If such an 
   * element is found, immediately returns that element value. Otherwise, 
   * returns undefined.
   * 
   * @returns {Array<Any>} 
   */
  find(predicate) {
    return this._array.find(predicate);
  }

  /**
   * Returns `true`, if any of the contained items fulfills the given `predicate`. 
   * Else, returns `false`. 
   * 
   * @param {Function} predicate called once for each element of the array, 
   * in ascending order, until one is found where `predicate` returns true. If such an 
   * element is found, immediately returns `true`. Otherwise, returns `false`.
   * 
   * @returns {Boolean} `true`, if any of the items fulfills the given `predicate`. 
   */
  any(predicate) {
    const r = this._array.find(predicate);
    return r !== undefined;
  }

  /**
   * Returns all elements as an array. 
   * 
   * Modifying the returned array **does not** modify the collection!
   * 
   * @returns {Array<Any>} A safe-copy of the collection's contents. 
   */
  getAll() {
    return this._array.concat([]);
  }

  /**
   * Adds the given element at the end of the collection.
   * 
   * Invokes event listeners with the following arguments:
   * * `collection: ObservableCollection`
   * * `change: CollectionChangeTypes.ADD`
   * * `args: { elements: Array<Any>, index: Number }`
   * 
   * @param {Any} element 
   * 
   * @returns {Boolean} `true`, if the object was added. Otherwise, `false`. 
   */
  add(element) {
    if (this.contains(element)) {
      return false;
    }

    const index = this._array.length;
    this._array.push(element);
    this._eventEmitter.emit(
      ObservableCollection.EVENT_ON_CHANGE, 
      this, 
      CollectionChangeTypes.ADD, 
      {
        elements: [element],
        index: index
      }
    );

    this._setOnChangeOnElementIfPossible(element);

    return true;
  }

  /**
   * Adds the given element at the given index. 
   * 
   * The given index is clamped to the collection's bounds. 
   * 
   * Invokes event listeners with the following arguments:
   * * `collection: ObservableCollection`
   * * `change: CollectionChangeTypes.ADD`
   * * `args: { elements: Array<Any>, index: Number }`
   * 
   * @param {number} index 
   * @param {any} element 
   * 
   * @returns {Boolean} `true`, if the object was added. Otherwise, `false`. 
   */
  addAt(index, element) {
    if (this.contains(element)) {
      return false;
    }

    const sanitizedIndex = Math.min(Math.max(index, 0), this._array.length);

    this._array.splice(sanitizedIndex, 0, element);

    this._eventEmitter.emit(
      ObservableCollection.EVENT_ON_CHANGE, 
      this, 
      {
        elements: [element],
        index: sanitizedIndex
      }
    );

    this._setOnChangeOnElementIfPossible(element);

    return true;
  }

  /**
   * Adds the given elements to the end of the collection.
   * 
   * Only adds new elements. Silently ignores any elements that the collection 
   * already contains! 
   * 
   * Invokes event listeners with the following arguments:
   * * `collection: ObservableCollection`
   * * `change: CollectionChangeTypes.ADD`
   * * `args: { elements: Array<Any>, index: Number }`
   * 
   * @param {Array<any>} elements 
   * 
   * @returns {Array<Any>} An array of the elements that were added. 
   */
  addAll(elements) {
    const index = this._array.length;

    const newElements = [];
    for (const element of elements) {
      if (this.contains(element)) continue;

      newElements.push(element);
    }
    this._array = this._array.concat(newElements);

    this._eventEmitter.emit(
      ObservableCollection.EVENT_ON_CHANGE, 
      this, 
      CollectionChangeTypes.ADD, 
      {
        elements: elements,
        index: index
      }
    );

    for (const element of elements) {
      this._setOnChangeOnElementIfPossible(element);
    }

    return newElements;
  }

  /**
   * Removes the given element. 
   * 
   * Invokes event listeners with the following arguments:
   * * `collection: ObservableCollection`
   * * `change: CollectionChangeTypes.REMOVE`
   * * `args: { elements: Array<Any>, index: Number }`
   * 
   * @param {any} element 
   * 
   * @returns {Boolean} `true`, if the object was removed. Otherwise, `false`. 
   */
  remove(element) {
    const index = this._array.indexOf(element);

    if (index < 0) {
      return false;
    }

    this._array.splice(index, 1);
    this._eventEmitter.emit(
      ObservableCollection.EVENT_ON_CHANGE, 
      this, 
      CollectionChangeTypes.REMOVE, 
      {
        elements: [element],
        index: index
      }
    );
   
    this._unsetOnChangeOnElementIfPossible(element);

    return true;
  }

  /**
   * Removes and returns the element at the given index. 
   * 
   * Invokes event listeners with the following arguments:
   * * `collection: ObservableCollection`
   * * `change: CollectionChangeTypes.REMOVE`
   * * `args: { elements: Array<Any>, index: Number }`
   * 
   * @param {Number} index 
   * 
   * @returns {Boolean} `true`, if the object was removed. Otherwise, `false`. 
   */
  removeAt(index) {
    if (index < 0 || index >= this._array.length) {
      return false;
    }

    const element = this._array.splice(index, 1)[0];
    this._eventEmitter.emit(
      ObservableCollection.EVENT_ON_CHANGE, 
      this, 
      CollectionChangeTypes.REMOVE, 
      {
        elements: [element],
        index: index
      }
    );
   
    this._unsetOnChangeOnElementIfPossible(element);

    return true;
  }

  /**
   * Removes all elements. 
   * 
   * Invokes event listeners with the following arguments:
   * * `collection: ObservableCollection`
   * * `change: CollectionChangeTypes.REMOVE`
   * * `args: { elements: Array<Any>, index: Number }`
   */
  clear() {
    const elements = this._array.concat([]);
    this._array = [];
    this._eventEmitter.emit(
      ObservableCollection.EVENT_ON_CHANGE, 
      this, 
      CollectionChangeTypes.REMOVE, 
      {
        elements: elements,
        index: 0
      }
    );
    
    for (const element of elements) {
      this._unsetOnChangeOnElementIfPossible(element);
    }
  }

  /**
   * Moves an element at the given index to the given index. 
   * 
   * Invokes event listeners with the following arguments:
   * * `collection: ObservableCollection`
   * * `change: CollectionChangeTypes.MOVE`
   * * `args: { changes: Array<{ element: Any, oldIndex: Number, newIndex: Number }> }`
   * 
   * @param {Number} fromIndex Index of the element to move. 
   * @param {Number} toIndex Index to move the element to.
   * 
   * @returns {Boolean} `true`, if the move was successful. Otherwise, `false`. 
   */
  move(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this._array.length) {
      return false;
    }

    // Ensure the new index remains bounded. 
    const newIndex = Math.max(Math.min(this._array.length, toIndex), 0);

    // "Move" the object by first removing and then re-inserting it at the desired index. 
    const element = this._array.splice(fromIndex, 1)[0];
    this._array.splice(newIndex, 0, element);

    this._eventEmitter.emit(
      ObservableCollection.EVENT_ON_CHANGE, 
      this, 
      CollectionChangeTypes.MOVE, 
      {
        changes: [
          {
            element: element,
            oldIndex: fromIndex,
            newIndex: newIndex
          }
        ],
      }
    );

    return true;
  }

  /**
   * Sorts the collection in place. 
   * 
   * Invokes event listeners with the following arguments:
   * * `collection: ObservableCollection`
   * * `change: CollectionChangeTypes.MOVE`
   * * `args: { changes: Array<{ element: Any, oldIndex: Number, newIndex: Number }> }`
   * 
   * @param {Function} sortFunc Function used to determine the order of the elements. 
   * It is expected to return a negative value if the first argument is less than 
   * the second argument, zero if they're equal, and a positive value otherwise. 
   * If omitted, the elements are sorted in ascending, ASCII character order.
   * ```JS
   * [11,2,22,1].sort((a, b) => a - b)
   * ```
   */
  sort(sortFunc) {
    const oldElements = this._array.concat([]);
    this._array.sort(sortFunc);
    const newElements = this._array.concat([]);

    const changes = [];
    for (let oldIndex = 0; oldIndex < oldElements.length; oldIndex++) {
      const element = oldElements[oldIndex];

      const newIndex = newElements.findIndex(it => it == element);

      changes.push({
        element: element,
        oldIndex: oldIndex,
        newIndex: newIndex
      });
    }

    this._eventEmitter.emit(
      ObservableCollection.EVENT_ON_CHANGE, 
      this, 
      CollectionChangeTypes.MOVE, 
      {
        changes: changes
      }
    );
  }

  /**
   * Attempts to replace the given element with the given element. 
   * 
   * Invokes event listeners with the following arguments:
   * * `collection: ObservableCollection`
   * * `change: CollectionChangeTypes.REPLACE`
   * * `args: { replaced: Any, replacedWith: Any, replacedIndex: Number }`
   * 
   * @param {Any} elementToReplace The element to replace. 
   * @param {Any} element The element to replace with. 
   * 
   * @returns {Boolean} `true`, if the replacement was successful. Otherwise, `false`. 
   */
  replace(elementToReplace, element) {
    const index = this._array.indexOf(elementToReplace);
    if (index < 0) {
      return false;
    } else if (this.contains(element) === true) {
      return false;
    }

    this._array.splice(index, 1);
    this._array.splice(index, 0, element);

    this._eventEmitter.emit(
      ObservableCollection.EVENT_ON_CHANGE, 
      this, 
      CollectionChangeTypes.REPLACE, 
      {
        replaced: elementToReplace,
        replacedWith: element,
        replacedIndex: index,
      }
    );
    this._unsetOnChangeOnElementIfPossible(elementToReplace);
    this._setOnChangeOnElementIfPossible(element);

    return true;
  }

  /**
   * Attempts to replace an element at the given index with the given element. 
   * 
   * Invokes event listeners with the following arguments:
   * * `collection: ObservableCollection`
   * * `change: CollectionChangeTypes.REPLACE`
   * * `args: { replaced: Any, replacedWith: Any, replacedIndex: Number }`
   * 
   * @param {Number} index Index of the element to replace. 
   * @param {Any} element The element to replace with. 
   * 
   * @returns {Boolean} `true`, if the replacement was successful. Otherwise, `false`. 
   */
  replaceAt(index, element) {
    if (index < 0 || index >= this._array.length) {
      return false;
    } else if (this.contains(element) === true) {
      return false;
    }

    const replaced = this._array.splice(index, 1)[0];
    this._array.splice(index, 0, element);

    this._eventEmitter.emit(
      ObservableCollection.EVENT_ON_CHANGE, 
      this, 
      CollectionChangeTypes.REPLACE, 
      {
        replaced: replaced,
        replacedWith: element,
        replacedIndex: index
      }
    );
    this._unsetOnChangeOnElementIfPossible(replaced);
    this._setOnChangeOnElementIfPossible(element);

    return true;
  }

  /**
   * Disposes of any working data. 
   */
  dispose() {
    this.clear();
    this._eventEmitter.allOff();
    this._elementCallbackIds.clear();
  }
  
  /**
   * Attaches a `onChange` callback to the given element, 
   * if it supports the method. 
   * 
   * @param {any} element 
   * 
   * @private
   */
  _setOnChangeOnElementIfPossible(element) {
    if (element.onChange === undefined) {
      return;
    }

    const thiz = this;
    const callbackId = element.onChange((field, oldValue, newValue) => {
      thiz._eventEmitter.emit(
        ObservableCollection.EVENT_ON_CHANGE, 
        CollectionChangeTypes.ELEMENT, 
        {
          field: field, 
          oldValue: oldValue, 
          newValue: newValue
        }
      );
    });
    this._elementCallbackIds.set(element, callbackId);
  }
  
  /**
   * Detaches the `onChange` callback of the given element, 
   * if it supports the method. 
   * 
   * @param {any} element 
   * 
   * @private
   */
  _unsetOnChangeOnElementIfPossible(element) {
    if (element.onChange === undefined) {
      return;
    }

    const callbackId = this._elementCallbackIds.get(element);
    if (callbackId !== undefined) {
      // In case the callback ID being undefined, avoid un-registering 
      // **all** callbacks, which is what would happen, if undefined 
      // were passed to the element's offChange method. 
      // 
      // After all, there may be other consumers of the element's 
      // onChange event which should remain unaffected. 
      element.offChange(callbackId);
    }
    this._elementCallbackIds.delete(element);
  }
}
