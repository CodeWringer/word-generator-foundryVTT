import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { isInteger } from '../../../business/util/validation.mjs';

describe('validation', function() {
  describe('isInteger', function() {
    it('Returns true on 2', function() {
      // Given
      const input = 2;
      // When
      const result = isInteger(input);
      // Then
      result.should.be.equal(true);
    });

    it('Returns true on 0', function() {
      // Given
      const input = 0;
      // When
      const result = isInteger(input);
      // Then
      result.should.be.equal(true);
    });

    it('Returns false on "abc"', function() {
      // Given
      const input = "abc";
      // When
      const result = isInteger(input);
      // Then
      result.should.be.equal(false);
    });

    it('Returns true on 3.1', function() {
      // Given
      const input = 3.1;
      // When
      const result = isInteger(input);
      // Then
      result.should.be.equal(true);
    });
  });
});