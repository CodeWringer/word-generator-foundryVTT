/**
 * Reduces sequences, eliminating duplicates and counting up occurrencies. 
 */
export default class SequenceReducer {
  /**
   * Returns a list of reduced sequences, based on the given sequences. 
   * @param {Array<Sequence>} sequences A list of sequences to reduce. 
   * @returns {Array<ReducedSequence>} A list of reduced sequences. 
   */
  reduce(sequences) {
    const reducedSequences = [];

    if (sequences.length === 0) return [];

    let previousSequence = sequences[0];
    for (let i = 1; i <= sequences.length; i++) {
      const sequence = i < sequences.length ? sequences[i] : undefined;

      const reduced = reducedSequences.find(it => it.chars === previousSequence.chars);
      if (reduced === undefined) {
        const newFollowing = sequence !== undefined ? new CountedSequence({
          chars: sequence.chars,
          frequency: 1,
        }) : undefined;

        reducedSequences.push(
          new ReducedSequence({
            chars: previousSequence.chars,
            frequencyStart: previousSequence.isBeginning === true ? 1 : 0,
            frequencyMiddle: previousSequence.isMiddle === true ? 1 : 0,
            frequencyEnd: previousSequence.isEnding === true ? 1 : 0,
            frequency: 1,
            following: newFollowing !== undefined ? [newFollowing] : [],
          })
        );
      } else {
        if (previousSequence.isBeginning === true) {
          reduced.frequencyStart++;
        }
        if (previousSequence.isMiddle === true) {
          reduced.frequencyMiddle++;
        }
        if (previousSequence.isEnding === true) {
          reduced.frequencyEnd++;
        }
        reduced.frequency++;

        const followingOfReduced = reduced.following.find(it => it.chars === sequence.chars);
        if (followingOfReduced === undefined && sequence !== undefined) {
          const newFollowing = new CountedSequence({
            chars: sequence.chars,
            frequency: 1,
          });
          reduced.following.push(newFollowing);
        } else {
          followingOfReduced.frequency++;
        }
      }

      previousSequence = sequence;
    }

    return reducedSequences;
  }
}

/**
 * @property {String} chars
 * @property {Number} frequencyStart
 * @property {Number} frequencyMiddle
 * @property {Number} frequencyEnd
 * @property {Number} frequency
 * @property {Array<CountedSequence>} following
 */
export class ReducedSequence {
  constructor(args = {}) {
    this.chars = args.chars;
    this.frequencyStart = args.frequencyStart;
    this.frequencyMiddle = args.frequencyMiddle;
    this.frequencyEnd = args.frequencyEnd;
    this.frequency = args.frequency;
    this.following = args.following ?? [];
  }
}

/**
 * @property {String} chars
 * @property {Number} frequency
 */
export class CountedSequence {
  constructor(args = {}) {
    this.chars = args.chars;
    this.frequency = args.frequency;
  }
}
