export default class SequenceProbabilityBuilder {3
  /**
   * Returns the probabilities of the given sequences. 
   * @param {Array<Array<Sequence>>} sequencesList 
   * @returns {SequenceProbabilities}
   */
  build(sequencesList) {
    const chainEntries = this._getAllChainsOfSet(sequencesList);
    const branches = this._getBranchesOf(chainEntries);
    const probableBranches = this._getProbabilitiesOf(branches); 

    const result = new SequenceProbabilities({
      all: probableBranches,
      starts: undefined, // TODO
      endings: undefined, // TODO
    });
    return result;
  }

  /**
   * Returns all chain entries to be found in the given sequences. 
   * @param {Array<Array<Sequence>>} sequencesList 
   * @returns {Array<SequenceChainEntry>}
   * @private
   */
  _getAllChainsOfSet(sequencesList) {
    const chainEntries = [];

    for (const sequences of sequencesList) {
      const chainEntriesOfSequences = this._getChainsOfSequences(sequences);
      this._mergeChains(chainEntries, chainEntriesOfSequences);
    }

    return chainEntries;
  }

  /**
   * Returns all chain entries to be found in the given sequences. 
   * @param {Array<Sequence>} sequences 
   * @returns {Array<SequenceChainEntry>}
   * @private
   */
  _getChainsOfSequences(sequences) {
    // Array<SequenceChainEntry>
    const chainEntries = [];

    for (let i = 0; i < sequences.length; i++) {
      const sequence = sequences[i];

      const followingSequence = (i + 1) < sequences.length ? sequences[i + 1] : undefined;
      if (followingSequence === undefined) continue;

      const existingEntry = chainEntries.find(it => 
          it.sequenceChars === sequence.chars
          && it.followingSequenceChars === followingSequence.chars);

      if (existingEntry !== undefined) {
        existingEntry.frequency++;
      } else {
        const newEntry = new SequenceChainEntry({
          sequenceChars: sequence.chars,
          followingSequenceChars: followingSequence.chars,
          frequency: 1,
        });
        chainEntries.push(newEntry);
      }
    }

    // TODO: This must return a new type which contains the starts and ends, as well. 
    return chainEntries;
  }

  /**
   * The given chain `b` is added onto the given chain `a`. 
   * 
   * That means every entry of `b` will be added to `a`, or if an identical entry 
   * already exists on `a`, its frequency will be incremented. 
   * @param {Array<SequenceChainEntry>} a 
   * @param {Array<SequenceChainEntry>} b 
   * @private
   */
  _mergeChains(a, b) {
    for (const entryOfB of b) {
      const entryOfA = a.find(it => 
        it.sequenceChars === entryOfB.sequenceChars 
        && it.followingSequenceChars === entryOfB.followingSequenceChars);

      if (entryOfA !== undefined) {
        entryOfA.frequency++;
      } else {
        a.push(entryOfB);
      }
    }
  }

  /**
   * 
   * @param {Array<SequenceChainEntry>} chainEntries 
   * @returns {Array<SequenceBranch>}
   * @private
   */
  _getBranchesOf(chainEntries) {
    const branches = []; // Array<SequenceBranch>

    for (const chainEntry of chainEntries) {
      const existingBranch = branches.find(it => it.sequenceChars === chainEntry.sequenceChars);

      if (existingBranch === undefined) {
        const newCountedSequence = new CountedSequence({
          sequenceChars: chainEntry.followingSequenceChars,
          frequency: chainEntry.frequency,
        });
        const newBranch = new SequenceBranch({
          sequenceChars: chainEntry.sequenceChars,
          branches: [newCountedSequence],
          frequency: 1,
        });
        branches.push(newBranch);
      } else {
        const existingCountedSequence = existingBranch.branches.find(it => it.sequenceChars === chainEntry.followingSequenceChars);
        if (existingCountedSequence === undefined) {
          const newCountedSequence = new CountedSequence({
            sequenceChars: chainEntry.followingSequenceChars,
            frequency: chainEntry.frequency,
          });
          existingBranch.branches.push(newCountedSequence);
        } else {
          // Logically, this else-branch shouldn't be reachable. 
          // But in case it *is* reachable, tallying up the 
          // frequencies *should* be a safe operation. 
          existingCountedSequence.frequency += chainEntry.frequency;
        }

        existingBranch.frequency++;
      }
    }

    return branches;
  }

