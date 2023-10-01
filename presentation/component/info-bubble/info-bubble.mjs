/**
 * Represents a floating "info bubble" to display to the user. 
 * 
 * @property {JQuery} html Root element of the `FormApplication`. 
 * @property {JQuery} parent The element beneath which to show the info bubble. 
 * @property {String} text The text to show in the info bubble. 
 * 
 * @property {InfoBubbleAutoShowingTypes} autoShowType Defines if and when to automatically show the info bubble. 
 * @property {InfoBubbleAutoHidingTypes} autoHideType Defines if and when to automatically hide the info bubble. 
 * 
 * @property {Function | undefined} onShow Optional. A callback that is invoked every time the bubble is shown. 
 * @property {Function | undefined} onHide Optional. A callback that is invoked every time the bubble is hidden. 
 * 
 * @example
 * ```Js
 * // Immediately shown with auto-removal on any input. 
 * const infoBubble = new InfoBubble({
 *   html: html,
 *   map: [
 *     { element: html.find("#my-dom-element-id"), text: game.i18n.localize("words.to.localize") }
 *   ],
 *   autoHideType: InfoBubbleAutoHidingTypes.ANY_INPUT,
 *   onHide: () => { infoBubble.remove(); },
 * });
 * infoBubble.show();
 * ```
 * 
 * @example
 * ```Js
 * // Automatic show and hide with infinite lifetime. 
 * new InfoBubble({
 *   html: html,
 *   map: [
 *     { element: html.find("#my-dom-element-id"), text: game.i18n.localize("words.to.localize") }
 *   ],
 *   autoShowType: InfoBubbleAutoHidingTypes.MOUSE_ENTER,
 *   autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
 * });
 * ```
 */
export default class InfoBubble {
  /**
   * The DOM element that represents the info bubble. 
   * @type {JQuery}
   * @private
   */
  _element = undefined;

  /**
   * The event name space with which to ensure the correct event listeners are removed, 
   * when the info bubble is removed. 
   * @type {String}
   * @private
   */
  _eventNameSpace = "wg-info-bubble";
  
  /**
   * A random id for use in event-linking, to ensure the correct event listeners are removed, 
   * when the info bubble is removed. 
   * @type {String}
   * @private
   */
  _id = foundry.utils.randomID(16);

  /**
   * Event handlers are added to remove the element again, when the cursor moves or any other input is made. 
   * @param {Object} args The arguments object. 
   * @param {JQuery} args.html Root element of the `FormApplication`. 
   * @param {Array<Object>} args.map A map of elements and the localized text to associate them with. 
   * Every element in this map will be eligible to show this info bubble. If `autoShowType` and 
   * `autoHideType` are set, this map defines the elements the info bubble will be automatically 
   * shown for. 
   * * Elements must have the following properties: 
   * * * `element: {JQuery}` - the element to associate the text with. 
   * * * `text: {String}` - the localized text to show. 
   * @param {InfoBubbleAutoShowingTypes | undefined} args.autoShowType Defines if and when to automatically show the info bubble. 
   * * Default `InfoBubbleAutoShowingTypes.NONE`
   * @param {InfoBubbleAutoHidingTypes | undefined} args.autoHideType Defines if and when to automatically hide the info bubble. 
   * * Default `InfoBubbleAutoHidingTypes.NONE`
   * @param {Function | undefined} args.onShow Optional. A callback that is invoked every time the bubble is shown. 
   * @param {Function | undefined} args.onHide Optional. A callback that is invoked every time the bubble is hidden. 
   */
  constructor(args = {}) {
    this.html = args.html;
    this.map = args.map ?? [];

    this.autoShowType = args.autoShowType ?? InfoBubbleAutoShowingTypes.NONE;
    this.autoHideType = args.autoHideType ?? InfoBubbleAutoHidingTypes.NONE;

    this.onShow = args.onShow ?? (() => {});
    this.onHide = args.onHide ?? (() => {});

    this._element = $(this.html.add(`<span class="wg-info-bubble hidden"></span>`)[1]);
    this.html.append(this._element);

    this._activateListeners();
  }

