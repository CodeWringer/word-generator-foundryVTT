import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import WordGenerator from '../business/generator/generator.mjs';
import { BeginningCapitalsSpellingStrategy } from '../business/generator/postprocessing/beginning-capitals-strategy.mjs';
import { CharDepthSequencingStrategy } from '../business/generator/sequencing/char-depth-sequencing-strategy.mjs';
import { ENDING_PICK_MODES } from '../business/generator/concatenation/sequence-concatenator.mjs';

describe('WordGenerator', function() {
  const testSeed = "Test1234567890";

  describe('generate', function() {
    it('should generate 1 word without spelling strategy', function() {
      // Given
      const sampleSet = [
        "Bob",
        "Gobob",
        "Bobby",
      ];
      const sequencingStrategy = new CharDepthSequencingStrategy(2);
      const min = 3;
      const max = 4;
      const generator = new WordGenerator({
        sampleSet: sampleSet,
        sequencingStrategy: sequencingStrategy,
        targetLengthMin: min,
        targetLengthMax: max,
        seed: testSeed,
        endingPickMode: ENDING_PICK_MODES.NONE,
      });
      // When
      const generated = generator.generate(1);
      // Then
      generated.length.should.be.equal(1);
    });

    it('should generate 3 words without spelling strategy', function() {
      // Given
      const sampleSet = [
        "Bob",
        "Gobob",
        "Bobby",
      ];
      const sequencingStrategy = new CharDepthSequencingStrategy(2);
      const min = 3;
      const max = 7;
      const generator = new WordGenerator({
        sampleSet: sampleSet,
        sequencingStrategy: sequencingStrategy,
        targetLengthMin: min,
        targetLengthMax: max,
        seed: testSeed,
        endingPickMode: ENDING_PICK_MODES.NONE,
      });
      // When
      const generated = generator.generate(3);
      // Then
      generated.length.should.be.equal(3);
    });

    it('should generate 3 words with spelling strategy', function() {
      // Given
      const sampleSet = [
        "Bob",
        "Gobob",
        "Bobby",
      ];
      const sequencingStrategy = new CharDepthSequencingStrategy(2);
      const min = 3;
      const max = 7;
      const spellingStrategy = new BeginningCapitalsSpellingStrategy();
      const generator = new WordGenerator({
        sampleSet: sampleSet,
        sequencingStrategy: sequencingStrategy,
        targetLengthMin: min,
        targetLengthMax: max,
        seed: testSeed,
        spellingStrategy: spellingStrategy,
        endingPickMode: ENDING_PICK_MODES.NONE,
      });
      // When
      const generated = generator.generate(3);
      // Then
      generated.length.should.be.equal(3);
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
      const sequencingStrategy = new CharDepthSequencingStrategy(2);
      const min = 4;
      const max = 10;
      const spellingStrategy = new BeginningCapitalsSpellingStrategy();
      const generator = new WordGenerator({
        sampleSet: sampleSet,
        sequencingStrategy: sequencingStrategy,
        targetLengthMin: min,
        targetLengthMax: max,
        seed: testSeed,
        spellingStrategy: spellingStrategy,
        endingPickMode: ENDING_PICK_MODES.NONE,
      });
      // When
      const generated = generator.generate(100);
      // Then
      generated.length.should.be.equal(100);
    });
  });

});
