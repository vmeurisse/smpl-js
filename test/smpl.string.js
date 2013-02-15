if (typeof define !== 'function') {var define = require('amdefine')(module)}
define(['../src/assert', '../src/smpl.string'], function(assert, smpl) {

	suite('smpl.string', function() {
		suite('supplant', function() {
			test('supplant', function() {
				assert.equals(smpl.string.supplant('{a}{b}', {a: 1}), '1{b}');
				assert.equals(smpl.string.supplant(' {0} {1} ', [2, 1]), ' 2 1 ');
			});
		});
		suite('startsWith', function() {
			test('starts with', function() {
				assert(smpl.string.startsWith('abc', ''));
				assert(smpl.string.startsWith('abc', 'ab'));
				assert(smpl.string.startsWith('abc', 'abc'));
			});
			test("don't starts with", function() {
				assert(!smpl.string.startsWith('abc', 'abcd'));
				assert(!smpl.string.startsWith('abc', 'bc'));
				assert(!smpl.string.startsWith('abc', 'x'));
				assert(!smpl.string.startsWith('abc', ' '));
			});
		});
		suite('endsWith', function() {
			test('ends with', function() {
				assert(smpl.string.endsWith('abc', ''));
				assert(smpl.string.endsWith('abc', 'bc'));
				assert(smpl.string.endsWith('abc', 'abc'));
			});
			test("don't ends with", function() {
				assert(!smpl.string.endsWith('abc', 'zabc'));
				assert(!smpl.string.endsWith('abc', 'ab'));
				assert(!smpl.string.endsWith('abc', 'x'));
				assert(!smpl.string.endsWith('abc', ' '));
			});
		});
	});
});
