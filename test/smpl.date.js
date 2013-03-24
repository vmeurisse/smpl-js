define(['smplAssert/assert', 'smplDate/smpl.date'], function(assert, smpl) {
	suite('smpl.date', function() {
		
		test('dependencies', function() {
			assert.equals(Object.keys(smpl).sort(), ['date', 'global']);
		});
		
		test('diff', function() {
			assert.equals(smpl.date.diff(new Date(2001, 0, 1), new Date(2001, 0, 1)), 0);
			assert.equals(smpl.date.diff(new Date(2001, 0, 1), new Date(2002, 0, 1)), 365);
			assert.equals(smpl.date.diff(new Date(2004, 0, 1), new Date(2005, 0, 1)), 366);
			assert.equals(smpl.date.diff(new Date(2000, 0, 1, 23, 59, 59, 999), new Date(2000, 0, 2)), 1);
			assert.equals(smpl.date.diff(new Date(2000, 0, 1), new Date(2000, 0, 2, 23, 59, 59, 999)), 1);
			assert.equals(smpl.date.diff(new Date(2000, 0, 2, 23, 59, 59, 999), new Date(2000, 0, 1)), -1);
		});
		
		test('shift', function() {
			var date = new Date(2000, 0, 1);
			var ret = smpl.date.shift(date, 0);
			assert.is(date, ret);
			assert.equals(new Date(2000, 0, 1).getTime(), date.getTime());
			
			ret = smpl.date.shift(date, 1);
			assert.is(date, ret);
			assert.equals(new Date(2000, 0, 2).getTime(), date.getTime());
			
			ret = smpl.date.shift(date, -2);
			assert.is(date, ret);
			assert.equals(new Date(1999, 11, 31).getTime(), date.getTime());
		});
		
		test('shiftMonth', function() {
			var date = new Date(2000, 0, 31);
			var ret = smpl.date.shiftMonth(date, 0);
			assert.is(date, ret);
			assert.equals(new Date(2000, 0, 31).getTime(), date.getTime());
			
			ret = smpl.date.shiftMonth(date, 1);
			assert.is(date, ret);
			assert.equals(new Date(2000, 1, 29).getTime(), date.getTime());
			
			ret = smpl.date.shiftMonth(date, 1);
			assert.is(date, ret);
			assert.equals(new Date(2000, 2, 29).getTime(), date.getTime());
			
			ret = smpl.date.shiftMonth(date, -3);
			assert.is(date, ret);
			assert.equals(new Date(1999, 11, 29).getTime(), date.getTime());
		});
		
		test('clone', function() {
			var date = new Date();
			var clone = smpl.date.clone(date);
			
			// The return date is realy a copy
			assert.isNot(date, clone);
			
			// Both dates are equals
			assert.equals(date.getTime(), clone.getTime());
		});
		
		test('lastDayOfMonth', function() {
			var lastDayOfMonth = function(date, expected) {
				var dateMs = date.getTime();
				var last = smpl.date.lastDayOfMonth(date);
				
				// smpl.date.lastDayOfMonth should return a copy
				assert.isNot(date, last);
				
				// smpl.date.lastDayOfMonth should not touch the original date
				assert.equals(dateMs, date.getTime());
				
				// test for result correctness
				assert.equals(expected.getTime(), last.getTime());
			};
			
			lastDayOfMonth(new Date(2000, 0, 1), new Date(2000, 0, 31));
			lastDayOfMonth(new Date(2000, 1, 1), new Date(2000, 1, 29));
			lastDayOfMonth(new Date(2001, 1, 1), new Date(2001, 1, 28));
		});
	});
});
