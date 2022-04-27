import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import BeginningCapitalsSpellingStrategy from '../script/beginning-capitals-strategy.mjs';

describe('BeginningCapitalsSpellingStrategy', function() {
  it('capitalizes the given word correctly', function() {
    // Given
    const word = "bob"
    const strategy = new BeginningCapitalsSpellingStrategy();
    // When
    const result = strategy.apply(word);
    // Then
    result.should.be.equal("Bob");
  });
});
