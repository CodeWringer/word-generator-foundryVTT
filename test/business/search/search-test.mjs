import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { SEARCH_MODES, Search, SearchItem } from '../../../business/search/search.mjs';

describe("Search", () => {
  describe("search", () => {
    // Given
    const searchItems = [
      new SearchItem({ id: "0", term: "The sly fox, 'Hiker', jumped over the lazy dog, 'Joe'." }),
      new SearchItem({ id: "1", term: "Joe was indeed lazy. He had never been much one for the hunt. Lazily Joe raised his head at the fox jumping over him." }),
      new SearchItem({ id: "2", term: "And so the not-so-lazy fox got to come and go as he pleased." }),
    ];

    it("correctly grades 3 given entries when strict and case sensitive", () => {
      // Given
      const searchTerm = "Joe";
      // When
      const r = new Search().search(searchItems, searchTerm, SEARCH_MODES.STRICT_CASE_SENSITIVE);
      // Then
      r[0].id.should.be.eql("1");
      r[0].score.should.be.eql(12);
      
      r[1].id.should.be.eql("0");
      r[1].score.should.be.eql(6);

      r[2].id.should.be.eql("2");
      r[2].score.should.be.eql(0);
    });

    it("correctly grades 3 given entries when strict and case insensitive", () => {
      // Given
      const searchTerm = "joe";
      // When
      const r = new Search().search(searchItems, searchTerm, SEARCH_MODES.STRICT_CASE_INSENSITIVE);
      // Then
      r[0].id.should.be.eql("1");
      r[0].score.should.be.eql(10);
      
      r[1].id.should.be.eql("0");
      r[1].score.should.be.eql(5);

      r[2].id.should.be.eql("2");
      r[2].score.should.be.eql(0);
    });

    it("correctly grades 3 given entries when fuzzy", () => {
      // Given
      const searchTerm = "lazy";
      // When
      const r = new Search().search(searchItems, searchTerm, SEARCH_MODES.FUZZY);
      // Then
      r[0].id.should.be.eql("1");
      r[0].score.should.be.eql(13);
      
      r[1].id.should.be.eql("0");
      r[1].score.should.be.eql(8);

      r[2].id.should.be.eql("2");
      r[2].score.should.be.eql(8);
    });
  });
});
