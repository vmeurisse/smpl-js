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
	 * @param number {Number} the number to pad. Only positive integers number are supported
	 * @param length {Number} The minimum length of the resulting string.
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
	 * @param number {Number} the original number
	 * @param min {Number} the lower bound
	 * @param max {Number} the upper bound
	 * @return {Number} The constrained number
	 */
	smpl.number.constrain = function(number, min, max) {
		return (number < min) ? min : ((number > max) ? max : number);
	};
	
	/**
	 * Return a random integer between `min` and `max - 1`.
	 * 
	 * @method randomInt
	 * 
	 * @param min {Integer} the lower bound
	 * @param max {Integer} the upper bound
	 * @return {Integer} a random integer
	 */
	smpl.number.randomInt = function (min, max) {
	    return Math.floor(Math.random() * (max - min)) + min;
	};
	
	return smpl;
});
