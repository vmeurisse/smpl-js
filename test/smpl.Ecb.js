if (typeof define !== 'function') {var define = require('amdefine')(module);}
define(['../assert', '../smpl.Ecb'], function(assert, smpl) {
	suite('smpl.Ecb', function() {
		'use strict';
		
		var ecb,
			calls,
			listeners = {},
			defaultScope,
			scopes = {};
		
		(function(){
			defaultScope = this;
		}).call(undefined);

		var getListener = function(key) {
			if (!listeners[key]) {
				listeners[key] = function() {
					calls.push({
						key: key,
						args: Array.prototype.slice.call(arguments),
						scope: this
					});
				};
			}
			return listeners[key];
		};
		
		var getScope = function(key) {
			if (!scopes[key]) {
				scopes[key] = {scope: key};
			}
			return scopes[key];
		};
		
		
		setup(function() {
			ecb = new smpl.Ecb();
			calls = [];
		});

			
		test('standard usage', function() {
			ecb.addListener('test', getListener('a'));
			ecb.fire('test');
			assert.equals(calls, [{key: 'a', args: ['test'], scope: defaultScope}]);
			ecb.removeListener('test', getListener('a'));
			ecb.fire('test');
			assert.equals(calls, [{key: 'a', args: ['test'], scope: defaultScope}]);
		});
		
		test('standard usage with scope', function() {
			ecb.addListener('test', getListener('a'), getScope('a'));
			ecb.fire('test');
			assert.equals(calls, [{key: 'a', args: ['test'], scope: getScope('a')}]);
			ecb.removeListener('test', getListener('a'), getScope('a'));
			ecb.fire('test');
			assert.equals(calls, [{key: 'a', args: ['test'], scope: getScope('a')}]);
		});
		
		test('fire with arguments', function() {
			ecb.addListener('test', getListener('a'));
			ecb.addListener('test', getListener('b'), getScope('b'));
			ecb.fire('test', 'with', 'some', 'arguments');
			assert.equals(calls, [
				{key: 'a', args: ['test', 'with', 'some', 'arguments'], scope: defaultScope},
				{key: 'b', args: ['test', 'with', 'some', 'arguments'], scope: getScope('b')}
			]);
		});
		
		test('removeListener', function() {
			var addListeners = function(key) {
				ecb.addListener(key, getListener(key));
				ecb.addListener(key, getListener(key + key));
				ecb.addListener(key, getListener(key), getScope(key));
				ecb.addListener(key, getListener(key), getScope(key + key));
				ecb.addListener(key, getListener(key + key), getScope(key + key));
			};
			var expectedCalls = [];
			
			addListeners('a');
			ecb.removeListener('a');
			ecb.fire('a');
			assert.equals(calls, expectedCalls);
			
			addListeners('b');
			ecb.removeListener('b', getListener('b'));
			expectedCalls.push({key: 'bb', args: ['b'], scope: defaultScope});
			expectedCalls.push({key: 'bb', args: ['b'], scope: getScope('bb')});
			ecb.fire('b');
			assert.equals(calls, expectedCalls);
			
			addListeners('c');
			ecb.removeListener('c', undefined, getScope('cc'));
			expectedCalls.push({key: 'c', args: ['c'], scope: defaultScope});
			expectedCalls.push({key: 'cc', args: ['c'], scope: defaultScope});
			expectedCalls.push({key: 'c', args: ['c'], scope: getScope('c')});
			ecb.fire('c');
			assert.equals(calls, expectedCalls);
			
			addListeners('d');
			ecb.removeListener('d', undefined, undefined);
			ecb.fire('d');
			assert.equals(calls, expectedCalls);
			
			ecb.removeListener('x');
			ecb.fire('x');
			assert.equals(calls, expectedCalls);
		});
		
		test('pause', function() {
			ecb.addListener('test', getListener('a'));
			ecb.pause();
			ecb.fire('test');
			assert.equals(calls, []);
			ecb.pause();
			ecb.resume();
			ecb.addListener('test', getListener('b'), getScope('a'));
			ecb.fire('test');
			assert.equals(calls, []);
			ecb.resume();
			
			assert.equals(calls, [
				{key: 'a', args: ['test'], scope: defaultScope},
				{key: 'b', args: ['test'], scope: getScope('a')},
				{key: 'a', args: ['test'], scope: defaultScope},
				{key: 'b', args: ['test'], scope: getScope('a')}
			]);
		});
		
		test('pause during resume', function() {
			var pause = function() {
				ecb.pause();
				ecb.fire('test');
			};
			var expectedCalls = [];
			
			ecb.pause();
			ecb.addListener('test', pause);
			ecb.addListener('test', getListener('a'));
			ecb.fire('test');
			assert.equals(calls, expectedCalls);
			
			ecb.resume();
			expectedCalls.push({key: 'a', args: ['test'], scope: defaultScope});
			assert.equals(calls, expectedCalls);
			
			ecb.resume();
			expectedCalls.push({key: 'a', args: ['test'], scope: defaultScope});
			assert.equals(calls, expectedCalls);
		});
		
		test('multiple resume', function() {
			// Resuming and not paused ecb should have no effect
			ecb.resume();
			ecb.resume();
			ecb.pause();
			ecb.addListener('test', getListener('a'));
			ecb.fire('test');
			assert.equals(calls, []);
			ecb.resume();
			assert.equals(calls, [{key: 'a', args: ['test'], scope: defaultScope}]);
		});
		
		test('reset', function() {
			ecb.addListener('test', getListener('a'));
			ecb.pause();
			
			ecb.reset();
			
			// Test that ecb is empty
			ecb.fire('test');
			assert.equals(calls, []);
			
			// Test that ecb is not paused
			ecb.addListener('test', getListener('b'));
			ecb.fire('test');
			assert.equals(calls, [{key: 'b', args: ['test'], scope: defaultScope}]);
		});
	});
});
