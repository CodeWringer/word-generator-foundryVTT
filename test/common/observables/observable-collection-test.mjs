import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import ObservableCollection from '../../../common/observables/observable-collection.mjs';

describe("ObservableCollection", () => {
  describe("find", () => {
    it("correctly finds an element fulfilling the predicate", () => {
      // Given
      const givenElements = [
        { id: "1" },
        { id: "2" },
        { id: "3" },
      ];
      const given = new ObservableCollection({ elements: givenElements });
      // When
      const r = given.find(it => it.id === "2");
      // Then
      r.should.not.be.undefined();
    });
  });

  describe("any", () => {
    it("correctly returns true for an element fulfilling the predicate", () => {
      // Given
      const givenElements = [
        { id: "1" },
        { id: "2" },
        { id: "3" },
      ];
      const given = new ObservableCollection({ elements: givenElements });
      // When
      const r = given.any(it => it.id === "2");
      // Then
      r.should.be.eql(true);
    });
  });
});