  /**
   * Adds the stacked probabilities to the given branches. 
   * 
   * @description
   * Stacked probabilities means, the branches are first sorted by their probability 
   * and then their probabilities are aggregated, so each following branch has their 
   * predecessor's probability + their own. 
   * 
   * E. g.: 
   * ```
   * Sequence:    |  a  |  b  |  c  |  d  |
   *              | --- | --- | --- | --- |
   * Frequency:   |  3  |  2  |  2  |  1  | total: 8
   * Probability: |0.375|0.625|0.875|1.000| 
   * ```
   * @param {Array<SequenceBranch>} sequenceBranches 
   * @returns {Array<ProbableSequenceBranch>}
   * @private
   */
  _getProbabilitiesOf(sequenceBranches) {
    const probableBranches = [];

    // Tally up total frequency of sequence branches. 
    let frequencyStarts = 0;
    for (const sequenceBranch of sequenceBranches) {
      frequencyStarts += sequenceBranch.frequency;
    }
    
    // Create probable sequence branches now. 
    for (const sequenceBranch of sequenceBranches) {
      const newProbableSequenceBranch = new ProbableSequenceBranch({
        sequenceChars: sequenceBranch.sequenceChars,
        branches: this._getProbableSequencesOf(sequenceBranch),
        frequency: sequenceBranch.frequency,
        probability: sequenceBranch.frequency / frequencyStarts,
      });
      probableBranches.push(newProbableSequenceBranch);
    }

    this._sortAndStack(probableBranches);
      
    return probableBranches;
  }

  /**
   * @param {SequenceBranch} sequenceBranch 
   * @returns {Array<ProbableSequence>}
   * @private
   */
  _getProbableSequencesOf(sequenceBranch) {
    const probableSequences = [];

    // Tally up total frequency of counted sequences. 
    let totalFrequency = 0;
    for (const countedSequence of sequenceBranch.branches) {
      totalFrequency += countedSequence.frequency;
    }
    
    // Create probable sequences. 
    for (const countedSequence of sequenceBranch.branches) {
      const newProbableSequence = new ProbableSequence({
        sequenceChars: countedSequence.sequenceChars,
        frequency: countedSequence.frequency,
        probability: countedSequence.frequency / totalFrequency,
      });
      probableSequences.push(newProbableSequence);
    }

    this._sortAndStack(probableSequences);

    return probableSequences;
  }

  /**
   * 
   * @param {Array<ProbableSequenceBranch> | Array<ProbableSequence>} arr 
   */
  _sortAndStack(arrayOfProbabilities) {
    // Order by absolute probability. 
    arrayOfProbabilities.sort((a, b) => { a.probability > b.probability ? 1 : -1 });

    // Stack probabilities. 
    let previousProbability = 0;
    for (const entry of arrayOfProbabilities) {
      const newProbability = previousProbability + entry.probability;
      entry.probability = newProbability;
      previousProbability = newProbability;
    }

    if (arrayOfProbabilities.length > 0) {
      // This pre-empts any floating-point inaccuracies.
      arrayOfProbabilities[arrayOfProbabilities.length - 1].probability = 1.0;
    }
  }
}

/**
 * @property {String} sequenceChars
 * @property {String} followingSequenceChars
 * @property {Number} frequency
 */
export class SequenceChainEntry {
  constructor(args = {}) {
    this.sequenceChars = args.sequenceChars;
    this.followingSequenceChars = args.followingSequenceChars;
    this.frequency = args.frequency;
  }
}

/**
 * @property {String} sequenceChars
 * @property {Array<CountedSequence>} branches
 * @property {Number} frequency
 */
export class SequenceBranch {
  constructor(args = {}) {
    this.sequenceChars = args.sequenceChars;
    this.branches = args.branches;
    this.frequency = args.frequency;
  }
}

/**
 * @property {String} sequenceChars
 * @property {Number} frequency
 */
export class CountedSequence {
  constructor(args = {}) {
    this.sequenceChars = args.sequenceChars;
    this.frequency = args.frequency;
  }
}

/**
 * @property {String} sequenceChars
 * @property {Array<ProbableSequence>} branches
 * @property {Number} frequency
 * @property {Number} probability
 */
