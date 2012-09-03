var assert = require('../assert');
var smpl = require('../smpl.string');
suite('smpl.string', function() {
	suite('startsWith', function() {
		test('starts with', function() {
			assert(smpl.string.startsWith('abc', ''));
			assert(smpl.string.startsWith('abc', 'ab'));
			assert(smpl.string.startsWith('abc', 'abc'));
		});
		test('don\'t starts with', function() {
			assert(!smpl.string.startsWith('abc', 'abcd'));
			assert(!smpl.string.startsWith('abc', 'bc'));
			assert(!smpl.string.startsWith('abc', 'x'));
			assert(!smpl.string.startsWith('abc', ' '));
		});
	});
});
