import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import MarkovChainWordGenerator from '../script/generator.mjs';
import BeginningCapitalsSpellingStrategy from '../script/beginning-capitals-strategy.mjs';

describe('MarkovChainWordGenerator', function() {
  const testSeed = "Test1234567890";

  describe('generate', function() {
    it('should generate 1 word without spelling strategy', function() {
      // Given
      const sampleSet = [
        "Bob",
        "Gobob",
        "Bobby",
      ];
      const depth = 2;
      const min = 3;
      const max = 4;
      const generator = new MarkovChainWordGenerator({
        sampleSet: sampleSet,
        depth: depth,
        targetLengthMin: min,
        targetLengthMax: max,
        seed: testSeed,
      });
      // When
      const generated = generator.generate(1);
      // Then
      generated.length.should.be.equal(1);
      generated[0].should.be.equal("bob");
    });

    it('should generate 3 words without spelling strategy', function() {
      // Given
      const sampleSet = [
        "Bob",
        "Gobob",
        "Bobby",
      ];
      const depth = 2;
      const min = 3;
      const max = 7;
      const generator = new MarkovChainWordGenerator({
        sampleSet: sampleSet,
        depth: depth,
        targetLengthMin: min,
        targetLengthMax: max,
        seed: testSeed,
      });
      // When
      const generated = generator.generate(3);
      // Then
      generated.length.should.be.equal(3);
      generated[0].should.be.equal("bobbb");
      generated[1].should.be.equal("gobob");
      generated[2].should.be.equal("goboy");
    });

    it('should generate 3 words with spelling strategy', function() {
      // Given
      const sampleSet = [
        "Bob",
        "Gobob",
        "Bobby",
      ];
      const depth = 2;
      const min = 3;
      const max = 7;
      const spellingStrategy = new BeginningCapitalsSpellingStrategy();
      const generator = new MarkovChainWordGenerator({
        sampleSet: sampleSet,
        depth: depth,
        targetLengthMin: min,
        targetLengthMax: max,
        seed: testSeed,
        spellingStrategy: spellingStrategy,
      });
      // When
      const generated = generator.generate(3);
      // Then
      generated.length.should.be.equal(3);
      generated[0].should.be.equal("Bobbb");
      generated[1].should.be.equal("Gobob");
      generated[2].should.be.equal("Goboy");
    });

    it('should generate 100 words with spelling strategy', function() {
      // Given
      const sampleSet = [
        "Cáîn",
        "Cáîs",
        "Crellin",
        "Crellis",
        "Czéllin",
        "Czéllis",
        "Czéczin",
        "Dódin",
        "Dódis",
        "Dódàrin",
        "Dànyin",
        "Dànyis",
        "Tarrin",
        "Tarkin",
        "Tarkis",
        "Terrin",
        "Terris",
        "Tzerin",
        "Tederin",
        "Tederis",
        "Teszederin",
      ];
      const depth = 2;
      const min = 4;
      const max = 10;
      const spellingStrategy = new BeginningCapitalsSpellingStrategy();
      const generator = new MarkovChainWordGenerator({
        sampleSet: sampleSet,
        depth: depth,
        targetLengthMin: min,
        targetLengthMax: max,
        seed: testSeed,
        spellingStrategy: spellingStrategy,
      });
      // When
      const generated = generator.generate(100);
      // Then
      generated.length.should.be.equal(100);
    });
  });

});