export class ProbableSequenceBranch {
  constructor(args = {}) {
    this.sequenceChars = args.sequenceChars;
    this.branches = args.branches;
    this.frequency = args.frequency;
    this.probability = args.probability;
  }
}

/**
 * @property {String} sequenceChars
 * @property {Number} frequency
 * @property {Number} probability
 */
export class ProbableSequence {
  constructor(args = {}) {
    this.sequenceChars = args.sequenceChars;
    this.frequency = args.frequency;
    this.probability = args.probability;
  }
}

/**
 * @property {Array<ProbableSequenceBranch>} all
 * @property {Array<ProbableSequenceBranch>} starts
 * @property {Array<ProbableSequenceBranch>} endings
 */
export class SequenceProbabilities {
  constructor(args = {}) {
    this.all = args.all;
    this.starts = args.starts;
    this.endings = args.endings;
  }
}

/*
Bob
Bobby
Steve
Abigail
Abe
Albert

Depth: 1

=== _getAllChainsOfSet: Chains
--
b -> {o, 1}
o -> {b, 1}
--
b -> {o, 2}
o -> {b, 2}
b -> {b, 1}
b -> {y, 1}
--
b -> {o, 2}
o -> {b, 2}
b -> {b, 1}
b -> {y, 1}
s -> {t, 1}
t -> {e, 1}
e -> {v, 1}
v -> {e, 1}
--
b -> {o, 2}
o -> {b, 2}
b -> {b, 1}
b -> {y, 1}
s -> {t, 1}
t -> {e, 1}
e -> {v, 1}
v -> {e, 1}
a -> {b, 1}
b -> {i, 1}
i -> {g, 1}
g -> {a, 1}
a -> {i, 1}
i -> {l, 1}
--
b -> {o, 2}
o -> {b, 2}
b -> {b, 1}
b -> {y, 1}
s -> {t, 1}
t -> {e, 1}
e -> {v, 1}
v -> {e, 1}
a -> {b, 2}
b -> {i, 1}
i -> {g, 1}
g -> {a, 1}
a -> {i, 1}
i -> {l, 1}
b -> {e, 1}
--
b -> {o, 2}
o -> {b, 2}
b -> {b, 1}
b -> {y, 1}
s -> {t, 1}
t -> {e, 1}
e -> {v, 1}
v -> {e, 1}
a -> {b, 2}
b -> {i, 1}
i -> {g, 1}
g -> {a, 1}
a -> {i, 1}
i -> {l, 1}
b -> {e, 2}
a -> {l, 1}
l -> {b, 1}
e -> {r, 1}
r -> {t, 1}

=== _getBranchesOf: Grouped chains with frequencies
b -> [{o, 2}, {b, 1}, {y, 1}, {i, 1}, {e, 2}]
o -> [{b, 2}]
s -> [{t, 1}]
t -> [{e, 1}]
e -> [{v, 1}, {r, 1}]
v -> [{e, 1}]
a -> [{b, 2}, {i, 1}, {l, 1}]
i -> [{g, 1}, {l, 1}]
g -> [{a, 1}]
l -> [{b, 1}]
r -> [{t, 1}]

=== _getProbabilitiesOf: Grouped chains with absolute probabilities
b -> [{o, 0.28}, {b, 0.14}, {y, 0.14}, {i, 0.14}, {e, 0.28}] // 7
o -> [{b, 1}]
s -> [{t, 1}]
t -> [{e, 1}]
e -> [{v, 0.5}, {r, 0.5}]
v -> [{e, 1}]
a -> [{b, 0.5}, {i, 0.25}, {l, 0.25}] // 4
i -> [{g, 0.5}, {l, 0.5}]
g -> [{a, 1}]
l -> [{b, 1}]
r -> [{t, 1}]

=== _getProbabilitiesOf: Grouped chains with stacked probabilities
b -> [{o, 0.28}, {e, 0.56}, {b, 0.7}, {y, 0.84}, {i, 1}]
o -> [{b, 1}]
s -> [{t, 1}]
t -> [{e, 1}]
e -> [{v, 0.5}, {r, 1}]
v -> [{e, 1}]
a -> [{b, 0.5}, {i, 0.75}, {l, 1}]
i -> [{g, 0.5}, {l, 1}]
g -> [{a, 1}]
l -> [{b, 1}]
r -> [{t, 1}]
*/
