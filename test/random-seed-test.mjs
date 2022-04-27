import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import RandomSeeded from '../script/random-seed.mjs';

describe('RandomSeeded', function() {
  const testSeed = "Test1234567890";

  it('Generates a number between 0 and 1, 10000 times', function() {
    // Given
    const rnd = new RandomSeeded();
    const numbers = [];
    // When
    for (let i = 0; i < 10000; i++) {
      numbers.push(rnd.generate());
    }
    // Then
    numbers.length.should.be.equal(10000);
    
    const numberSmaller = numbers.find(it => it < 0);
    should.not.exist(numberSmaller);
    
    const numberGreater = numbers.find(it => it > 1);
    should.not.exist(numberGreater);
  });
});