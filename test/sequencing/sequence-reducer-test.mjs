import SequenceReducer from "../../script/generator/sequencing/sequence-reducer.mjs";
import Sequence from "../../script/generator/sequencing/sequence.mjs";

describe('SequenceReducer', function() {
  describe('reduce', function() {
    it('Produces expected results', function() {
      // Given
      const reducer = new SequenceReducer();
      const sequences = [
        new Sequence({
          chars: "bo",
          isBeginning: true,
          isMiddle: false,
          isEnding: false,
        }),
        new Sequence({
          chars: "bo",
          isBeginning: false,
          isMiddle: true,
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
      ];
      // When
      const reduced = reducer.reduce(sequences);
      // Then
      reduced.length.should.be.equal(3);

      reduced[0].chars.should.be.equal("bo");
      reduced[0].frequencyStart.should.be.equal(1);
      reduced[0].frequencyMiddle.should.be.equal(1);
      reduced[0].frequencyEnd.should.be.equal(0);
      reduced[0].frequency.should.be.equal(2);
      reduced[0].following.length.should.be.equal(2);
      
      reduced[1].chars.should.be.equal("bb");
      reduced[1].frequencyStart.should.be.equal(0);
      reduced[1].frequencyMiddle.should.be.equal(1);
      reduced[1].frequencyEnd.should.be.equal(0);
      reduced[1].frequency.should.be.equal(1);
      reduced[1].following.length.should.be.equal(1);
      
      reduced[2].chars.should.be.equal("y");
      reduced[2].frequencyStart.should.be.equal(0);
      reduced[2].frequencyMiddle.should.be.equal(0);
      reduced[2].frequencyEnd.should.be.equal(1);
      reduced[2].frequency.should.be.equal(1);
      reduced[2].following.length.should.be.equal(0);
    });
  });
});
