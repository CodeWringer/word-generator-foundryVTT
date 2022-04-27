import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import RandomSeeded from '../script/random-seed.mjs';

describe('RandomSeeded', function() {
  const testSeedString = "Test1234567890";

  it('Generates a number between 0 and 1, 10000 times', function() {
    // Given
    const rnd = new RandomSeeded(testSeedString);
    const countToGenerate = 10000;
    const numbers = [];
    // When
    for (let i = 0; i < countToGenerate; i++) {
      numbers.push(rnd.generate());
    }
    // Then
    numbers.length.should.be.equal(countToGenerate);
    
    const numberSmaller = numbers.find(it => it < 0);
    should.not.exist(numberSmaller);
    
    const numberGreater = numbers.find(it => it > 1);
    should.not.exist(numberGreater);
  });

  it('Generates the expected number', function() {
    // Given
    const rnd = new RandomSeeded(testSeedString);
    const numbers = [];
    // When
    const generated = rnd.generate()
    // Then
    generated.should.be.equal(0.22385453199967742);
  });

  it('Generates a number in range', function() {
    // Given
    const rnd = new RandomSeeded(testSeedString);
    const min = 3;
    const max = 7;
    const countToGenerate = 10000;
    const numbers = [];
    // When
    for (let i = 0; i < countToGenerate; i++) {
      numbers.push(rnd.generate(min, max));
    }
    // Then
    numbers.length.should.be.equal(countToGenerate);
    
    const numberSmaller = numbers.find(it => it < min);
    should.not.exist(numberSmaller);
    
    const numberGreater = numbers.find(it => it > max);
    should.not.exist(numberGreater);

    const numberInRange = numbers.find(it => it >= min && it <= max);
    should.exist(numberInRange);
  });

  it('Generates lower bounded numbers', function() {
    // Given
    const rnd = new RandomSeeded(testSeedString);
    const min = 3;
    const max = undefined;
    const countToGenerate = 10000;
    const numbers = [];
    // When
    for (let i = 0; i < countToGenerate; i++) {
      numbers.push(rnd.generate(min, max));
    }
    // Then
    numbers.length.should.be.equal(countToGenerate);
    
    const numberSmaller = numbers.find(it => it < min);
    should.not.exist(numberSmaller);
  });

  it('Generates upper bounded numbers', function() {
    // Given
    const rnd = new RandomSeeded(testSeedString);
    const min = undefined;
    const max = 6;
    const countToGenerate = 10000;
    const numbers = [];
    // When
    for (let i = 0; i < countToGenerate; i++) {
      numbers.push(rnd.generate(min, max));
    }
    // Then
    numbers.length.should.be.equal(countToGenerate);
    
    const numberGreater = numbers.find(it => it > max);
    should.not.exist(numberGreater);
  });
});