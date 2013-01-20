if (typeof define !== 'function') {var define = require('amdefine')(module)}
define(['../assert', '../smpl.string'], function(assert, smpl) {

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
});
