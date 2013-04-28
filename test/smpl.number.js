define(['smplAssert/assert', 'smplNumber/smpl.number'], function(assert, smpl) {
	suite('smpl.number', function() {
		test('dependencies', function() {
			assert.equals(Object.keys(smpl).sort(), ['global', 'number']);
		});
		test('zeroPad', function() {
			assert.equals(smpl.number.zeroPad(0), '00');
			assert.equals(smpl.number.zeroPad(1), '01');
			assert.equals(smpl.number.zeroPad(10), '10');
			assert.equals(smpl.number.zeroPad(123), '123');
			assert.equals(smpl.number.zeroPad(123, 3), '123');
			assert.equals(smpl.number.zeroPad(123, 4), '0123');
		});
		
		test('constrain', function() {
			assert.equals(smpl.number.constrain(0, 1, 2), 1);
			assert.equals(smpl.number.constrain(1, 1, 2), 1);
			assert.equals(smpl.number.constrain(1.5, 1, 2), 1.5);
			assert.equals(smpl.number.constrain(2, 1, 2), 2);
			assert.equals(smpl.number.constrain(3, 1, 2), 2);
			assert.equals(smpl.number.constrain(3, 0, 0), 0);
		});
		
		test('randomInt', function() {
			var realRandom = Math.random;
			
			var random = 0; //Yeah love it!!!
			Math.random = function() {
				return random;
			};
			
			var result = [];
			var expected = [];
			var max = 100;
			
			for (var i = 0; i < max; i++) {
				result[i] = 0;
				expected[i] = 999;
			}
			for (i = 0; i < 100000; i++) {
				
				if (i % 1000 === 0) continue; //Avoid problematic values. eg. 0.28 * 100 !== 29
				
				random = i / 100000;
				result[smpl.number.randomInt(0, max)]++;
			}
			
			assert.equals(expected, result);
			
			Math.random = realRandom;
		});
	});
});
