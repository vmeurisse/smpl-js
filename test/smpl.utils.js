var assert = require('../assert');
var smpl = require('../smpl.utils');
suite('smpl.utils', function() {
	suite('stringify', function() {
		test('simple', function() {
			assert.equals(smpl.utils.stringify({}), '{}');
			assert.equals(smpl.utils.stringify([]), '[]');
			assert.equals(smpl.utils.stringify(''), '""');
			assert.equals(smpl.utils.stringify(1), '1');
			assert.equals(smpl.utils.stringify(-0), '-0');
			assert.equals(smpl.utils.stringify(), 'undefined');
			assert.equals(smpl.utils.stringify(null), 'null');
			assert.equals(smpl.utils.stringify(/s/g), '/s/g');
 			assert.equals(smpl.utils.stringify(new Date(0)), 'new Date("' + (new Date(0)).toString() + '")');
		});
		test('array', function() {
			assert.equals(smpl.utils.stringify([1, 2, "3"]), '[\n\t1,\n\t2,\n\t"3"\n]');
		});
		test('sparse array', function() {
			assert.equals(smpl.utils.stringify([undefined, undefined]), '[\n\tundefined,\n\tundefined\n]');
			var sparse = [];
			sparse[2] = 1;
			sparse[10] = undefined; //Test that manualy inserted values are not like missing ones
			sparse.length = 1000;
			sparse.badProperty = 'x';
			var sparseString = '[\n\tundefined x 2,\n\t1,\n\tundefined x 7,\n\tundefined,\n\tundefined x 989\n]';
			assert.equals(smpl.utils.stringify(sparse), sparseString);
		});
		test('object', function() {
			assert.equals(smpl.utils.stringify({a: 1, 2: 3}), '{\n\t"2": 3,\n\t"a": 1\n}');
			
			// We do not stringify the prototype
			var o = Object.create({a: 1});
			o.p = 'x';
			assert.equals(smpl.utils.stringify(o), '{\n\t"p": "x"\n}');
		});
		test('embed', function() {
			assert.equals(smpl.utils.stringify({a: {b: 1}}), '{\n\t"a": {\n\t\t"b": 1\n\t}\n}');
			assert.equals(smpl.utils.stringify([{a: 1}]), '[\n\t{\n\t\t"a": 1\n\t}\n]');
			assert.equals(smpl.utils.stringify({a: [1, 2]}), '{\n\t"a": [\n\t\t1,\n\t\t2\n\t]\n}');
			assert.equals(smpl.utils.stringify([[1, 2]]), '[\n\t[\n\t\t1,\n\t\t2\n\t]\n]');
		});
		test('typed wrapper', function() {
			// One advice: never ever use that !!!
			assert.equals(smpl.utils.stringify(new String('test')), 'String("test")');
			assert.equals(smpl.utils.stringify(new Number(7)), 'Number(7)');
			assert.equals(smpl.utils.stringify(new Boolean(true)), 'Boolean(true)');
		});
		test('circular', function() {
			var o = {};
			o.a = o;
			assert.equals(smpl.utils.stringify(o), '{\n\t"a": circular reference\n}');
		});
		test('arguments as array', function() {
			(function() {
				assert.equals(smpl.utils.stringify(arguments), '[\n\t1,\n\t2\n]');
			})(1, 2);
		});
	});
});
