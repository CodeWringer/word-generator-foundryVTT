import { DelimiterSequencingStrategy } from "../../../../business/generator/sequencing/delimiter-sequencing-strategy.mjs";
import RandomSeeded from "../../../../business/util/random-seed.mjs";

describe('DelimiterSequencingStrategy', function() {
  this.beforeAll(() => {
    globalThis.foundry = {
      utils: {
        randomID(length) {
          return new RandomSeeded("test").randomID(length);
        }
      }
    }
  });

  this.afterAll(() => {
    globalThis.foundry = undefined;
  });

  describe('getSequencesOfSample', function() {
    it('Correctly determines sequences of "Bob Steve Alice"', function() {
      // Given
      const strategy = new DelimiterSequencingStrategy({
        delimiter: " ",
        preserveCase: false,
      });
      const sample = "Bob Steve Alice";
      // When
      const sequences = strategy.getSequencesOfSample(sample);
      // Then
      sequences.length.should.be.equal(3);

      sequences[0].chars.should.containEql("bob");
      sequences[1].chars.should.containEql("steve");
      sequences[2].chars.should.containEql("alice");
  
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
  });
});
