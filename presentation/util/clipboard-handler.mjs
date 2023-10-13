export default class ClipboardHandler {
  /**
   * Copies the given text to the clipboard. 
   * 
   * @param {String} text The text to copy to clipboard. 
   * 
   * @returns {Boolean} True, if successfully copied. 
   * 
   * @async
   */
  async textToClipboard(text) {
    if (!navigator.clipboard) { // This uses a deprecated API as a fallback solution. 
      const html = $("body");

      // A temporary element is created for the sole purpose of holding the text to copy to clipboard. 
      const textArea = html.createElement("textarea");
      textArea.value = text;
      
      // This avoids scrolling to the bottom.
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";

      // The element must be added and focused. 
      html.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      // Try the copy. 
      let success = false;
      try {
        html.execCommand('copy');
        html.removeChild(textArea);
        success = true;
      } catch (err) {
        console.error('Error copying to clipboard: ', err);
      }

      // Ensure the element is removed again. 
      html.removeChild(textArea);
      return success;
    } else {
      try {
        await navigator.clipboard.writeText(text);

        return true;
      } catch (err) {
        console.error('Error copying to clipboard: ', err);

        return false;
      }
    }
  }
}