  /**
   * Manually shows the info bubble. 
   * 
   * Calling this method is not necessary, if an automatic show type other than `NONE` is defined. 
   * 
   * @param {JQuery} element The element for which to show the info bubble. 
   * @param {String} text The text to use. 
   */
  show(element, text) {
    this._element.text(text);
    
    // Important: The hidden class must be removed first, as otherwise the element's width and height will 
    // show up as `0` in the calculations below. 
    this._element.removeClass("hidden");

    const parentPos = element.position();
    const parentSize = { width: element.outerWidth(), height: element.outerHeight() };
    
    const bubbleSize = { width: this._element.outerWidth(), height: this._element.outerHeight() };

    const x = parentPos.left + (parentSize.width / 2) - (bubbleSize.width / 2);
    const y = parentPos.top - bubbleSize.height;

    this._element[0].style = `left: ${x}px; top: ${y}px;`;

    this.onShow();
  }

  /**
   * Hides the info bubble. 
   * 
   * Calling this method is not necessary, if an automatic hiding type other than `NONE` is defined. 
   */
  hide() {
    this._element.addClass("hidden");
    this.onHide();
  }

  /**
   * Removes the info bubble and de-activates its listeners. 
   */
  remove() {
    if (this._element !== undefined) {
      this._element.remove();
    }
    this._deactivateListeners();
  }

  /**
   * Activates event listeners. 
   * 
   * @private
   */
  _activateListeners() {
    for (const entry of this.map) {
      if (this.autoShowType === InfoBubbleAutoShowingTypes.MOUSE_ENTER) {
        entry.element.on(`mouseenter.${this._eventNameSpace}.${this._id}`, () => {
          this.show(entry.element, entry.text);
        });
      }
      if (this.autoHideType === InfoBubbleAutoHidingTypes.MOUSE_LEAVE) {
        entry.element.on(`mouseleave.${this._eventNameSpace}.${this._id}`, () => {
          this.hide();
        });
      } 
    }

    if(this.autoHideType === InfoBubbleAutoHidingTypes.ANY_INPUT) {
      this.html.on(`mousemove.${this._eventNameSpace}.${this._id}`, () => {
        this.hide();
      });
      this.html.on(`keydown.${this._eventNameSpace}.${this._id}`, () => {
        this.hide();
      });
    }
  }

  /**
   * De-activates event listeners. 
   * 
   * @private
   */
  _deactivateListeners() {
    this.html.off(`mousemove.${this._eventNameSpace}.${this._id}`);
    this.html.off(`keydown.${this._eventNameSpace}.${this._id}`);

    for (const entry of this.map) {
      entry.element.off(`mouseleave.${this._eventNameSpace}.${this._id}`);
      entry.element.off(`mouseenter.${this._eventNameSpace}.${this._id}`);
    }
  }
}

/**
 * These types define the info bubble's behavior, in regards to automatic self-showing. 
 * 
 * @property {Number} NONE The info bubble does not show itself automatically. 
 * In order to show it, call the `show` method. 
 * @property {Number} MOUSE_ENTER The info bubble is shown, when the mouse enters the parent DOM element. 
 */
export const InfoBubbleAutoShowingTypes = {
  NONE: 0,
  MOUSE_ENTER: 1,
}

/**
 * These types define the info bubble's behavior, in regards to automatic self-hiding. 
 * 
 * @property {Number} NONE The info bubble does not hide itself automatically. 
 * In order to hide it, call the `hide` method. 
 * @property {Number} ANY_INPUT The info bubble is hidden on *any* input made. 
 * That includes mouse movement and key strokes. 
 * @property {Number} MOUSE_LEAVE The info bubble is hidden only, when the mouse leaves the parent DOM element. 
 */
export const InfoBubbleAutoHidingTypes = {
  NONE: 0,
  ANY_INPUT: 1,
  MOUSE_LEAVE: 2,
}
