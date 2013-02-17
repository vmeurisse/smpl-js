define(['smpl/assert', 'smpl/smpl.data'], function(assert, smpl) {
	
	// The method smpl.data.compare is not tested here. It is already tested by `assert.equals`
	
	suite('smpl.data', function() {
		suite('updateObject', function() {
			test('updateObject', function() {
				assert.equals(smpl.data.updateObject({
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
		suite('extendObject', function() {
			test('extendObject', function() {
				assert.equals(smpl.data.extendObject({
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
		suite('filter', function() {
			test('filter', function() {
				assert.equals(smpl.data.filter([{o: 1, a: 1}, {o: 2, a: 2}, {o: 3, a: 1}], 'a', 1),
				              [{o: 1, a: 1}, {o: 3, a: 1}]);
			});
		});
		
		suite('get', function() {
			var obj = {
				a: {
					b: {
						c: 2,
						d: ''
					}
				}
			};
			
			/* Test that accessing existing values return the correct value */
			test('existing value', function() {
				assert.equals(smpl.data.get(obj, 'a.b.c'), 2);
				assert.equals(smpl.data.get(obj, ['a', 'b', 'c']), 2);
			});
			
			/* Test that accessing non existing values return `undefined` */
			test('non existing value', function() {
				// access non existing member of an object
				assert.equals(smpl.data.get(obj, 'a.b.e'), undefined);
				assert.equals(smpl.data.get(obj, ['a', 'b', 'e']), undefined);
				
				// access non existing member of truthy primitive
				assert.equals(smpl.data.get(obj, 'a.b.c.d'), undefined);
				assert.equals(smpl.data.get(obj, ['a', 'b', 'c', 'd']), undefined);
				
				// access non existing member of falsy primitive
				assert.equals(smpl.data.get(obj, 'a.b.d.e'), undefined);
				assert.equals(smpl.data.get(obj, ['a', 'b', 'd', 'e']), undefined);
			});
			
			/* Test that passing an empty array or string return the original object */
			test('no op', function() {
				assert.is(smpl.data.get(obj, ''), obj);
				assert.is(smpl.data.get(obj, []), obj);
			});
			
			
		});
		
		suite('sort', function() {
			var l1 = {
				a: 1,
				b: 1,
				c: 'a',
				d: 1
			};
			var l2 = {
				a: 2,
				c: 'Ba',
				d: 2
			};
			var l3 = {
				a: 3,
				b: 1,
				c: 'c',
				d: 1
			};
			var l = [l3, l2, l1];
			
			var testSort = function(result, sorters) {
				var list = l.slice();
				var reverse = result.slice().reverse();
				var sorted = smpl.data.sort(list, sorters);
				assert.is(sorted, list);
				assert.equals(sorted, result);
				
				sorted = smpl.data.sort(list, sorters, true);
				assert.is(sorted, list);
				assert.equals(sorted, reverse);
				
				// We should do a real test for stability here
				// However, it will fail if the sort method is not stable (like the one provided by V8)
				sorted = smpl.data.sort(list, sorters, true, true);
				assert.is(sorted, list);
				assert.equals(sorted, reverse);
			};
			test('single default', function() {
				var l = [5, 4, 3, 2, 1, 0];
				smpl.data.sort(l);
				assert.equals(l, [0, 1, 2, 3, 4, 5]);
			});
			test('single number', function() {
				testSort([l1, l2, l3], [{type: 'number', key: 'a'}]);
			});
			test('single text', function() {
				testSort([l1, l2, l3], [{type: 'text', key: 'c'}]);
			});
			test('single enum', function() {
				testSort([l3, l1, l2], [{type: 'enum', key: 'c', enumArray: ['c', 'a']}]);
			});
			test('reverse', function() {
				testSort([l2, l1, l3], [{type: 'enum', key: 'c', enumArray: ['c', 'a'], dir: -1}]);
			});
			test('multi key', function() {
				testSort([l1, l3, l2], [{key: 'b', type: 'number'}, {key: 'c'}]);
				testSort([l1, l3, l2], [{key: 'd'}, {key: 'c'}]);
			});
			test('equal values', function() {
				var list = l.slice();
				var sorted = smpl.data.sort(list, [{key: 'b', type: 'number'}]);
				assert.is(sorted[2], l2);
				assert((sorted[0] === l1 && sorted[1] === l3) || (sorted[0] === l3 && sorted[1] === l1));
			});
		});
	});
});
