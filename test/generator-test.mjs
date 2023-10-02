import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import WordGenerator from '../business/generator/generator.mjs';
import { BeginningCapitalsSpellingStrategy } from '../business/generator/postprocessing/beginning-capitals-strategy.mjs';
import { CharDepthSequencingStrategy } from '../business/generator/sequencing/char-depth-sequencing-strategy.mjs';
import { ENDING_PICK_MODES } from '../business/generator/concatenation/sequence-concatenator.mjs';
import { WordListSamplingStrategy } from '../business/generator/sampling/word-list-sampling-strategy.mjs';
import { NoneSpellingStrategy } from '../business/generator/postprocessing/none-spelling-strategy.mjs';

describe('WordGenerator', function() {
  const testSeed = "Test1234567890";

  describe('generate', function() {
    it('should generate 1 word without spelling strategy', async() => {
      // Given
      const samplingStrategy = new WordListSamplingStrategy({
        separator: ",",
        sampleSet: "Bob,Gobob,Bobby",
      });
      const sequencingStrategy = new CharDepthSequencingStrategy(2);
      const min = 3;
      const max = 4;
      const generator = new WordGenerator({
        samplingStrategy: samplingStrategy,
        sequencingStrategy: sequencingStrategy,
        spellingStrategy: new NoneSpellingStrategy(),
        targetLengthMin: min,
        targetLengthMax: max,
        seed: testSeed,
        endingPickMode: ENDING_PICK_MODES.NONE,
      });
      // When
      const generated = await generator.generate(1);
      // Then
      generated.length.should.be.equal(1);
    });

    it('should generate 3 words without spelling strategy', async() => {
      // Given
      const samplingStrategy = new WordListSamplingStrategy({
        separator: ",",
        sampleSet: "Bob,Gobob,Bobby",
      });
      const sequencingStrategy = new CharDepthSequencingStrategy(2);
      const min = 3;
      const max = 7;
      const generator = new WordGenerator({
        samplingStrategy: samplingStrategy,
        sequencingStrategy: sequencingStrategy,
        spellingStrategy: new NoneSpellingStrategy(),
        targetLengthMin: min,
        targetLengthMax: max,
        seed: testSeed,
        endingPickMode: ENDING_PICK_MODES.NONE,
      });
      // When
      const generated = await generator.generate(3);
      // Then
      generated.length.should.be.equal(3);
    });

    it('should generate 3 words with spelling strategy', async() => {
      // Given
      const samplingStrategy = new WordListSamplingStrategy({
        separator: ",",
        sampleSet: "Bob,Gobob,Bobby",
      });
      const sequencingStrategy = new CharDepthSequencingStrategy(2);
      const min = 3;
      const max = 7;
      const spellingStrategy = new BeginningCapitalsSpellingStrategy();
      const generator = new WordGenerator({
        samplingStrategy: samplingStrategy,
        sequencingStrategy: sequencingStrategy,
        spellingStrategy: new NoneSpellingStrategy(),
        targetLengthMin: min,
        targetLengthMax: max,
        seed: testSeed,
        spellingStrategy: spellingStrategy,
        endingPickMode: ENDING_PICK_MODES.NONE,
      });
      // When
      const generated = await generator.generate(3);
      // Then
      generated.length.should.be.equal(3);
    });

    it('should generate 100 words with spelling strategy', async() => {
      // Given
      const samplingStrategy = new WordListSamplingStrategy({
        separator: ",",
        sampleSet: "Cáîn,Cáîs,Crellin,Crellis,Czéllin,Czéllis,Czéczin,Dódin,Dódis,Dódàrin,Dànyin,Dànyis,Tarrin,Tarkin,Tarkis,Terrin,Terris,Tzerin,Tederin,Tederis,Teszederin",
      });
      const sequencingStrategy = new CharDepthSequencingStrategy(2);
      const min = 4;
      const max = 10;
      const spellingStrategy = new BeginningCapitalsSpellingStrategy();
      const generator = new WordGenerator({
        samplingStrategy: samplingStrategy,
        sequencingStrategy: sequencingStrategy,
        spellingStrategy: new NoneSpellingStrategy(),
        targetLengthMin: min,
        targetLengthMax: max,
        seed: testSeed,
        spellingStrategy: spellingStrategy,
        endingPickMode: ENDING_PICK_MODES.NONE,
      });
      // When
      const generated = await generator.generate(100);
      // Then
      generated.length.should.be.equal(100);
    });
  });
});
