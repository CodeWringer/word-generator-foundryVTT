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
 *   parent: html.find("#my-dom-element-id"),
 *   text: game.i18n.localize("words.to.localize"),
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
 *   parent: html.find("#my-dom-element-id"),
 *   text: game.i18n.localize("words.to.localize"),
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
   * The text to display. 
   * @type {String}
   * @private
   */
  _text = "";
  get text() { return this._text; }
  set text(value) {
    this._text = value;
    this._element.text(value);
  }

  /**
   * Event handlers are added to remove the element again, when the cursor moves or any other input is made. 
   * @param {Object} args The arguments object. 
   * @param {JQuery} args.html Root element of the `FormApplication`. 
   * @param {JQuery} args.parent The element beneath which to show the info bubble. 
   * @param {String} args.text The text to show in the info bubble. 
   * @param {InfoBubbleAutoShowingTypes | undefined} args.autoShowType Defines if and when to automatically show the info bubble. 
   * * Default `InfoBubbleAutoShowingTypes.NONE`
   * @param {InfoBubbleAutoHidingTypes | undefined} args.autoHideType Defines if and when to automatically hide the info bubble. 
   * * Default `InfoBubbleAutoHidingTypes.NONE`
   * @param {Function | undefined} args.onShow Optional. A callback that is invoked every time the bubble is shown. 
   * @param {Function | undefined} args.onHide Optional. A callback that is invoked every time the bubble is hidden. 
   */
  constructor(args = {}) {
    this.html = args.html;
    this.parent = args.parent;
    this._text = args.text;

    this.autoShowType = args.autoShowType ?? InfoBubbleAutoShowingTypes.NONE;
    this.autoHideType = args.autoHideType ?? InfoBubbleAutoHidingTypes.NONE;

    this.onShow = args.onShow ?? (() => {});
    this.onHide = args.onHide ?? (() => {});

    this._element = $(this.html.add(`<span class="word-generator-info-bubble hidden">${this.text}</span>`)[1]);
    this.html.append(this._element);

    this._activateListeners();
  }

  /**
   * Manually shows the info bubble. 
   * 
   * Calling this method is not necessary, if an automatic show type other than `NONE` ist defined. 
   */
  show() {
    // Important: The hidden class must be removed first, as otherwise the element's width and height will 
    // show up as `0` in the calculations below. 
    this._element.removeClass("hidden");

    const parentPos = this.parent.position();
    const parentSize = { width: this.parent.outerWidth(), height: this.parent.outerHeight() };
    
    const bubbleSize = { width: this._element.outerWidth(), height: this._element.outerHeight() };

    const x = parentPos.left + (parentSize.width / 2) - (bubbleSize.width / 2);
    const y = parentPos.top - bubbleSize.height;

    this._element[0].style = `left: ${x}px; top: ${y}px;`;

    this.onShow();
  }

  /**
   * Hides the info bubble. 
   * 
   * Calling this method is not necessary, if an automatic hiding type other than `NONE` ist defined. 
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
    if (this.autoShowType === InfoBubbleAutoShowingTypes.MOUSE_ENTER) {
      this.parent.on(`mouseenter.${this._eventNameSpace}.${this._id}`, () => {
        this.show();
      });
    }

    if(this.autoHideType === InfoBubbleAutoHidingTypes.ANY_INPUT) {
      this.html.on(`mousemove.${this._eventNameSpace}.${this._id}`, () => {
        this.hide();
      });
      this.html.on(`keydown.${this._eventNameSpace}.${this._id}`, () => {
        this.hide();
      });
    } else if (this.autoHideType === InfoBubbleAutoHidingTypes.MOUSE_LEAVE) {
      this.parent.on(`mouseleave.${this._eventNameSpace}.${this._id}`, () => {
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
    this.parent.off(`mouseleave.${this._eventNameSpace}.${this._id}`);
    this.parent.off(`mouseenter.${this._eventNameSpace}.${this._id}`);
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