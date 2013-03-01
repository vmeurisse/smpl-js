if (typeof define !== 'function') {var define = require('amdefine')(module)}
/**
 * @module smpl
 * @submodule smpl.number
 * @class smpl.number
 * @static
 */
define(['./smpl.core'], function(smpl) {
	smpl.number = {};
	
	/**
	 * Add zeros in front of `number` up to the desired `length`
	 *
	 * @method zeroPad
	 * 
	 * @param {Number} number the number to pas. Only positive integers number are supported
	 * @param {Number} length The minimum length of the resulting string.
	 * @return {String} The padded number
	 */
	smpl.number.zeroPad = function(number, length) {
		number = '' + number;
		length = length || 2;
		while (number.length < length) number = '0' + number;
		return number;
	};
	
	/**
	 * Constrains a number inside the given interval
	 *
	 * @method constrain
	 * 
	 * @param {Number} number the original number
	 * @param {Number} min the lower bound
	 * @param {Number} max the upper bound
	 * @return {Number} The constrained number
	 */
	smpl.number.constrain = function(number, min, max) {
		return (number < min) ? min : ((number > max) ? max : number);
	};
	
	return smpl;
});