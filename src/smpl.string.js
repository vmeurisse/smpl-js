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
	smpl.string.endsWith = function (string, end) {
		return string.slice(string.length - end.length) === end;
	};
	
	return smpl;
});
