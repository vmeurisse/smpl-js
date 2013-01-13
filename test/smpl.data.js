if (typeof define !== 'function') {var define = require('amdefine')(module);}
define(['../assert', '../smpl.data'], function(assert, smpl) {

	suite('smpl.data', function() {
		suite('get', function() {
			var obj = {
				a: {
					b: {
						c: 2
					}
				}
			};
			test('existing value', function() {
				assert.equals(smpl.data.get(obj, 'a.b.c'), 2);
				assert.equals(smpl.data.get(obj, ['a', 'b', 'c']), 2);
			});
			test('non existing value', function() {
				assert.equals(smpl.data.get(obj, 'a.b.c.d'), undefined);
				assert.equals(smpl.data.get(obj, ['a', 'b', 'c', 'd']), undefined);
			});
			test('no op', function() {
				assert.is(smpl.data.get(obj, ''), obj);
				assert.is(smpl.data.get(obj, []), obj);
			});
		});
	});
});
