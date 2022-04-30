import SequenceProbabilityBuilder from "../../script/generator/sequencing/sequence-probability-builder.mjs";
import { CountedSequence } from "../../script/generator/sequencing/sequence-reducer.mjs";
import { ReducedSequence } from "../../script/generator/sequencing/sequence-reducer.mjs";

describe('SequenceProbabilityBuilder', function() {
  describe('build', function() {
    it('Builds the expected probabilities', function() {
      // Given
      const builder = new SequenceProbabilityBuilder();
      const reducedSequences = [
        new ReducedSequence({
          chars: "bo",
          frequencyStart: 1,
          frequencyMiddle: 1,
          frequencyEnd: 0,
          frequency: 2,
          following: [
            new CountedSequence({
              chars: "bo",
              frequency: 1,
            }),
            new CountedSequence({
              chars: "bb",
              frequency: 1,
            }),
          ],
        }),
        new ReducedSequence({
          chars: "bb",
          frequencyStart: 0,
          frequencyMiddle: 1,
          frequencyEnd: 0,
          frequency: 1,
          following: [
            new CountedSequence({
              chars: "y",
              frequency: 1,
            }),
          ],
        }),
        new ReducedSequence({
          chars: "y",
          frequencyStart: 0,
          frequencyMiddle: 0,
          frequencyEnd: 1,
          frequency: 1,
          following: [],
        }),
      ]
      // When
      const probabilities = builder.build(reducedSequences);
      // Then
      // TODO
    });
  });
});
