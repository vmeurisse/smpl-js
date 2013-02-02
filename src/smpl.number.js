if (typeof define !== 'function') {var define = require('amdefine')(module)}
define(['./smpl.core'], function(smpl) {
	smpl.number = {};
	
	/**
	 * Add zeros in front of `number` up to the desired `length`
	 * @param {Number} number the number to pas. Only positive integers number are supported
	 * @param {Number} length The minimum length of the resulting string.
	 * @return {String} The padded number
	 */
	smpl.number.zeroPad = function(number, length) {
		number = '' + number;
		length = length || 2;
		while (number.length < length) number = "0" + number;
		return number;
	};
	
	return smpl;
});