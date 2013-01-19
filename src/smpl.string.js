define(['./smpl.core'], function(smpl) {
	smpl.string = {};
	
	/**
	 * Replace patterns inside a string with the coresponding value
	 *
	 *     smpl.string.supplant('test {method}', {method: 'supplant'}); // => 'test supplant'
	 *     smpl.string.supplant('{0} {1} {2}', ['work', 'with', 'arrays']); // => 'work with arrays'
	 *
	 * @param {String} string The string to operate on
	 * @param {Object} object The object where the replacement are taken from
	 * @return {String} the result of the replacement
	 */
	smpl.string.supplant = function(string, object) {
		return string.replace(/\{(\w+)\}/g, function(a, key) {
			var replacer = object[key];
			return (replacer !== undefined) ? replacer : key;
		});
	};
	
	/**
	 * Test if a string starts with the given substring
	 * @param {String} string The string to test
	 * @param {String} start  The substring to search
	 * @return {Boolean} true if `string` starts with `start`. False otherwise
	 */
	smpl.string.startsWith = function(string, start) {
		return string.substr(0, start.length) === start;
	};
	
	return smpl;
});
