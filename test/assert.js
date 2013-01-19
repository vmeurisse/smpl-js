if (typeof define !== 'function') {var define = require('amdefine')(module);}
define(['../assert', '../smpl.utils'], function(assert, smpl) {

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
			var equals = function(a, b) {
				var message = '<' + smpl.utils.stringify(a) + '> should be equal to <' + smpl.utils.stringify(b) + '>';
				assert.equals(a, b, message);
			};
			var inequals = function(a, b) {
				var message = '<' + smpl.utils.stringify(a) + '> should not be equal to <' +
				              smpl.utils.stringify(b) + '>';
				assert.throws(assert.equals.bind(assert, a, b, ' '), assert.AssertionError, message);
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
				inequals({a: 1}, {b: 1});
				inequals(/a/, /b/);
				inequals(/a/g, /a/);
				inequals(true, false);
			});
			test('bad constructors', function() {
				/* jshint -W053 */ //Allow bad constructors
				equals(new String('test'), new String('test'));
				inequals(new String('test'), new String('test2'));
				equals(new Boolean(4), new Boolean(3));
				inequals(new Boolean(false), new Boolean(true));
				equals(new Array('a'), new Array('a'));
				inequals(new Array('a'), new Array('b'));
				equals(new Number(0), new Number(0));
				inequals(new Number(0), new Number(-0));
				inequals(new Number(0), new Number(0.1));
			});
			test('tricky values', function() {
				/* jshint -W053 */ //Allow bad constructors
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
			test('Arrays', function() {
				var a = [1, 2, '3', {a: 4}, true];
				var b = [1, 2, '3', {a: 5}, true];
				inequals(a, b);
				b[3].a = 4;
				equals(a, b);
				
				var BIG_LENGTH = 1000000000; //use something huge to test performence on sparse arrays
				
				a.length = BIG_LENGTH;
				inequals(a, b);
				b[BIG_LENGTH - 1] = BIG_LENGTH;
				inequals(a, b);
				a[BIG_LENGTH - 1] = BIG_LENGTH;
				equals(a, b);
			});
		});
		suite('is', function() {
			var is = function(a, b) {
				var message = '<' + smpl.utils.stringify(a) + '> should be <' + smpl.utils.stringify(b) + '>';
				assert.is(a, b, message);
			};
			var isnot = function(a, b) {
				var message = '<' + smpl.utils.stringify(a) + '> should not be <' + smpl.utils.stringify(b) + '>';
				assert.throws(assert.is.bind(assert, a, b, ' '), assert.AssertionError, message);
			};
			test('simple is', function() {
				is(null, null);
				is(undefined, undefined);
				is(0, 0);
				is(1, 1);
				is('', '');
				is('test', 'test');
				is(true, true);
				is(false, false);
			});
			
			test('simple isnot', function() {
				isnot(null, undefined);
				isnot(0, 1);
				isnot(1, 2);
				isnot('', ' ');
				isnot('test', 't');
				isnot([], []);
				isnot([], [1]);
				isnot({}, {});
				isnot(/a/, /a/);
			});
			test('bad constructors', function() {
				isnot(new String('test'), new String('test'));
				isnot(new String('test'), new String('test2'));
				isnot(new Boolean(4), new Boolean(3));
				isnot(new Boolean(false), new Boolean(true));
				isnot(new Array('a'), new Array('a'));
				isnot(new Array('a'), new Array('b'));
				isnot(new Number(0), new Number(0));
				isnot(new Number(0), new Number(-0));
				isnot(new Number(0), new Number(0.1));
			});
			test('tricky values', function() {
				is(NaN, NaN);
				isnot(0, -0);
				isnot(0, new Number(0));
				is('test', String('test'));
				isnot('test', new String('test'));
				isnot(true, new Boolean(true));
				is(true, Boolean(3));
				isnot(['a'], new Array('a'));
				isnot(new Object(2), new Number(2));
			});
			test('transtype', function() {
				isnot(0, '0');
				isnot(0, '');
				isnot(0, ' ');
				isnot(false, '0');
				isnot(true, '1');
			});
		});
	});
});
