if (typeof define !== 'function') {var define = require('amdefine')(module)}
/**
 * @module assert
 * @class assert
 * @static
 */
define(['./smpl.data', './smpl.utils'], function(smpl) {
	
	var AssertionError = function AssertionError(options) {
		this.name = 'AssertionError';
		this.message = options.message;
		if (options.hasOwnProperty('actual')) {
			this.actual = smpl.utils.stringify(options.actual);
		}
		if (options.hasOwnProperty('expected')) {
			this.expected = smpl.utils.stringify(options.expected);
		}
		
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, options.stackStartFunction);
		}
	};
	
	AssertionError.prototype = Object.create(Error.prototype);
	AssertionError.prototype.constructor = AssertionError;
	
	AssertionError.prototype.toString = function() {
		if (this.message) {
			return [this.name + ':', this.message].join(' ');
		} else if (this.actual || this.expected) {
			var message = [this.name + ':'];
			if (this.actual) {
				message.push('actual - ' + this.actual);
			}
			if (this.expected) {
				message.push('expected - ' + this.expected);
			}
			return message.join(' ');
		} else {
			return this.name;
		}
	};
	
	function fail(message, actual, expected, stackStartFunction) {
		var options = {
			message: message
		};
		if (arguments.length === 2) {
			stackStartFunction = actual;
		} else if (arguments.length === 4) {
			options.actual = actual;
			options.expected = expected;
		}
		options.stackStartFunction = stackStartFunction || fail;
		
		throw new AssertionError(options);
	}
	
	/**
	 * Assert that a `value` is truthy. If the value is falsy, throw an `AssertionError`.
	 * 
	 * @method assert
	 * @static
	 * 
	 * @param {any} value        The value to test
	 * @param {String} message Message to be used in the `AssertionError`.
	 *                         If no message is provided, an automatic one will be used (optional)
	 */
	var assert = function(value, message) {
		if (!value) {
			if (!message) {
				message = 'Expected <' + smpl.utils.stringify(value) + '> to be truthy';
			}
			fail(message, assert);
		}
	};
	
	/**
	 * throw an `AssertionError`
	 * 
	 * @method fail
	 * 
	 * @param {String} message Message to be used in the `AssertionError`
	 */
	assert.fail = function(message) {
		fail(message, assert.fail);
	};
	
	/**
	 * Assert that `value` and `expected` are equals. Use `smpl.data.compare` to compare the values.
	 * 
	 * @method equals
	 * 
	 * @param {any} value        Value to test
	 * @param {any} expected     Expected value
	 * @param {String} message Message to be used in the `AssertionError`.
	 *                         If no message is provided, an automatic one will be used (optional)
	 */
	assert.equals = function(value, expected, message) {
		if (!smpl.data.compare(value, expected)) {
			fail(message, value, expected, assert.equals);
		}
	};
	
	var is = function(value, expected) {
		if (value === expected) {
			// We must take care that comparing 0 and -0 should return false;
			return (value !== 0 || 1 / value === 1 / expected);
		} else {
			// take care of the NaN value
			return (value !== value && expected !== expected);
		}
	};
	
	/**
	 * Assert that `value` and `expected` are the same.
	 * This is the same as the triple equal operator except that -0 and 0 are considered different and that NaN is NaN.
	 * 
	 * @method is
	 * 
	 * @param {any} value        Value to test
	 * @param {any} expected     Expected value
	 * @param {String} message Message to be used in the `AssertionError`.
	 *                         If no message is provided, an automatic one will be used (optional)
	 */
	assert.is = function(value, expected, message) {
		if (!is(value, expected)) {
			fail(message, value, expected, assert.equals);
		}
	};
	
	/**
	 * Assert that `value` and `expected` are not the same.
	 * This is the same as `!==` except that -0 and 0 are considered different and that NaN is NaN.
	 * 
	 * @method isNot
	 * 
	 * @param {any} value        Value to test
	 * @param {any} expected     Expected value
	 * @param {String} message Message to be used in the `AssertionError`.
	 *                         If no message is provided, an automatic one will be used (optional)
	 */
	assert.isNot = function(value, expected, message) {
		if (is(value, expected)) {
			fail(message, value, expected, assert.equals);
		}
	};
	
	/**
	 * Assert that a function throws an exception when called
	 * 
	 * @method throws
	 * 
	 * @param {Function} fn    Function to test
	 * @param {Function} type  Type of the expected exception. (optional)
	 * @param {String} message Message to be used in the `AssertionError`.
	 *                         If no message is provided, an automatic one will be used (optional)
	 * @return {Error} the error that was thrown
	 */
	assert.throws = function(fn, type, message) {
		if (typeof type === 'string') {
			message = type;
			type = null;
		}
		try {
			fn();
		} catch (e) {
			if (type && !(e instanceof type)) {
				fail(message || 'exception of wrong type thrown', assert.throws);
			}
			return e;
		}
		fail(message || 'Expected function to throw an error', assert.throws);
	};
	
	function asArray(list) {
		var array = [],
		    i = list.length;
		while (i--) array[i] = list[i];
		return array;
	}
	
	function getAttributes(node) {
		var attributes = asArray(node.attributes || []);
		var i = attributes.length;
		while (i--) {
			var name = attributes[i].name;
			if (name === 'class' || name === 'style') {
				attributes.splice(i, 1);
			}
		}
		return attributes;
	}
	
	function getAttribute(parent, name) {
		var attr = parent.getAttribute(name);
		if (typeof attr === 'function') attr = null; // IE7 Bug: `div.onclick = function() {}` is returned as attribute
		return attr;
	}
	
	function getElementClasses(e) {
		return e.className.trim().split(/\s+/).sort();
	}
	
	function compareClasses(a, b, stack) {
		var aClasses = getElementClasses(a).join(' ');
		var bClasses = getElementClasses(b).join(' ');
		if (aClasses !== bClasses) {
			var msg =  'Different classes at <' + stack + '>. Expected: <' + bClasses + '>, actual: <' + aClasses + '>';
			fail(msg, undefined, undefined, assert.domEquals);
		}
	}
	
	function processStyle(style) {
		var p = {};
		if (typeof style.length === 'number') {
			for (var i = 0; i < style.length; i++) {
				p[style[i]] = style.getPropertyValue(style[i]);
			}
		} else {// IE<=8
			for (var key in style) {
				p[key] = style[key];
			}
		}
		return p;
	}
	
	function compareSyle(a, b, stack) {
		var aStyle = a.style;
		var bStyle = b.style;
		
		aStyle = processStyle(aStyle || {});
		bStyle = processStyle(bStyle || {});
		
		if (!smpl.data.compare(aStyle, bStyle)) {
			var msg = 'Different style at <' + stack + '>. ' +
			          'Expected: <' + JSON.stringify(bStyle) + '>, actual: <' +  JSON.stringify(aStyle) + '>';
			fail(msg, undefined, undefined, assert.domEquals);
		}
	}
	
	function compareHTML(a, b, stack, parentA, parentB) {
		var msg;
		
		if (!a !== !b) {
			msg = 'Incorect node at  <' + stack + '>. Expected: <' + (b ? 'Object' : 'null') + '>, actual: <' +
			      (a ? 'Object' : 'null') + '>';
			fail(msg, undefined, undefined, assert.domEquals);
		}
		if (a === b) return;
		
		for (var key in {nodeType: 1, nodeName: 1, localName: 1, namespaceURI: 1, prefix: 1}) {
			if (a[key] !== b[key]) {
				msg = 'Incorect ' + key + ' at  <' + stack + '>. Expected: <' + b[key] + '>, actual: <' + a[key] + '>';
				fail(msg, undefined, undefined, assert.domEquals);
			}
		}
		
		switch (a.nodeType) {
			case 1: //ELEMENT_NODE
			case 9: //DOCUMENT_NODE
			case 11: //DOCUMENT_FRAGMENT_NODE
				stack += a.nodeName;
				
				if (a.value !== b.value) {
					msg = 'Incorect node value at  <' + stack + '>. Expected: <' + b.value + '>, actual: <' +
					      a.value + '>';
					fail(msg, undefined, undefined, assert.domEquals);
				}
				
				//Check attributes
				var aAttr = getAttributes(a); //[].slice is not working in IE
				var bAttr = getAttributes(b);
				if (aAttr.length !== bAttr.length) {
					msg = 'Incorect number of attributes at <' + stack + '>. Expected: <' + bAttr.length +
					      '>, actual: <' + aAttr.length + '>';
					fail(msg, undefined, undefined, assert.domEquals);
				}
				smpl.data.sort(aAttr, [{key: 'nodeName'}, {key: 'nodeValue'}]);
				smpl.data.sort(bAttr, [{key: 'nodeName'}, {key: 'nodeValue'}]);
				for (var i = 0; i < aAttr.length; i++) {
					compareHTML(aAttr[i], bAttr[i], stack, a, b);
				}
				
				if (a.className || b.classname) {
					compareClasses(a, b, stack);
				}
				compareSyle(a, b, stack);
				
				if ((a.contentWindow && a.contentWindow.document) || (b.contentWindow && b.contentWindow.document)) {
					//iframes
					compareHTML(a.contentWindow.document,  b.contentWindow.document);
				}
				
				if ('script' === a.nodeName.toLowerCase()) {
					if (a.innerHTML !== b.innerHTML) {
						msg = 'Incorect script content at <' + stack + '>. Expected: <' + b.innerHTML +
						      '>, actual: <' + a.innerHTML + '>';
						fail(msg, undefined, undefined, assert.domEquals);
					}
				}
				
				if (a.nodeType === 9 && (a.doctype || b.doctype)) {
					// In JSDom, the doctype is not in childNodes
					compareHTML(a.doctype, b.doctype);
				}
				
				//Check children
				if (a.nodeName.toLowerCase() !== 'textarea') {
					var aChildren = a.childNodes;
					var bChildren = b.childNodes;
					if (aChildren.length !== bChildren.length) {
						msg = 'Incorect number of children at <' + stack + '>. Expected: <' + bChildren.length +
						      '>, actual: <' + aChildren.length + '>';
						fail(msg, undefined, undefined, assert.domEquals);
					}
					for (var j = 0; j < aChildren.length; j++) {
						compareHTML(aChildren[j], bChildren[j], stack + ' ');
					}
				}
				return;
			case 2: //ATTRIBUTE_NODE
				// the classnames for a and b can be in a different order.
				if (a.name === 'class') {
					compareClasses(parentA, parentB, stack);
				}
				var attrA = getAttribute(parentA, a.name);
				var attrB = getAttribute(parentB, b.name);
				if (!smpl.data.compare(attrA, attrB)) {
					msg = 'Incorect attribute at <' + stack + '>. Expected: <' + b.name + '=' + attrB +
					      '>, actual: <' + a.name + '=' + attrA + '>';
					fail(msg, undefined, undefined, assert.domEquals);
				}
				return;
			case 3: //TEXT_NODE
				if (b.data !== a.data) {
					msg = 'Incorect text content at <' + stack + '>. Expected: <' + b.data +
					      '>, actual: <' + a.data + '>';
					fail(msg, undefined, undefined, assert.domEquals);
				}
				return;
			case 4: //CDATA_SECTION_NODE --- comment section
				msg = 'Comparison of CDATA_SECTION_NODE is not supported at <' + stack + '>';
				return fail(msg, undefined, undefined, assert.domEquals);
			case 5: //ENTITY_REFERENCE_NODE
				msg = 'Comparison of ENTITY_REFERENCE_NODE is not supported at <' + stack + '>';
				return fail(msg, undefined, undefined, assert.domEquals);
			case 6: //ENTITY_NODE
				msg = 'Comparison of ENTITY_NODE is not supported at <' + stack + '>';
				return fail(msg, undefined, undefined, assert.domEquals);
			case 7: //PROCESSING_INSTRUCTION_NODE
				msg = 'Comparison of PROCESSING_INSTRUCTION_NODE is not supported at <' + stack + '>';
				return fail(msg, undefined, undefined, assert.domEquals);
			case 8: //COMMENT_NODE
				if (b.data !== a.data) {
					msg = 'Incorect comment at <' + stack + '>. Expected: <' + b.data +
					      '>, actual: <' + a.data + '>';
					fail(msg, undefined, undefined, assert.domEquals);
				}
				return;
			case 10: //DOCUMENT_TYPE_NODE --- DOCTYPE
				for (key in {name: 1, publicId: 1, systemId: 1, internalSubset: 1}) {
					if (a[key] !== b[key]) {
						msg = 'Incorect doctype.' + key + ' at  <' + stack + '>. Expected: <' + b[key] +
						      '>, actual: <' + a[key] + '>';
						fail(msg, undefined, undefined, assert.domEquals);
					}
				}
				return;
			case 12: //NOTATION_NODE
				msg = 'Comparison of NOTATION_NODE is not supported at <' + stack + '>';
				return fail(msg, undefined, undefined, assert.domEquals);
		}
		msg = 'Comparison exception at <' + stack + '>.';
		fail(msg, undefined, undefined, assert.domEquals);
	}
	
	/**
	 * Assert that `value` and `expected` are two equivalent dom elements.
	 * 
	 * @method domEquals
	 * 
	 * @param value {Node} dom element to test.
	 * @param expected {Node} expected dom element.
	 * @param message {String} Message to be used in the `AssertionError`.
	 *                         If no message is provided, an automatic one will be used (optional)
	 */
	assert.domEquals = function(value, expected, message) {
		if (!message) return compareHTML(value, expected, '');
		try {
			compareHTML(value, expected, '');
		} catch (e) {
			fail(message, undefined, undefined, assert.domEquals);
		}
	};
	
	var contains = function(value, expected) {
		var expectedType = typeof expected;
		if (expectedType !== typeof value) return false;
		if (expectedType !== 'object' || expected === null || value === null) {
			return smpl.data.compare(value, expected);
		}
		if (Array.isArray(expected)) {
			for (var i = 0; i < expected.length; i++) {
				if (expected.hasOwnProperty(i)) {
					if (!contains(value[i], expected[i])) return false;
				}
			}
		} else {
			for (var key in expected) {
				if (!contains(value[key], expected[key])) return false;
			}
		}
		return true;
	};
	
	/**
	 * Assert that the `actual` object contains all the properties of the `expected` object.
	 * 
	 * Note that it doesn't matter if the property is part of the object or his prototype
	 * 
	 * ex: `assert.contains(obj, {a: 1})` will test that `obj` is an object and that `obj[a] === 1`.
	 * 
	 * @method contains
	 * 
	 * @param value {object} object to test
	 * @param expected {object} object to test
	 */
	assert.contains = function(value, expected, message) {
		if (!contains(value, expected)) {
			fail(message, undefined, undefined, assert.contains);
		}

	};
	
	assert.AssertionError = AssertionError;
	
	return assert;
});
