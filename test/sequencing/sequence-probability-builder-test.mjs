import SequenceProbabilityBuilder from "../../script/generator/sequencing/sequence-probability-builder.mjs";
import Sequence from "../../script/generator/sequencing/sequence.mjs";

describe('SequenceProbabilityBuilder', function() {
  describe('build', function() {
    it('builds probabilities for ["bob"] correctly', function() {
      // Given
      const sequencesList = [
        [
          new Sequence({
            chars: "b",
            isBeginning: true,
            isMiddle: false,
            isEnding: false,
          }),
          new Sequence({
            chars: "o",
            isBeginning: false,
            isMiddle: true,
            isEnding: false,
          }),
          new Sequence({
            chars: "b",
            isBeginning: false,
            isMiddle: false,
            isEnding: true,
          }),
        ]
      ];
      const builder = new SequenceProbabilityBuilder();
      // When
      const built = builder.build(sequencesList);
      // Then
      built.branches.length.should.be.equal(2);
      built.branches[0].sequenceChars.should.be.equal("b");
      built.branches[1].sequenceChars.should.be.equal("o");
      
      built.starts.length.should.be.equal(1);
      built.starts[0].sequenceChars.should.be.equal("b");
      
      built.endings.length.should.be.equal(1);
      built.endings[0].sequenceChars.should.be.equal("b");
    });

    it('builds probabilities for ["bobby", "bond", "bowley"] correctly', function() {
      // Given
      const sequencesList = [
        [
          new Sequence({
            chars: "bo",
            isBeginning: true,
            isMiddle: false,
            isEnding: false,
          }),
          new Sequence({
            chars: "bb",
            isBeginning: false,
            isMiddle: true,
            isEnding: false,
          }),
          new Sequence({
            chars: "y",
            isBeginning: false,
            isMiddle: false,
            isEnding: true,
          }),
        ],
        [
          new Sequence({
            chars: "bo",
            isBeginning: true,
            isMiddle: false,
            isEnding: false,
          }),
          new Sequence({
            chars: "nd",
            isBeginning: false,
            isMiddle: false,
            isEnding: true,
          }),
        ],
        [
          new Sequence({
            chars: "bo",
            isBeginning: true,
            isMiddle: false,
            isEnding: false,
          }),
          new Sequence({
            chars: "wl",
            isBeginning: false,
            isMiddle: true,
            isEnding: false,
          }),
          new Sequence({
            chars: "ey",
            isBeginning: false,
            isMiddle: false,
            isEnding: true,
          }),
        ]
      ];
      const builder = new SequenceProbabilityBuilder();
      // When
      const built = builder.build(sequencesList);
      // Then
      built.branches.length.should.be.equal(3);
      built.starts.length.should.be.equal(1);
      built.endings.length.should.be.equal(3);
    });
  });
});