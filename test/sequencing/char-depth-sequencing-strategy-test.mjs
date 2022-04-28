import CharDepthSequencingStrategy from "../../script/generator/sequencing/char-depth-sequencing-strategy.mjs"

describe('CharDepthSequencingStrategy', function() {
  describe('getSequencesOfSample', function() {
    it('Correctly determines sequences of "Bob" at depth 1', function() {
      // Given
      const strategy = new CharDepthSequencingStrategy(1);
      const sample = "Bob";
      // When
      const sequences = strategy.getSequencesOfSample(sample);
      // Then
      sequences.length.should.be.equal(3);

      sequences[0].chars.should.containEql("b");
      sequences[1].chars.should.containEql("o");
      sequences[2].chars.should.containEql("b");
  
      sequences[0].isBeginning.should.be.equal(true);
      sequences[0].isMiddle.should.be.equal(false);
      sequences[0].isEnding.should.be.equal(false);
  
      sequences[1].isBeginning.should.be.equal(false);
      sequences[1].isMiddle.should.be.equal(true);
      sequences[1].isEnding.should.be.equal(false);
  
      sequences[2].isBeginning.should.be.equal(false);
      sequences[2].isMiddle.should.be.equal(false);
      sequences[2].isEnding.should.be.equal(true);
    });

    it('Correctly determines sequences of "Bob" at depth 2', function() {
      // Given
      const strategy = new CharDepthSequencingStrategy(2);
      const sample = "Bob";
      // When
      const sequences = strategy.getSequencesOfSample(sample);
      // Then
      sequences.length.should.be.equal(2);

      sequences[0].chars.should.containEql("bo");
      sequences[1].chars.should.containEql("b");
  
      sequences[0].isBeginning.should.be.equal(true);
      sequences[0].isMiddle.should.be.equal(false);
      sequences[0].isEnding.should.be.equal(false);
  
      sequences[1].isBeginning.should.be.equal(false);
      sequences[1].isMiddle.should.be.equal(false);
      sequences[1].isEnding.should.be.equal(true);
    });
  });

  describe('getSequencesOfSet', function() {
    it('Correctly determines sequences of ["Bob", "Steve] at depth 1', function() {
      // Given
      const strategy = new CharDepthSequencingStrategy(1);
      const sampleSet = ["Bob", "Steve"];
      // When
      const sequences = strategy.getSequencesOfSet(sampleSet);
      // Then
      sequences.length.should.be.equal(8);

      sequences[0].chars.should.containEql("b");
      sequences[1].chars.should.containEql("o");
      sequences[2].chars.should.containEql("b");
      sequences[3].chars.should.containEql("s");
      sequences[4].chars.should.containEql("t");
      sequences[5].chars.should.containEql("e");
      sequences[6].chars.should.containEql("v");
      sequences[7].chars.should.containEql("e");
  
      sequences[0].isBeginning.should.be.equal(true);
      sequences[0].isMiddle.should.be.equal(false);
      sequences[0].isEnding.should.be.equal(false);
  
      sequences[1].isBeginning.should.be.equal(false);
      sequences[1].isMiddle.should.be.equal(true);
      sequences[1].isEnding.should.be.equal(false);
  
      sequences[2].isBeginning.should.be.equal(false);
      sequences[2].isMiddle.should.be.equal(false);
      sequences[2].isEnding.should.be.equal(true);
    });

    it('Correctly determines sequences of ["Bob", "Steve] at depth 2', function() {
      // Given
      const strategy = new CharDepthSequencingStrategy(2);
      const sampleSet = ["Bob", "Steve"];
      // When
      const sequences = strategy.getSequencesOfSet(sampleSet);
      // Then
      sequences.length.should.be.equal(5);

      sequences[0].chars.should.containEql("bo");
      sequences[1].chars.should.containEql("b");
      sequences[2].chars.should.containEql("st");
      sequences[3].chars.should.containEql("ev");
      sequences[4].chars.should.containEql("e");
  
      sequences[0].isBeginning.should.be.equal(true);
      sequences[0].isMiddle.should.be.equal(false);
      sequences[0].isEnding.should.be.equal(false);
  
      sequences[1].isBeginning.should.be.equal(false);
      sequences[1].isMiddle.should.be.equal(false);
      sequences[1].isEnding.should.be.equal(true);
  
      sequences[2].isBeginning.should.be.equal(true);
      sequences[2].isMiddle.should.be.equal(false);
      sequences[2].isEnding.should.be.equal(false);
  
      sequences[3].isBeginning.should.be.equal(false);
      sequences[3].isMiddle.should.be.equal(true);
      sequences[3].isEnding.should.be.equal(false);
  
      sequences[4].isBeginning.should.be.equal(false);
      sequences[4].isMiddle.should.be.equal(false);
      sequences[4].isEnding.should.be.equal(true);
    });
  });
});
