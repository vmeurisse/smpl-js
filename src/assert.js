define(['./smpl.data'], function(smpl) {
	var AssertionError = function AssertionError(options) {
		this.name = 'AssertionError';
		this.message = options.message;
		if (options.hasOwnProperty('actual')) {
			this.actual = stringify(options.actual);
		}
		if (options.hasOwnProperty('expected')) {
			this.expected = stringify(options.expected);
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

	function replacer(key, value) {
		if (value === undefined) {
			return '' + value;
		}
		if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
			return value.toString();
		}
		if (typeof value === 'function' || value instanceof RegExp) {
			return value.toString();
		}
		return value;
	}
	
	function stringify(o) {
		return JSON.stringify(o, replacer, '\t');
	}
	function fail(message, actual, expected, stackStartFunction) {
		var options = {
			message: message
		};
		if (arguments.length === 2) {
			stackStartFunction = actual;
		} else if (arguments.length === 3) {
			stackStartFunction = expected;
			options.actual = actual;
		} else if (arguments.length === 4) {
			options.actual = actual;
			options.expected = expected;
		}
		options.stackStartFunction = stackStartFunction || fail;

		throw new AssertionError(options);
	}

	var assert = function(value, message) {
		if (!!!value) {
			if (!message) {
				message = 'Expected <' + stringify(value) + '> to be truthy';
			}
			fail(message, assert);
		}
	};

	assert.fail = function(message) {
		fail(message, assert.fail);
	};
	assert.equals = function(value, expected, message) {
		if (!smpl.data.compare(value, expected)) {
			fail(message, value, expected, assert.equals);
		}
	};

	assert.throws = function(fn, type, message) {
		if (typeof type === 'string') {
			message = type;
			type = null;
		}
		try {
			fn();
		} catch(e) {
			if (type && !e instanceof type) {
				fail(message || 'exception of wrong type thrown', assert.throws);
			}
			return e;
		}
		fail(message || 'Expected function to throw an error', assert.throws);
	};
	assert.AssertionError = AssertionError;
	return assert;
});
