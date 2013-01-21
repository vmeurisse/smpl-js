if (typeof define !== 'function') {var define = require('amdefine')(module)}
define(['../src/assert', '../src/smpl.dom'], function(assert, smpl) {
	/* jshint browser: true, node: true */
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		var jsdom = require('jsdom').jsdom;
		GLOBAL.document = jsdom();
		GLOBAL.window = document.createWindow();
	}
	suite('smpl.dom', function() {
		test('hasClass', function() {
			var elem = document.createElement('div');
			assert(!smpl.dom.hasClass(elem, 'test'));
			elem.className = 'test';
			assert(smpl.dom.hasClass(elem, 'test'));
			assert(!smpl.dom.hasClass(elem, 'tes'));
			assert(!smpl.dom.hasClass(elem, 'est'));
			assert(!smpl.dom.hasClass(elem, 'es'));
			
			elem.className = 'test1 test2';
			assert(smpl.dom.hasClass(elem, 'test1'));
			assert(smpl.dom.hasClass(elem, 'test2'));
			assert(!smpl.dom.hasClass(elem, 'test'));
			
			elem.className = 'test1 test2 test3';
			assert(smpl.dom.hasClass(elem, 'test2'));
		});
		
		test('addClass', function() {
			var elem = document.createElement('div');
			
			assert(smpl.dom.addClass(elem, 'test'));
			assert(smpl.dom.hasClass(elem, 'test'));
			
			assert(smpl.dom.addClass(elem, 'test2'));
			assert(smpl.dom.hasClass(elem, 'test2'));
			
			assert(smpl.dom.addClass(elem, 'test3'));
			assert(smpl.dom.hasClass(elem, 'test3'));

			assert(!smpl.dom.addClass(elem, 'test'));
			assert(!smpl.dom.addClass(elem, 'test2'));
			assert(!smpl.dom.addClass(elem, 'test3'));
			
			assert(!elem.className.match(/\btest\b.*\btest\b/));
			assert(!elem.className.match(/\btest2\b.*\btest2\b/));
			assert(!elem.className.match(/\btest3\b.*\btest3\b/));
		});
		
		test('removeClass', function() {
			var elem = document.createElement('div');
			
			assert(!smpl.dom.removeClass(elem, 'test'));
			assert.equals(elem.className, '');
			
			elem.className = 'test';
			assert(!smpl.dom.removeClass(elem, 'test2'));
			assert(!smpl.dom.removeClass(elem, 'es'));
			assert.equals(elem.className, 'test');
			
			elem.className = 'test1 test2 test3';
			assert(smpl.dom.removeClass(elem, 'test1'));
			assert(!smpl.dom.hasClass(elem, 'test1'));
			assert(smpl.dom.hasClass(elem, 'test2'));
			assert(smpl.dom.hasClass(elem, 'test3'));
			
			elem.className = 'test1 test2 test3';
			assert(smpl.dom.removeClass(elem, 'test2'));
			assert(smpl.dom.hasClass(elem, 'test1'));
			assert(!smpl.dom.hasClass(elem, 'test2'));
			assert(smpl.dom.hasClass(elem, 'test3'));
			
			elem.className = 'test1 test2 test3';
			assert(smpl.dom.removeClass(elem, 'test3'));
			assert(smpl.dom.hasClass(elem, 'test1'));
			assert(smpl.dom.hasClass(elem, 'test2'));
			assert(!smpl.dom.hasClass(elem, 'test3'));
			
			assert(smpl.dom.removeClass(elem, 'test1'));
			assert(smpl.dom.removeClass(elem, 'test2'));
			
			assert(elem.className.match(/^\s*$/));
		});
		
		test('toggleClass', function() {
			var elem = document.createElement('div');
			
			assert(smpl.dom.toggleClass(elem, 'test'));
			assert(smpl.dom.hasClass(elem, 'test'));
			assert(!smpl.dom.toggleClass(elem, 'test'));
			assert(!smpl.dom.hasClass(elem, 'test'));
			
			elem.className = 'test1 test2 test3';
			assert(!smpl.dom.toggleClass(elem, 'test2'));
			assert(!smpl.dom.hasClass(elem, 'test2'));
			assert(smpl.dom.toggleClass(elem, 'test2'));
			assert(smpl.dom.hasClass(elem, 'test2'));
		});
	});
});