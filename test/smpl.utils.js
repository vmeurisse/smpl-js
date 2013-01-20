if (typeof define !== 'function') {var define = require('amdefine')(module)}
define(['../src/assert', '../src/smpl.utils'], function(assert, smpl) {

	/**
	* Test the smpl.utils.js file
	*/
	suite('smpl.utils', function() {
		suite('uniq', function() {
			test('uniq', function() {
				var i = 100;
				var values = [];
				while (i--) {
					var u = smpl.utils.uniq();
					assert(typeof u === 'number' && isFinite(u) && Math.floor(u) >= 1,
					       'smpl.utils.uniq() should return positive int');
					values.push(u);
				}
				i = values.length;
				while (--i) {
					var j = i;
					while (j--) {
						assert(values[i] !== values[j], 'smpl.utils.uniq() should return unique values');
					}
				}
			});
		});
		
		suite('escapeJs', function() {
			test('escapeJs', function() {
				var escaped = smpl.utils.escapeJs('test\n\r\n\\\t\'"\u2028\u2029/');
				assert.equals(escaped, 'test\\n\\\n\\n\\\\\t\\\'\\"\\n\\\n\\n\\\n\\/');
			});
		});
		
		/**
		* Test the `smpl.utils.stringify` method
		*/
		suite('stringify', function() {
			/**
			* Basic test with simple object.
			*/
			test('simple', function() {
				assert.equals(smpl.utils.stringify({}), '{}');
				assert.equals(smpl.utils.stringify([]), '[]');
				assert.equals(smpl.utils.stringify(''), '""');
				assert.equals(smpl.utils.stringify(1), '1');
				assert.equals(smpl.utils.stringify(-0), '-0');
				assert.equals(smpl.utils.stringify(), 'undefined');
				assert.equals(smpl.utils.stringify(null), 'null');
				assert.equals(smpl.utils.stringify(/s/g), '/s/g');
				assert.equals(smpl.utils.stringify(new Date(0)), 'Date("' + (new Date(0)).toString() + '")');
			});
			
			/**
			* Test that arrays render correctly
			*/
			test('array', function() {
				assert.equals(smpl.utils.stringify([1, 2, '3']), '[\n\t1,\n\t2,\n\t"3"\n]');
			});
			
			/**
			* Test that [sparse arrays](http://en.wikipedia.org/wiki/Sparse_array) render correctly
			*/
			test('sparse array', function() {
				assert.equals(smpl.utils.stringify([undefined, undefined]), '[\n\tundefined x 2\n]');
				var sparse = [];
				sparse[2] = 1;
				sparse[10] = undefined; //Test that manualy inserted values are like missing ones
				sparse.length = 1000000000; //use something huge to test performence
				sparse.badProperty = 'x';
				var sparseString = '[\n\tundefined x 2,\n\t1,\n\tundefined x 999999997\n]';
				assert.equals(smpl.utils.stringify(sparse), sparseString);
			});
			
			/**
			* Test stringification of simple object and object with prototype
			*/
			test('object', function() {
				assert.equals(smpl.utils.stringify({a: 1, 2: 3}), '{\n\t"2": 3,\n\t"a": 1\n}');
				
				// We do not stringify the prototype
				var o = Object.create({a: 1});
				o.p = 'x';
				assert.equals(smpl.utils.stringify(o), '{\n\t"p": "x"\n}');
			});
			
			/**
			* Test stringification of object and arrays inside other objects.
			*/
			test('embed', function() {
				assert.equals(smpl.utils.stringify({a: {b: 1}}), '{\n\t"a": {\n\t\t"b": 1\n\t}\n}');
				assert.equals(smpl.utils.stringify([{a: 1}]), '[\n\t{\n\t\t"a": 1\n\t}\n]');
				assert.equals(smpl.utils.stringify({a: [1, 2]}), '{\n\t"a": [\n\t\t1,\n\t\t2\n\t]\n}');
				assert.equals(smpl.utils.stringify([[1, 2]]), '[\n\t[\n\t\t1,\n\t\t2\n\t]\n]');
			});
			
			/**
			* Test that typed wrappers are render differently that primitive types.
			* This wrapper are dangerous and should never be used. eg.: `true === !!new Boolean(false)`
			*/
			test('typed wrapper', function() {
				/* jshint -W053 */ //Allow bad constructors
				// One advice: never ever use that !!!
				assert.equals(smpl.utils.stringify(new String('test')), 'String("test")');
				assert.equals(smpl.utils.stringify(new Number(7)), 'Number(7)');
				assert.equals(smpl.utils.stringify(new Boolean(true)), 'Boolean(true)');
			});
			
			/**
			* Test that stringification of circular objects is working correctly.
			*/
			test('circular', function() {
				// Test correct detection of circular references
				var a = {};
				a.a = a;
				assert.equals(smpl.utils.stringify(a), '{\n\t"a": circular reference($)\n}');
				
				// Test for false positive
				var o = {};
				var b = [o, o];
				assert.equals(smpl.utils.stringify(b), '[\n\t{},\n\t{}\n]');
				
				// Test the reported path
				var c = {
					a: [0, 1, {}]
				};
				c.a[2].c = c.a[2];
				assert.equals(smpl.utils.stringify(c),
					'{\n\t"a": [\n\t\t0,\n\t\t1,\n\t\t{\n\t\t\t"c": circular reference($["a"][2])\n\t\t}\n\t]\n}');
			});
			
			
			test('arguments as array', function() {
				(function() {
					assert.equals(smpl.utils.stringify(arguments), 'Arguments([\n\t1,\n\t2\n])');
				})(1, 2);
			});
		});
	});
});
