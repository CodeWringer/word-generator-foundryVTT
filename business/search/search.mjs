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
    const deviationTolerance = 2;

    for (const searchItem of searchItems) {
      let totalScore = 0;
      let totalDeviation = 0;
      let compareCharacterIndex = 0;
      let compareCharacter = searchTerm[compareCharacterIndex];

      // The score per matching run. Will only be added to the total score, 
      // when a matching run is concluded successfully. 
      let runScore = 0;
      // The deviation per matching run. 
      let runDeviation = 0;
      // Is true, if there is currently a matching run ongoing. 
      let matchingRunBegun = false;

      // Test every single character... 
      for (const char of searchItem.term) {
        const charMatch = this._matchCharacter(char, compareCharacter, searchMode, runDeviation, deviationTolerance, matchingRunBegun);
        if (charMatch.success === true) {
          compareCharacterIndex++;
          matchingRunBegun = true;
          runScore += charMatch.score;
          
          if (charMatch.deviates === true) {
            runDeviation++;
          }

          if (compareCharacterIndex >= searchTerm.length) {
            // Matching run concluded with success. 
            totalScore += runScore;
            totalDeviation += runDeviation
            compareCharacterIndex = 0;
            runScore = 0;
            runDeviation = 0;
            matchingRunBegun = false;
          }
        } else {
          compareCharacterIndex = 0;
          runScore = 0;
          runDeviation = 0;
          matchingRunBegun = false;
        }
        compareCharacter = searchTerm[compareCharacterIndex];
      }

      results.push(new SearchResult({
        id: searchItem.id,
        term: searchItem.term,
        score: totalScore,
        deviation: totalDeviation,
      }));
    }

    results.sort((a, b) => {
      if (a.score < b.score) return 1;
      else if (a.score > b.score) return -1;
      else return 0;
    });

    return results;
  }

  /**
   * Tries to match the given character
   * 
   * @param {String} char The character to test. 
   * @param {String} compareCharacter The character to match against. 
   * @param {SEARCH_MODES} searchMode The search mode. 
   * @param {Number} runDeviation The deviation during the current matching run. 
   * @param {Number} deviationTolerance The maximum deviation. 
   * If the `char` does not match and the search mode is `SEARCH_MODES.FUZZY`, 
   * then the character may still be considered a match, if it is within the 
   * given `deviationTolerance`. 
   * @param {Boolean} matchingRunBegun If `true`, this means a previously tested 
   * character was successfully matched. Only if this is true, will deviation 
   * be considered. 
   * 
   * @returns {Object} `{ success: Boolean, score: Number, deviates: Boolean }`
   * 
   * @private
   */
  _matchCharacter(char, compareCharacter, searchMode, runDeviation, deviationTolerance, matchingRunBegun) {
    if (char == compareCharacter) {
      return {
        success: true,
        score: this.caseCorrectScore,
        deviates: false,
      };
    } else if (char.toLowerCase() == compareCharacter.toLowerCase()) {
      if (searchMode === SEARCH_MODES.STRICT_CASE_INSENSITIVE 
        || searchMode === SEARCH_MODES.FUZZY) {
        return {
          success: true,
          score: this.caseIncorrectScore,
          deviates: false,
        };
      }
    } else if (matchingRunBegun === true && runDeviation + 1 <= deviationTolerance) {
      if (searchMode === SEARCH_MODES.FUZZY) {
        return {
          success: true,
          score: 0,
          deviates: true,
        };
      }
    }

    return {
      success: false,
      score: 0,
      deviates: false,
    };
  }
}
