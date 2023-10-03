import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { BeginningCapitalsSpellingStrategy } from '../../../../business/generator/postprocessing/beginning-capitals-strategy.mjs';
import RandomSeeded from '../../../../business/util/random-seed.mjs';

describe('BeginningCapitalsSpellingStrategy', function() {
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

  it('capitalizes the given word correctly', async () => {
    // Given
    const word = "bob"
    const strategy = new BeginningCapitalsSpellingStrategy();
    // When
    const result = await strategy.apply(word);
    // Then
    result.should.be.equal("Bob");
  });
});
