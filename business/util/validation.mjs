// TODO: Turn into instantiable object
/**
 * Returns true, if the given value can be parsed to an integer. 
 * @returns {Boolean} 
 */
export function isInteger(value) {
  try {
    const parsed = parseInt(value);
    if (parsed === undefined || parsed === null) {
      return false;
    }
    if (isNaN(parsed) === true) {
      return false;
    }
  } catch (error) {
    return false;
  }
  return true;
}
