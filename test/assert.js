var assert = require('../assert');
suite('assert', function() {
	suite('throws', function() {
		test('when throw', function() {
			var thrown;
			var returned = assert.throws(function() {
				thrown = new Error();
				throw thrown;
			});
			if (thrown !== returned) {
				throw new Error('Incorrect error returned');
			}
		});
		test('when throw with type check', function() {
			var CustomError = function() {};
			var thrown;
			var returned = assert.throws(function() {
				thrown = new CustomError();
				throw thrown;
			}, CustomError);
			if (thrown !== returned) {
				throw new Error('Incorrect error returned');
			}
		});
		test('when no throw', function() {
			try {
				assert.throws(function() {
				});
			} catch(e) {
				return;
			}
			throw new Error('assert.throws should have thrown an exception');
		});
		test('when no throw with type', function() {
			try {
				assert.throws(function() {
				}, Error);
			} catch(e) {
				return;
			}
			throw new Error('assert.throws should have thrown an exception');
		});
	});
	suite('assert', function() {
		var getError = function(value, message) {
			try {
				assert(value, message);
			} catch (e) {
				return e;
			}
		};
		var testError = function(error, message) {
			if (!error) {
				assert.fail('Expected statement to throw an error');
			}
			if (error.constructor !== assert.AssertionError) {
				assert.fail('Wrong error thrown');
			}
			if (message && '' + error !== 'AssertionError: ' + message) {
				assert.fail('Wrong mesage thrown');
			}
		};
		test('false should throw', function() {
			var error = getError(false);
			testError(error);
		});
		test('falsy should throw', function() {
			var error = getError(0);
			testError(error);
		});
		test('true should not throw', function() {
			assert(true);
			assert(true, 'with a message');
		});
		test('truthy should not throw', function() {
			assert('f');
			assert({}, 'with a message');
		});
		test('false with a message', function() {
			var message = 'this is a test message';
			var error = getError(false, message);
			testError(error, message);
		});
		test('falsy with a message', function() {
			var message = 'this is a test message';
			var error = getError(null, message);
			testError(error, message);
		});
	});
	suite('fail', function() {
		test('should throw an AssertionError', function() {
			var ok;
			try {
				assert.fail();
			} catch (e) {
				if (e.constructor !== assert.AssertionError) {
					throw new Error('Wrong error thrown');
				}
				ok = true;
			}
			if (!ok) {
				throw new Error('no error thrown');
			}
		});
		test('with a message', function() {
			var ok,
			    message = 'this is a custom message';
			try {
				assert.fail(message);
			} catch (e) {
				if (e.constructor !== assert.AssertionError) {
					throw new Error('Wrong error thrown');
				}
				if ('' + e !== 'AssertionError: ' + message) {
					throw new Error('Wrong mesage thrown');
				}
				ok = true;
			}
			if (!ok) {
				throw new Error('no error thrown');
			}
			
		});
	});
	suite('equals', function() {
		equals = function(a, b) {
			assert.equals(a, b, '<' + a + '> should be equal to <' + b + '>');
		};
		inequals = function(a, b) {
			var message = '<' + a + '> should not be equal to <' + b + '>';
			assert.throws(assert.equals.bind(assert, a, b), assert.AssertionError, message);
		};
		test('simple equals', function() {
			equals(null, null);
			equals(undefined, undefined);
			equals(0, 0);
			equals(1, 1);
			equals('', '');
			equals('test', 'test');
			equals([], []);
			equals([3], [3]);
			equals({}, {});
			equals(/a/, /a/);
			equals(/a/g, new RegExp('a', 'g'));
			equals(true, true);
			equals(false, false);
		});
		
		test('simple inequals', function() {
			inequals(null, undefined);
			inequals(0, 1);
			inequals(1, 2);
			inequals('', ' ');
			inequals('test', 't');
			inequals([], [1]);
			inequals([1], [2]);
			inequals({}, {a: 1});
			inequals(/a/, /b/);
			inequals(/a/g, /a/);
			inequals(true, false);
		});
		test('tricky values', function() {
			equals(NaN, NaN);
			inequals(0, -0);
			inequals(0, new Number(0));
			equals('test', String('test'));
			inequals('test', new String('test'));
			inequals(true, new Boolean(true));
			equals(true, Boolean(3));
			equals(['a'], new Array('a'));
			equals(new Object(2), new Number(2));
		});
		test('transtype', function() {
			inequals(0, '0');
			inequals(0, '');
			inequals(0, ' ');
			inequals(false, '0');
			inequals(true, '1');
		});
		test('deep objects', function() {
			var a = {a: {b: 1}};
			var b = {a: {b: 1}};
			equals(a, b);
			a.a.b = 2;
			inequals(a, b);
		});
		test('object prototype', function() {
			var F = function() {};
			var G = function() {};
			var a = new F();
			var b = new F();
			var c = new G();
			equals(a, b);
			inequals(a, c);
		});
		test('cyclic objects', function() {
			var a = {a: {}};
			var b = {a: {}};
			a.a.a = a;
			b.a.a = b;
			equals(a, b);
			b.a.a = {a: {}};
			inequals(a, b);
		});
	});
});
