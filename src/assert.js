if (typeof define !== 'function') {var define = require('amdefine')(module)}
/**
 * @module assert
 * @class assert
 * @static
 */
define(['./smpl.data', './smpl.utils'], function(smpl) {
	
	var AssertionError = function AssertionError(options) {
		this.name = 'AssertionError';
		this.message = options.message;
		if (options.hasOwnProperty('actual')) {
			this.actual = smpl.utils.stringify(options.actual);
		}
		if (options.hasOwnProperty('expected')) {
			this.expected = smpl.utils.stringify(options.expected);
		}
		
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, options.stackStartFunction);
		}
	};
	
	AssertionError.prototype = Object.create(Error.prototype);
	AssertionError.prototype.constructor = AssertionError;
	
	AssertionError.prototype.toString = function() {
		if (this.message) {
			return [this.name + ':', this.message].join(' ');
		} else if (this.actual || this.expected) {
			var message = [this.name + ':'];
			if (this.actual) {
				message.push('actual - ' + this.actual);
			}
			if (this.expected) {
				message.push('expected - ' + this.expected);
			}
			return message.join(' ');
		} else {
			return this.name;
		}
	};
	
	function fail(message, actual, expected, stackStartFunction) {
		var options = {
			message: message
		};
		if (arguments.length === 2) {
			stackStartFunction = actual;
		} else if (arguments.length === 4) {
			options.actual = actual;
			options.expected = expected;
		}
		options.stackStartFunction = stackStartFunction || fail;
		
		throw new AssertionError(options);
	}
	
	/**
	 * Assert that a `value` is truthy. If the value is falsy, throw an `AssertionError`.
	 * 
	 * @method assert
	 * @static
	 * 
	 * @param {any} value        The value to test
	 * @param {String} message Message to be used in the `AssertionError`.
	 *                         If no message is provided, an automatic one will be used (optional)
	 */
	var assert = function(value, message) {
		if (!value) {
			if (!message) {
				message = 'Expected <' + smpl.utils.stringify(value) + '> to be truthy';
			}
			fail(message, assert);
		}
	};
	
	/**
	 * throw an `AssertionError`
	 * 
	 * @method fail
	 * 
	 * @param {String} message Message to be used in the `AssertionError`
	 */
	assert.fail = function(message) {
		fail(message, assert.fail);
	};
	
	/**
	 * Assert that `value` and `expected` are equals. Use `smpl.data.compare` to compare the values.
	 * 
	 * @method equals
	 * 
	 * @param {any} value        Value to test
	 * @param {any} expected     Expected value
	 * @param {String} message Message to be used in the `AssertionError`.
	 *                         If no message is provided, an automatic one will be used (optional)
	 */
	assert.equals = function(value, expected, message) {
		if (!smpl.data.compare(value, expected)) {
			fail(message, value, expected, assert.equals);
		}
	};
	
	var is = function(value, expected) {
		if (value === expected) {
			// We must take care that comparing 0 and -0 should return false;
			return (value !== 0 || 1 / value === 1 / expected);
		} else {
			// take care of the NaN value
			return (value !== value && expected !== expected);
		}
	};
	
	/**
	 * Assert that `value` and `expected` are the same.
	 * This is the same as the triple equal operator except that -0 and 0 are considered different and that NaN is NaN.
	 * 
	 * @method is
	 * 
	 * @param {any} value        Value to test
	 * @param {any} expected     Expected value
	 * @param {String} message Message to be used in the `AssertionError`.
	 *                         If no message is provided, an automatic one will be used (optional)
	 */
	assert.is = function(value, expected, message) {
		if (!is(value, expected)) {
			fail(message, value, expected, assert.equals);
		}
	};
	
	/**
	 * Assert that `value` and `expected` are not the same.
	 * This is the same as `!==` except that -0 and 0 are considered different and that NaN is NaN.
	 * 
	 * @method isNot
	 * 
	 * @param {any} value        Value to test
	 * @param {any} expected     Expected value
	 * @param {String} message Message to be used in the `AssertionError`.
	 *                         If no message is provided, an automatic one will be used (optional)
	 */
	assert.isNot = function(value, expected, message) {
		if (is(value, expected)) {
			fail(message, value, expected, assert.equals);
		}
	};
	
	/**
	 * Assert that a function throws an exception when called
	 * 
	 * @method throws
	 * 
	 * @param {Function} fn    Function to test
	 * @param {Function} type  Type of the expected exception. (optional)
	 * @param {String} message Message to be used in the `AssertionError`.
	 *                         If no message is provided, an automatic one will be used (optional)
	 * @return {Error} the error that was trown
	 */
	assert.throws = function(fn, type, message) {
		if (typeof type === 'string') {
			message = type;
			type = null;
		}
		try {
			fn();
		} catch (e) {
			if (type && !(e instanceof type)) {
				fail(message || 'exception of wrong type thrown', assert.throws);
			}
			return e;
		}
		fail(message || 'Expected function to throw an error', assert.throws);
	};
	
	assert.AssertionError = AssertionError;
	
	return assert;
});
