/**
 * Wraps the logic needed to implement an element that can be dragged and dropped 
 * onto other elements. 
 * 
 * @property {String} entityId ID of the draggable entity. 
 * @property {String} entityDataType Data type of the draggable entity. 
 * * Intended to make it easier for a target element to filter out drop events 
 * of unrecognized data types. 
 * @property {String} dragOverClass CSS class to automatically add to the element 
 * when something is dragged over it. 
 * @property {Function} dragStartHandler Callback that is invoked when the dragging of 
 * the element is begun. 
 * @property {Function} dragOverHandler Callback that is invoked when something is dragged 
 * over the represented element. 
 * @property {Function} dragLeaveHandler Callback that is invoked when the dragged thing 
 * is moved out of the represented element. 
 * @property {Function} dropHandler Callback that is invoked when the dragging of 
 * the element is begun. 
 */
export class DragDropHandler {
  /**
   * @type {String | undefined}
   * @static
   * @private
   */
  static _draggedEntityId;

  /**
   * @type {String | undefined}
   * @static
   * @private
   */
  static _draggedEntityType;

  /**
   * Returns the key to get/set the entity id with on the event. 
   * 
   * @type {String}
   * @readonly
   * @private
   */
  get keyEntityId() { return "entityid"; }

  /**
   * Returns the key to get/set the entity data type with on the event. 
   * 
   * @type {String}
   * @readonly
   * @private
   */
  get keyEntityDataType() { return "entitydatatype"; }

  /**
   * Returns the default css class that is added on drag over. 
   * 
   * @type {String}
   * @readonly
   */
  get defaultDragOverClass() { return "dragover"; }

  /**
   * @param {Object} args 
   * @param {String} args.entityId ID of the draggable entity. 
   * @param {String | undefined} args.entityDataType Data type of the draggable entity. 
   * * Intended to make it easier for a target element to filter out drop events 
   * of unrecognized data types. 
   * @param {Array<String> | undefined} args.acceptedDataTypes An array of the data types 
   * that the receiver element should accept. It will only receive the dragover css class 
   * and trigger the drop event, if the dragged over object is of an accepted type. 
   * @param {String | undefined} args.dragOverClass CSS class to automatically add to the element 
   * when something is dragged over it. 
   * @param {String | undefined} args.draggableElementId ID of the element that allows being dragged. 
   * * By default uses `entityId`. 
   * @param {String | undefined} args.receiverElementId ID of the element that allows receiving dragged elements. 
   * * By default uses `entityId`. 
   * @param {Function | undefined} args.dragStartHandler Callback that is invoked when the dragging of 
   * the element is begun. 
   * @param {Function | undefined} args.dragOverHandler Callback that is invoked when something is dragged 
   * over the represented element. 
   * @param {Function | undefined} args.dragLeaveHandler Callback that is invoked when the dragged thing 
   * is moved out of the represented element. 
   * @param {Function | undefined} args.dropHandler Callback that is invoked when the dragging of 
   * the element is begun. 
   */
  constructor(args = {}) {
    this.entityId = args.entityId;
    this.entityDataType = args.entityDataType;
    this.acceptedDataTypes = args.acceptedDataTypes ?? [];
    this._draggableElementId = args.draggableElementId ?? args.entityId;
    this._receiverElementId = args.receiverElementId ?? args.entityId;

    this.dragOverClass = args.dragOverClass ?? this.defaultDragOverClass;

    this._dragStartHandler = args.dragStartHandler ?? (() => {});
    this._dragOverHandler = args.dragOverHandler ?? (() => {});
    this._dragLeaveHandler = args.dragLeaveHandler ?? (() => {});
    this._dropHandler = args.dropHandler ?? (() => {});
  }
  
  /**
   * Registers any drag and drop interactivity on the element found with 
   * `this._elementId` on the given DOM. 
   * 
   * @param {JQuery} html 
   */
  activateListeners(html) {
    const draggableElement = html.find(`#${this._draggableElementId}`);
    const receiverElement = html.find(`#${this._receiverElementId}`);

    // Event handlers of a source element. 

    draggableElement.bind("dragstart", (event) => {
      DragDropHandler._draggedEntityId = this.entityId;
      DragDropHandler._draggedEntityType = this.entityDataType;

      this._dragStartHandler();
    });
    

    draggableElement.bind("dragend", (event) => {
      DragDropHandler._draggedEntityId = undefined;
      DragDropHandler._draggedEntityType = undefined;
    });
    
    // Event handlers of a target element. 

    receiverElement.bind("dragover", (event) => {
      const draggedEntityDataType = DragDropHandler._draggedEntityType;
      if (this._isAcceptedType(draggedEntityDataType) !== true) return;

      receiverElement.addClass(this.dragOverClass);
      this._dragOverHandler(event);
    });
    receiverElement.bind("dragleave", (event) => {
      receiverElement.removeClass(this.dragOverClass);
      this._dragLeaveHandler(event);
    });
    receiverElement.bind("drop", (event) => {
      event.preventDefault(); // Prevent effects of a normal click. 

      const draggedEntityDataType = DragDropHandler._draggedEntityType;

      if (this._isAcceptedType(draggedEntityDataType) === true) {
        this._dropHandler(DragDropHandler._draggedEntityId, draggedEntityDataType);
      }
      
      receiverElement.removeClass(this.dragOverClass);
      DragDropHandler._draggedEntityId = undefined;
      DragDropHandler._draggedEntityType = undefined;
    });
  }

  /**
   * Returns `true`, if the given type is accepted. 
   * 
   * @param {String} dataType 
   * 
   * @returns {Boolean} `true`, if the given type is accepted. 
   * 
   * @private
   */
  _isAcceptedType(dataType) {
    if (this.acceptedDataTypes.find(it => it == dataType) !== undefined) {
      return true;
    } else {
      return false;
    }
  }
}
