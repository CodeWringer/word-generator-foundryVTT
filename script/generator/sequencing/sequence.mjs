/**
 * Represents a sequence of a sample. 
 * @property {String} chars The chars of the sequence. 
 * @property {Boolean} isBeginning Is true, if the sequence is 
 * at the beginning of its sample. 
 * @property {Boolean} isMiddle Is true, if the sequence is 
 * in the middle of its sample. 
 * @property {Boolean} isEnding Is true, if the sequence is 
 * at the end of its sample. 
 */
export default class Sequence {
  constructor(args = {}) {
    this.chars = args.chars;
    this.isBeginning = args.isBeginning;
    this.isMiddle = args.isMiddle;
    this.isEnding = args.isEnding;
  }
}
