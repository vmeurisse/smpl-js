define(['smplAssert/assert', 'smplObject/smpl.object'], function(assert, smpl) {
	suite('smpl.object', function() {
		test('dependencies', function() {
			assert.equals(Object.keys(smpl).sort(), ['global', 'object']);
		});
		
		suite('update', function() {
			test('update', function() {
				assert.equals(smpl.object.update({
					a: 1,
					c: 3
				}, {
					a: 2,
					b: 1
				}), {
					a: 2,
					b: 1,
					c: 3
				});
			});
		});
		suite('extend', function() {
			test('extend', function() {
				assert.equals(smpl.object.extend({
					a: 1,
					c: 3
				}, {
					a: 2,
					b: 1
				}), {
					a: 1,
					b: 1,
					c: 3
				});
			});
		});
	});
});