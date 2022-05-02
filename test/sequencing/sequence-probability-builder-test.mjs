import SequenceProbabilityBuilder from "../../script/generator/sequencing/sequence-probability-builder.mjs";
import Sequence from "../../script/generator/sequencing/sequence.mjs";

describe('SequenceProbabilityBuilder', function() {
  describe('build', function() {
    it('builds "bob" correctly', function() {
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
      built.all.length.should.be.equal(2);
      built.all[0].sequenceChars.should.be.equal("b");
      built.all[1].sequenceChars.should.be.equal("o");
      
      built.starts.length.should.be.equal(1);
      built.starts[0].sequenceChars.should.be.equal("b");
      
      built.endings.length.should.be.equal(1);
      built.endings[0].sequenceChars.should.be.equal("b");
    });
  });
});