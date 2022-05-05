import SequenceConcatenator from "../../script/generator/concatenation/sequence-concatenator.mjs"
import { ENDING_PICK_MODES } from "../../script/generator/concatenation/sequence-concatenator.mjs";
import { ProbableSequence } from "../../script/generator/probability-building/sequence-probability-builder.mjs";
import { ProbableSequenceBranch } from "../../script/generator/probability-building/sequence-probability-builder.mjs";
import { SequenceProbabilities } from "../../script/generator/probability-building/sequence-probability-builder.mjs";

describe('SequenceConcatenator', function() {
  describe('generate', function() {
    const TEST_SEED = "Test";

    it('correctly generates "bob" with ending mode NONE', function() {
      // Given
      const probabilities = new SequenceProbabilities({
        branches: [
          new ProbableSequenceBranch({
            sequenceChars: "b",
            branches: [
              new ProbableSequence({
                sequenceChars: "o",
                frequency: 1,
                probability: 1,
              }),
            ],
            frequency: 1,
            probability: 1,
          }),
          new ProbableSequenceBranch({
            sequenceChars: "o",
            branches: [
              new ProbableSequence({
                sequenceChars: "b",
                frequency: 1,
                probability: 1,
              }),
            ],
            frequency: 1,
            probability: 1,
          }),
        ],
        starts: [
          new ProbableSequence({
            sequenceChars: "b",
            frequency: 1,
            probability: 1,
          }),
        ],
        endings: [
          new ProbableSequence({
            sequenceChars: "b",
            frequency: 1,
            probability: 1,
          }),
        ],
      });
      const concatenator = new SequenceConcatenator({
        probabilities: probabilities,
        entropy: 0.0,
        entropyStart: 0.0,
        entropyMiddle: 0.0,
        entropyEnd: 0.0,
        seed: TEST_SEED,
        endingPickMode: ENDING_PICK_MODES.NONE,
      });
      // When
      const word = concatenator.generate(3, 3);
      // Then
      word.should.be.equal("bob");
    });

    it('correctly generates "bob" with ending mode RANDOM', function() {
      // Given
      const probabilities = new SequenceProbabilities({
        branches: [
          new ProbableSequenceBranch({
            sequenceChars: "b",
            branches: [
              new ProbableSequence({
                sequenceChars: "o",
                frequency: 1,
                probability: 1,
              }),
            ],
            frequency: 1,
            probability: 1,
          }),
          new ProbableSequenceBranch({
            sequenceChars: "o",
            branches: [
              new ProbableSequence({
                sequenceChars: "b",
                frequency: 1,
                probability: 1,
              }),
            ],
            frequency: 1,
            probability: 1,
          }),
        ],
        starts: [
          new ProbableSequence({
            sequenceChars: "b",
            frequency: 1,
            probability: 1,
          }),
        ],
        endings: [
          new ProbableSequence({
            sequenceChars: "b",
            frequency: 1,
            probability: 1,
          }),
        ],
      });
      const concatenator = new SequenceConcatenator({
        probabilities: probabilities,
        entropy: 0.0,
        entropyStart: 0.0,
        entropyMiddle: 0.0,
        entropyEnd: 0.0,
        seed: TEST_SEED,
        endingPickMode: ENDING_PICK_MODES.RANDOM,
      });
      // When
      const word = concatenator.generate(3, 3);
      // Then
      word.should.be.equal("bob");
    });

    it('correctly generates "bob" with ending mode FOLLOW_BRANCH', function() {
      // Given
      const probabilities = new SequenceProbabilities({
        branches: [
          new ProbableSequenceBranch({
            sequenceChars: "b",
            branches: [
              new ProbableSequence({
                sequenceChars: "o",
                frequency: 1,
                probability: 1,
              }),
            ],
            frequency: 1,
            probability: 1,
          }),
          new ProbableSequenceBranch({
            sequenceChars: "o",
            branches: [
              new ProbableSequence({
                sequenceChars: "b",
                frequency: 1,
                probability: 1,
              }),
            ],
            frequency: 1,
            probability: 1,
          }),
        ],
        starts: [
          new ProbableSequence({
            sequenceChars: "b",
            frequency: 1,
            probability: 1,
          }),
        ],
        endings: [
          new ProbableSequence({
            sequenceChars: "b",
            frequency: 1,
            probability: 1,
          }),
        ],
      });
      const concatenator = new SequenceConcatenator({
        probabilities: probabilities,
        entropy: 0.0,
        entropyStart: 0.0,
        entropyMiddle: 0.0,
        entropyEnd: 0.0,
        seed: TEST_SEED,
        endingPickMode: ENDING_PICK_MODES.RANDOM,
      });
      // When
      const word = concatenator.generate(3, 3);
      // Then
      word.should.be.equal("bob");
    });
  });
});
