define(['smplAssert/assert', 'smplUtils/smpl.utils'], function(assert, smpl) {
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
			test('when throw with wrong type', function() {
				var CustomError = function() {};
				try {
					assert.throws(function() {
						throw new CustomError();
					}, Error);
				} catch (e) {
					if (!e instanceof assert.AssertionError) {
						throw new Error('Incorrect error returned');
					}
					return;
				}
				throw new Error('assert.throws should have thrown an exception');
			});
			test('when no throw', function() {
				try {
					assert.throws(function() {
					});
				} catch (e) {
					if (!e instanceof assert.AssertionError) {
						throw new Error('Incorrect error returned');
					}
					return;
				}
				throw new Error('assert.throws should have thrown an exception');
			});
			test('when no throw with type', function() {
				try {
					assert.throws(function() {
					}, Error);
				} catch (e) {
					if (!e instanceof assert.AssertionError) {
						throw new Error('Incorrect error returned');
					}
					return;
				}
				throw new Error('assert.throws should have thrown an exception');
			});
			test('with custom message', function() {
				var CustomError = function() {};
				try {
					assert.throws(function() {
						throw new CustomError();
					}, Error, 'test message');
				} catch (e) {
					if (!e instanceof assert.AssertionError) {
						throw new Error('Incorrect error returned');
					}
					if ('' + e !== 'AssertionError: test message') {
						throw new Error('Wrong mesage thrown');
					}
					return;
				}
				throw new Error('assert.throws should have thrown an exception');
			});
			test('with custom message2', function() {
				try {
					assert.throws(function() {
					}, 'test message');
				} catch (e) {
					if (!e instanceof assert.AssertionError) {
						throw new Error('Incorrect error returned');
					}
					if ('' + e !== 'AssertionError: test message') {
						throw new Error('Wrong mesage thrown');
					}
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
			test('with no message', function() {
				var ok;
				try {
					assert.fail();
				} catch (e) {
					if (e.constructor !== assert.AssertionError) {
						throw new Error('Wrong error thrown');
					}
					if ('' + e !== 'AssertionError') {
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
				inequals({}, null);
				inequals({}, undefined);
				inequals({a: 1}, {b: 1});
				inequals(/a/, /b/);
				inequals(/a/g, /a/);
				inequals(true, false);
			});
			
			test('dates', function() {
				var a = new Date();
				var b = new Date(a.getTime());
				var c = new Date(a.getTime() + 1);
				equals(a, b);
				inequals(a, c);
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
				
				var BIG_LENGTH = 1000000000; //use something huge to test performance on sparse arrays
				
				a.length = BIG_LENGTH;
				inequals(a, b);
				b[BIG_LENGTH - 1] = BIG_LENGTH;
				inequals(a, b);
				a[BIG_LENGTH - 1] = BIG_LENGTH;
				equals(a, b);
			});
			
			test('test returned message', function() {
				var e = assert.throws(assert.equals.bind(assert, 'a', 3), assert.AssertionError);
				assert('' + e === 'AssertionError: actual - "a" expected - 3', 'Wrong message');
			});
		});
		suite('is', function() {
			var is = function(a, b) {
				var message = '<' + smpl.utils.stringify(a) + '> should be <' + smpl.utils.stringify(b) + '>';
				assert.is(a, b, message);
				assert.throws(assert.isNot.bind(assert, a, b, ' '), assert.AssertionError, message);
			};
			var isnot = function(a, b) {
				var message = '<' + smpl.utils.stringify(a) + '> should not be <' + smpl.utils.stringify(b) + '>';
				assert.throws(assert.is.bind(assert, a, b, ' '), assert.AssertionError, message);
				assert.isNot(a, b, message);
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
		suite('domEquals', function() {
			/* jshint browser: true, node: true */
			
			var needClean = false;
			suiteSetup(function() {
				if (typeof window === 'undefined' || typeof document === 'undefined') {
					needClean = true;
					var jsdom = require('jsdom').jsdom;
					GLOBAL.document = jsdom();
					GLOBAL.window = document.createWindow();
				}
			});
			suiteTeardown(function() {
				if (needClean) {
					delete GLOBAL.document;
					delete GLOBAL.window;
				}
			});
			test('trivial cases', function() {
				var div = document.createElement('div');
				assert.throws(assert.domEquals.bind(assert, div), assert.AssertionError,
						'The comparison between a node and undefined succeeded.');
				assert.domEquals(div, div, 'Same element comparison failed.');
				assert.throws(assert.domEquals.bind(assert, div, div.attributes), assert.AssertionError,
						'The comparison between two different node types succeeded.');

				var span1 = document.createElement('span');
				assert.throws(assert.domEquals.bind(assert, div, span1), assert.AssertionError,
						'The comparison between two elements of different node name succeeded.');
				
				var span2 = document.createElement('span');
				span1.id = 'id';
				assert.throws(assert.domEquals.bind(assert, span1, span2), assert.AssertionError,
						'The comparison between two elements with a different number of attributes succeeded.');
				
				span2.id = 'id';
				span1.appendChild(div);
				assert.throws(assert.domEquals.bind(assert, span1, span2), assert.AssertionError,
						'The comparison between two elements with a different number of children succeeded.');
				
				span2.appendChild(div);
				span1.className = 'class';
				span2.style.backgroundColor = 'red';
				assert.throws(assert.domEquals.bind(assert, span1, span2), assert.AssertionError,
						'The comparison between two elements with a different set of attributes succeeded.');
			});
			test('ELEMENT_NODE', function() {
				var div1 = document.createElement('div');
				div1.id = 'id';
				div1.className = 'cn1 cn2  ';
				var div2 = document.createElement('div');
				div2.id = 'id';
				div2.className = '  cn2  cn1';
				assert.domEquals(div1, div2, 'The comparison between two identical simple elements failed.');

				div2.className = '  cn2  cn1 cn3';
				assert.throws(assert.domEquals.bind(assert, div1, div2), assert.AssertionError,
						'The comparison between two elements with different classes succeeded.');
				div2.className = '  cn2  cn1';

				div1.innerHTML = '<span>text</span><span>text</span>';
				div2.innerHTML = '<span>text</span><span>text</span>';
				assert.domEquals(div1, div2, 'The comparison between two identical elements with children failed.');

				div2.innerHTML = '<span>text2</span><span>text</span>';
				assert.throws(assert.domEquals.bind(assert, div1, div2), assert.AssertionError,
						'The comparison between two elements with different children succeeded.');

				div1.innerHTML = '<span style="background-color: red">text</span><span>text</span>';
				div2.innerHTML = '<span style="background-color: red">text</span><span>text</span>';
				assert.domEquals(div1, div2,
						'The comparison between two identical elements with a style attribute failed.');

				div2.innerHTML = '<span style="background-color: yellow">text</span><span>text</span>';
				assert.throws(assert.domEquals.bind(assert, div1, div2), assert.AssertionError,
						'The comparison between two elements with an different style attributes succeeded.');

				var div;
				try {
					div = document.createElement('div');
					
					var nbScript = div.getElementsByTagName('script').length;
					div.innerHTML = div.innerHTML + '<span>Fuck IE7 and IE8</span>\n<script>alert("test")</script>'  +
						'\n<script>alert("test")</script> \n <script>alert("test2")</script>';
					document.body.appendChild(div);
					var scripts = div.getElementsByTagName('script');
					var script1 = scripts[nbScript];
					var script2 = scripts[nbScript + 1];
					var script3 = scripts[nbScript + 2];
					assert.domEquals(script1, script2, 'The comparison between two identical scripts failed.');
					
					assert.throws(assert.domEquals.bind(assert, script1, script3), assert.AssertionError,
							'The comparison between two scripts with different source code succeeded.');
				} finally {
					div.parentNode.removeChild(div);
				}
			});
			
			test('TEXT_NODE', function() {
				var elt = document.createTextNode('test');
				var elt2 = document.createTextNode('test');
				assert.domEquals(elt, elt2, 'The comparison between two identical text nodes failed.');
				
				elt2 = document.createTextNode('test2');
				assert.throws(assert.domEquals.bind(assert, elt, elt2), assert.AssertionError,
						'The comparison between two text nodes with different texts succeeded.');
			});
			
			test('COMMENT_NODE', function() {
				var elt = document.createComment('test');
				var elt2 = document.createComment('test');
				assert.domEquals(elt, elt2, 'The comparison between two identical comments failed.');
				
				elt2 = document.createComment('test2');
				assert.throws(assert.domEquals.bind(assert, elt, elt2), assert.AssertionError,
						'The comparison between two comments with different texts succeeded.');
			});
			
			test('DOCUMENT_TYPE_NODE', function() {
				var iframe1, iframe2, iframe3, iframe4;
				var idocument;
				try {
					iframe1 = document.createElement('iframe');
					iframe1.name = 'iframe';
					document.body.appendChild(iframe1);
					if (iframe1.contentDocument) {
						idocument = iframe1.contentDocument;
					} else {	// IE7 specific
						idocument = iframe1.contentWindow.document;
					}
					idocument.open();
					idocument.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" ' +
							'"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">' +
							'<html><head></head><body>this is the iframe</body></html>');
					idocument.close();
					
					iframe2 = document.createElement('iframe');
					iframe2.name = 'iframe';
					document.body.appendChild(iframe2);
					if (iframe2.contentDocument) {
						idocument = iframe2.contentDocument;
					} else {	// IE7 specific
						idocument = iframe2.contentWindow.document;
					}
					idocument.open();
					idocument.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" ' +
							'"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">' +
							'<html><head></head><body>this is the iframe</body></html>');
					idocument.close();
					
					assert.domEquals(iframe1, iframe2, 'The comparison between two identical iframes failed.');

					iframe3 = document.createElement('iframe');
					iframe3.name = 'iframe';
					document.body.appendChild(iframe3);
					if (iframe3.contentDocument) {
						idocument = iframe3.contentDocument;
					} else {	// IE7 specific
						idocument = iframe3.contentWindow.document;
					}
					idocument.open();
					idocument.write('<!DOCTYPE html><html><head></head><body>this is the iframe</body></html>');
					idocument.close();

					assert.throws(assert.domEquals.bind(assert, iframe1, iframe3), assert.AssertionError,
							'The comparison between two iframes with different doctypes succeeded.');
					
					iframe4 = document.createElement('iframe');
					iframe4.name = 'iframe';
					document.body.appendChild(iframe4);
					if (iframe4.contentDocument) {
						idocument = iframe4.contentDocument;
					} else {	// IE7 specific
						idocument = iframe4.contentWindow.document;
					}
					idocument.open();
					idocument.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" ' +
							'"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">' +
							'<html><head></head><body>this is a different iframe</body></html>');
					idocument.close();

					assert.throws(assert.domEquals.bind(assert, iframe1, iframe4), assert.AssertionError,
							'The comparison between two iframes with different bodies succeeded.');
				} finally {
					if (iframe1) iframe1.parentNode.removeChild(iframe1);
					if (iframe2) iframe2.parentNode.removeChild(iframe2);
					if (iframe3) iframe3.parentNode.removeChild(iframe3);
					if (iframe4) iframe4.parentNode.removeChild(iframe4);
				}
			});
			
		});
	});
});
