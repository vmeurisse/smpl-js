define(['./smpl.core'], function(smpl) {
	smpl.dom = {};
	
	/**
	 * Test if a `HTMLElement` as a given class
	 * @param {HTMLElement} ele `HTMLElement` to test on
	 * @param {String} cls      class to test
	 * @return {Boolean} true if the `HTMLElement` has the class, false otherwise
	 */
	smpl.dom.hasClass = function (ele, cls) {
		return (' ' + ele.className + ' ').indexOf(' ' + cls + ' ') !== -1;
	};
	
	/**
	 * Add a class to a `HTMLElement`
	 * @param {HTMLElement} ele `HTMLElement` to add the class to
	 * @param {String} cls      class to add
	 * @return {Boolean} true if the class was added, false if it was already there
	 */
	smpl.dom.addClass = function (ele, cls) {
		if (!smpl.dom.hasClass(ele, cls)) {
			ele.className += ' ' + cls;
			return true;
		}
		return false;
	};
	
	/**
	 * Remove a class from a `HTMLElement`
	 * @param {HTMLElement} ele `HTMLElement` to remove the class from
	 * @param {String} cls      class to remove
	 * @return {Boolean} true if the class was removed, false if it was not there
	 */
	smpl.dom.removeClass = function (ele, cls) {
		var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)'),
			className = ele.className;
		ele.className = className.replace(reg, ' ');
		return ele.className !== className;
	};
	
	/**
	 * Toggle a class on a `HTMLElement`
	 * @param {HTMLElement} ele `HTMLElement` to toggle the class on
	 * @param {String} cls      class to toggle
	 * @return {Boolean} true if the class was added, false if it was removed
	 */
	smpl.dom.toggleClass = function (ele, cls) {
		if (!smpl.dom.removeClass(ele, cls)) {
			ele.className += " " + cls;
			return true;
		}
		return false;
	};

	smpl.dom.addEventListener = function(ele, ev, fn) {
		if (ele.addEventListener) {
			return ele.addEventListener(ev, fn);
		} else {
			return ele.attachEvent('on' + ev, function(e) {
				e = e || window.event;
				e.preventDefault  = e.preventDefault  || function(){ e.returnValue = false; };
				e.stopPropagation = e.stopPropagation || function(){ e.cancelBubble = true; };
				fn.call(ele, e);
			});
		}
	};
	
	/**
	 * Escape a string so that it is safe to include it in HTML
	 * @param {String} string string to escape
	 * @return {String} the escaped string
	 */
	smpl.dom.escapeHTML = function(string) {
		return String(string).replace(/&/g, '&amp;')
		                     .replace(/"/g, '&quot;')
		                     .replace(/'/g, '&#39;')
		                     .replace(/</g, '&lt;')
		                     .replace(/>/g, '&gt;');
	};
	return smpl;
});
