if (typeof define !== 'function') {var define = require('amdefine')(module)}
define(['../src/assert', '../src/smpl.number'], function(assert, smpl) {
	suite('smpl.number', function() {
		test('zeroPad', function() {
			assert.equals(smpl.number.zeroPad(0), '00');
			assert.equals(smpl.number.zeroPad(1), '01');
			assert.equals(smpl.number.zeroPad(10), '10');
			assert.equals(smpl.number.zeroPad(123), '123');
			assert.equals(smpl.number.zeroPad(123, 3), '123');
			assert.equals(smpl.number.zeroPad(123, 4), '0123');
		});
	});
});