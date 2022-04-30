/**
 * Builds a probability matrix for a given list of reduced sequences. 
 */
export default class SequenceProbabilityBuilder {
  /**
   * Builds and returns a probabilities for the given list of reduced sequences. 
   * @param {Array<ReducedSequence>} reducedSequences 
   * @returns {SequenceProbabilities}
   */
  build(reducedSequences) {
    const sequences = [];
    const starts = [];
    const middles = [];
    const endings = [];

    const reducedStarts = [];
    const reducedMiddles = [];
    const reducedEndings = [];

    let totalFrequency = 0;
    let totalStartsFrequency = 0;
    let totalMiddlesFrequency = 0;
    let totalEndingsFrequency = 0;

    // Count total frequency. 
    for (const reducedSequence of reducedSequences) {
      totalFrequency += reducedSequence.frequency;
    }

    // Get global sequence probabilities and tally up specific frequencies. 
    for (const reducedSequence of reducedSequences) {
      const globalProbableSequence = new ProbableSequence({
        chars: reducedSequence.chars,
        probability: reducedSequence.frequency / totalFrequency,
        following: this._getFollowingOf(reducedSequence),
      });
      sequences.push(globalProbableSequence);

      if (reducedSequence.frequencyStart > 0) {
        reducedStarts.push(reducedSequence);
        totalStartsFrequency += reducedSequence.frequencyStart;
      }
      if (reducedSequence.frequencyMiddle > 0) {
        reducedMiddles.push(reducedSequence);
        totalMiddlesFrequency += reducedSequence.frequencyMiddle;
      }
      if (reducedSequence.frequencyEnd > 0) {
        reducedEndings.push(reducedSequence);
        totalEndingsFrequency += reducedSequence.frequencyEnd;
      }
    }

    // Determine starting sequence probabilities. 
    for (const reducedSequence of reducedStarts) {
      const probableSequence = new ProbableSequence({
        chars: reducedSequence.chars,
        probability: reducedSequence.frequencyStart / totalStartsFrequency,
        following: this._getFollowingOf(reducedSequence),
      });
      starts.push(probableSequence);
    }

    // Determine middle sequence probabilities. 
    for (const reducedSequence of reducedMiddles) {
      const probableSequence = new ProbableSequence({
        chars: reducedSequence.chars,
        probability: reducedSequence.frequencyMiddle / totalMiddlesFrequency,
        following: this._getFollowingOf(reducedSequence),
      });
      middles.push(probableSequence);
    }

    // Determine ending sequence probabilities. 
    for (const reducedSequence of reducedEndings) {
      const probableSequence = new ProbableSequence({
        chars: reducedSequence.chars,
        probability: reducedSequence.frequencyEnd / totalEndingsFrequency,
        following: this._getFollowingOf(reducedSequence),
      });
      endings.push(probableSequence);
    }

    return new SequenceProbabilities({
      sequences: sequences,
      starts: starts,
      middles: middles,
      ends: endings,
    });
  }

  /**
   * 
   * @param {ReducedSequence | CountedSequence} reducedSequence 
   * @returns {Array<ProbableSequence>}
   */
  _getFollowingOf(reducedSequence) {
    const probableSequences = [];

    let totalFrequency = 0;
    for (const following of reducedSequence.following) {
      totalFrequency += following.frequency;
    }

    for (const following of reducedSequence.following) {
      const probableSequence = new ProbableSequence({
        chars: following.chars,
        probability: following.frequency / totalFrequency,
        following: this._getFollowingOf(following),
      });
      probableSequences.push(probableSequence);
    }

    // Sort by absolute probability. 
    probableSequences.sort((a, b) => { a.probability > b.probability ? 1 : -1 });

    // Enrich with weights. 
    let previousProbability = 0;
    for (const probableSequence of probableSequences) {
      const newProbability = previousProbability + probableSequence.probability;
      probableSequence.probability = newProbability;
      previousProbability = newProbability;
    }

    // Ending sequences don't have any following sequences. This check prevents 
    // an error being thrown for them. 
    if (probableSequences.length > 0) {
      // This pre-empts any floating-point inaccuracies. The last entry should 
      // always be at value 1.
      probableSequences[probableSequences.length - 1].probability = 1.0;
    }

    return probableSequences;
  }
}

/**
 * @summary
 * Represents the built probability chain of sequences. 
 * 
 * @description
 * The probabilities appear in order. E. g.
 * ```
 * Sequence:    |  a  |  b  |  c  |  d  |
 *              | --- | --- | --- | --- |
 * Frequency:   |  3  |  2  |  2  |  1  | total: 8
 * Probability: |0.375|0.625|0.875|1.000| 
 * ```
 * @property {Array<ProbableSequence>} sequences
 * @property {Array<ProbableSequence>} starts
 * @property {Array<ProbableSequence>} middles
 * @property {Array<ProbableSequence>} ends
 */
export class SequenceProbabilities {
  constructor(args = {}) {
    this.sequences = args.sequences;
    this.starts = args.starts;
    this.middles = args.middles;
    this.ends = args.ends;
  }
}

/**
 * Represents the likelihood of a character sequence and the sequences that follow it. 
 * @property {String} chars The characters represented by the sequence. 
 * @property {Number} probability A probability, between 0 and 1 (inclusive). 
 * @property {Array<ProbableSequence>} following A list of sequences that can follow this one. 
 */
export class ProbableSequence {
  constructor(args = {}) {
    this.chars = args.chars;
    this.probability = args.probability;
    this.following = args.following ?? [];
  }
}
