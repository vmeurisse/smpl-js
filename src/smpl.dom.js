if (typeof define !== 'function') {var define = require('amdefine')(module)}
/**
 * @module smpl
 * @submodule smpl.dom
 * @class smpl.dom
 * @static
 */
define(['./smpl.core'], function(smpl) {
	smpl.dom = {};
	
	/**
	 * Test if a `HTMLElement` as a given class
	 *
	 * @method hasClass
	 * 
	 * @param {HTMLElement} ele `HTMLElement` to test on
	 * @param {String} cls      class to test
	 * @return {Boolean} true if the `HTMLElement` has the class, false otherwise
	 */
	smpl.dom.hasClass = function(ele, cls) {
		return (' ' + ele.className + ' ').indexOf(' ' + cls + ' ') !== -1;
	};
	
	/**
	 * Add a class to a `HTMLElement`
	 *
	 * @method addClass
	 * 
	 * @param {HTMLElement} ele `HTMLElement` to add the class to
	 * @param {String} cls      class to add
	 * @return {Boolean} true if the class was added, false if it was already there
	 */
	smpl.dom.addClass = function(ele, cls) {
		if (!smpl.dom.hasClass(ele, cls)) {
			ele.className += ' ' + cls;
			return true;
		}
		return false;
	};
	
	/**
	 * Remove a class from a `HTMLElement`
	 *
	 * @method removeClass
	 * 
	 * @param {HTMLElement} ele `HTMLElement` to remove the class from
	 * @param {String} cls      class to remove
	 * @return {Boolean} true if the class was removed, false if it was not there
	 */
	smpl.dom.removeClass = function(ele, cls) {
		var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)'),
			className = ele.className;
		ele.className = className.replace(reg, ' ');
		return ele.className !== className;
	};
	
	/**
	 * Toggle a class on a `HTMLElement`
	 *
	 * @method toggleClass
	 * 
	 * @param {HTMLElement} ele `HTMLElement` to toggle the class on
	 * @param {String} cls      class to toggle
	 * @return {Boolean} true if the class was added, false if it was removed
	 */
	smpl.dom.toggleClass = function(ele, cls) {
		if (!smpl.dom.removeClass(ele, cls)) {
			ele.className += ' ' + cls;
			return true;
		}
		return false;
	};
	
	/**
	 * Simple method to stop an event.
	 *
	 * @method stopEvent
	 */
	smpl.dom.stopEvent = function(e) {
		e.preventDefault();
		if (e.stopImmediatePropagation) {
			e.stopImmediatePropagation();
		} else {
			e.stopPropagation();
		}
	};
	
	smpl.dom.stopEventPropagation = function(e) {
		e.stopPropagation();
	};
	
	return smpl;
});
