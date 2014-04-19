if (typeof define !== 'function') {var define = require('amdefine')(module)}
/**
 * @module smpl
 * @submodule smpl.string
 * @class smpl.string
 * @static
 */
define(['./smpl.core'], function(smpl) {
	smpl.string = {};
	
	/**
	 * Replace patterns inside a string with the coresponding value
	 *
	 *     smpl.string.supplant('test {method}', {method: 'supplant'}); // => 'test supplant'
	 *     smpl.string.supplant('{0} {1} {2}', ['work', 'with', 'arrays']); // => 'work with arrays'
	 *
	 * @method supplant
	 * 
	 * @param {String} string The string to operate on
	 * @param {Object} object The object where the replacement are taken from
	 * @return {String} the result of the replacement
	 */
	smpl.string.supplant = function(string, object) {
		return string.replace(/\{(\w+)\}/g, function(match, key) {
			var replacer = object[key];
			return (replacer !== undefined) ? replacer : match;
		});
	};
	
	/**
	 * Test if a string starts with the given substring
	 *
	 * @method startsWith
	 * 
	 * @param {String} string The string to test
	 * @param {String} start  The substring to search
	 * @return {Boolean} true if `string` starts with `start`. False otherwise
	 */
	smpl.string.startsWith = function(string, start) {
		return string.slice(0, start.length) === start;
	};
	
	/**
	 * Test if a string ends with the given substring
	 *
	 * @method endsWith
	 * 
	 * @param {String} string The string to test
	 * @param {String} end  The substring to search
	 * @return {Boolean} true if `string` ends with `end`. False otherwise
	 */
	smpl.string.endsWith = function(string, end) {
		return string.slice(string.length - end.length) === end;
	};
	
	/**
	 * Escape a string so that it is safe to include it in HTML
	 * 
	 * **WARNING**: It's only safe to include the result in a quoted argument value or between tags
	 * 
	 *     <div>{escapedString}</div> <!-- safe -->
	 *     <div class="{escapedString}"></div> <!-- safe -->
	 *     <div class={escapedString}></div> <!-- unsafe -->
	 *     <div class="a" {escapedString}></div> <!-- unsafe -->
	 * 
	 * @method escapeHTML
	 * 
	 * @param string {String} the string to escape
	 * @return {String} the escaped string
	 */
	smpl.string.escapeHTML = function(string) {
		return String(string).replace(/&/g, '&amp;')
		                     .replace(/"/g, '&quot;')
		                     .replace(/'/g, '&#39;')
		                     .replace(/</g, '&lt;')
		                     .replace(/>/g, '&gt;');
	};
	
	/**
	 * Unescape html entities in a string.
	 * 
	 * **Note**: Only `&amp;`(&), `&quot;`("), `&#39;`('), `&lt;`(<) and `&gt;`(>) are unescaped.
	 * 
	 * @method unescapeHTML
	 * 
	 * @param string {String} the string to unescape
	 * @return {String} the unescaped string
	 */
	smpl.string.unescapeHTML = function(string) {
		return String(string).replace(/&amp;/g, '&')
		                     .replace(/&quot;/g, '"')
		                     .replace(/&#39;/g, "'")
		                     .replace(/&lt;/g, '<')
		                     .replace(/&gt;/g, '>');
	};
	
	/**
	 * Escape a string so that it is safe to include it in a JS string
	 * 
	 * @method escapeJs
	 * 
	 * @param string {String} the string to escape
	 * @return {String} the escaped string
	 */
	smpl.string.escapeJs = function(string) {
		return String(string).replace(/\\/g, '\\\\')
		                     .replace(/\r\n/g, '\\n')
		                     .replace(/[\n\r\u2028\u2029]/g, '\\n\\\n')
		                     .replace(/'/g, "\\'")
		                     .replace(/"/g, '\\"')
		                     .replace(/\//g, '\\/');
	};
	
	return smpl;
});
