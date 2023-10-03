/**
 * Defines the search modes for use in a search. 
 * 
 * @property {SEARCH_MODES} STRICT_CASE_SENSITIVE Only returns exact matches, 
 * including case sensitivity. 
 * @property {SEARCH_MODES} STRICT_CASE_INSENSITIVE Only returns exact matches, 
 * excluding case sensitivity. 
 * @property {SEARCH_MODES} FUZZY Returns partial matches. Excluding case sensitivity. 
 * 
 * @constant
 */
export const SEARCH_MODES = {
  STRICT_CASE_SENSITIVE: 0,
  STRICT_CASE_INSENSITIVE: 1,
  FUZZY: 2,
};

/**
 * Defines an item available to a search. 
 * 
 * @property {String} id Unique ID of this entry. 
 * @property {String} term The term that is available to the search. 
 * This is what will be matched against. 
 */
export class SearchItem {
  /**
   * @param {Object} args 
   * @param {String} args.id Unique ID of this entry. 
   * @param {String} args.term The term that is available to the search. 
   * This is what will be matched against. 
   */
  constructor(args = {}) {
    this.id = args.id;
    this.term = args.term;
  }
}

/**
 * Defines the result of a search. 
 * 
 * @property {String} id Unique ID of this entry. 
 * @property {String} term The term used in the search. 
 * @property {Number} score Describes how well the term matches the search term. 
 * @property {Number} deviation Describes by how much the term deviates from the 
 * search term. 
 */
export class SearchResult {
  /**
   * @param {Object} args 
   * @param {String} args.id Unique ID of this entry. 
   * @param {String} args.term The term used in the search. 
   * @param {Number} args.score Describes how well the term matches the search term. 
   * @param {Number} args.deviation Describes by how much the term deviates from the 
   */
  constructor(args = {}) {
    this.id = args.id;
    this.term = args.term;
    this.score = args.score;
    this.deviation = args.deviation;
  }
}

/**
 * Defines a means to search through a given set of terms, based on a given 
 * search term, with given strictness with matching. 
 */
export class Search {
  /**
   * Returns the score for a matching case correct character. 
   * 
   * @type {Number}
   * @readonly
   * @private
   */
  get caseCorrectScore() { return 2; }

  /**
   * Returns the score for a matching case incorrect character. 
   * 
   * @type {Number}
   * @readonly
   * @private
   */
  get caseIncorrectScore() { return 1; }

  /**
   * Searches through the given list of `SearchItem`s and returns a grading of all 
   * items, in regards to how well they match the given search term. 
   * 
   * @param {Array<SearchItem>} searchItems The list of items to search in. 
   * @param {String} searchTerm The term to match against.
   * @param {SEARCH_MODES | undefined} searchMode The strictness of matching. 
   * * default `SEARCH_MODES.STRICT_CASE_INSENSITIVE`
   * 
   * @returns {Array<SearchResult>} The list of graded results, sorted by best score first, 
   * to worst score last. 
   * * Lowest score is always `0`. 
   * * Every correctly cased matching character yields +2 score. 
   * * Every incorrectly cased matching character yields +1 score. 
   * * Every non-matching character (regardless of casing) yields 0 score. 
   */
  search(searchItems, searchTerm, searchMode = SEARCH_MODES.STRICT_CASE_INSENSITIVE) {
    const results = [];

    for (const searchItem of searchItems) {
      let score = 0;
      let deviation = 0;
      let compareCharacterIndex = 0;
      let compareCharacter = searchTerm[compareCharacterIndex];

      // Test every single character... 
      for (const c of searchItem.term) {
        let characterScore = 0;
        
        if (c.toLowerCase() == compareCharacter.toLowerCase()) {
          // Matching character found. 

          if (c === compareCharacter) {
            // Correct casing.
            characterScore = this.caseCorrectScore;
          } else {
            // Incorrect casing.
            characterScore = this.caseIncorrectScore;
          }

          // For the next character comparison, compare with the next character 
          // of the search term. 
          compareCharacterIndex++;
          if (compareCharacterIndex >= searchTerm.length) break;
          compareCharacter = searchTerm[compareCharacterIndex];
        }

        if (searchMode === SEARCH_MODES.STRICT_CASE_SENSITIVE && characterScore !== this.caseCorrectScore) {
          continue;
        } else if (searchMode === SEARCH_MODES.STRICT_CASE_INSENSITIVE && characterScore === 0) {
          continue;
        }
        
        score += characterScore;
      }

      results.push(new SearchResult({
        id: searchItem.id,
        term: searchItem.term,
        score: score,
        deviation: deviation,
      }));
    }

    return results.sort((a, b) => a.score > b.score);
  }
}
