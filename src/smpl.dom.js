define(['./smpl.core'], function(smpl) {
	smpl.dom = {};

	smpl.dom.hasClass = function (ele, cls) {
		return (' ' + ele.className + ' ').indexOf(' ' + cls + ' ') !== -1;
	};
	
	smpl.dom.addClass = function (ele, cls) {
		if (!smpl.dom.hasClass(ele, cls)) {
			ele.className += ' ' + cls;
			return true;
		}
		return false;
	};
	
	smpl.dom.removeClass = function (ele, cls) {
		var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)'),
			className = ele.className;
		ele.className = className.replace(reg, ' ');
		return ele.className !== className;
	};

	smpl.dom.toggleClass = function (ele, cls) {
		if (!smpl.dom.removeClass(ele, cls)) {
			ele.className += " " + cls;
		}
	};

	smpl.dom.addEventListener = function(ele, ev, fn) {
		if (ele.addEventListener) {
			return ele.addEventListener(ev, fn);
		} else {
			return ele.attachEvent('on' + ev, function(e) {
				var e = e || window.event;
				e.preventDefault  = e.preventDefault  || function(){ e.returnValue = false };
				e.stopPropagation = e.stopPropagation || function(){ e.cancelBubble = true };
				fn.call(ele, e);
			});
		}
	};
	
	return smpl;
});