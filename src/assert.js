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
			if (attributes[i].name === 'class') {
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
	
	function compareClasses(a, b) {
		var aClasses = a.className.trim().split(/\s+/).sort().join(' ');
		var bClasses = b.className.trim().split(/\s+/).sort().join(' ');
		return aClasses === bClasses;
	}
	
	function compareHTML(a, b, parentA, parentB) {
		if (!a !== !b) return false;
		if (a === b) return true;
		if (a.nodeType !== b.nodeType) return false;
		if (a.nodeName !== b.nodeName) return false;
		if (a.localName !== b.localName) return false;
		if (a.namespaceURI !== b.namespaceURI) return false;
		if (a.prefix !== b.prefix) return false;
		
		// Actual compare
		switch (a.nodeType) {
			case 1: //ELEMENT_NODE
			case 9: //DOCUMENT_NODE
			case 11: //DOCUMENT_FRAGMENT_NODE
				if (a.value !== b.value) return false;
				
				//Check attributes
				var aAttr = getAttributes(a); //[].slice is not working in IE
				var bAttr = getAttributes(b);
				if (aAttr.length !== bAttr.length) return false;
				smpl.data.sort(aAttr, [{key: 'nodeName'}, {key: 'nodeValue'}]);
				smpl.data.sort(bAttr, [{key: 'nodeName'}, {key: 'nodeValue'}]);
				for (var i = 0; i < aAttr.length; i++) {
					if (!compareHTML(aAttr[i], bAttr[i], a, b)) return false;
				}
				
				if (a.className || b.classname) {
					if (!compareClasses(a, b)) return false;
				}
				
				if (a.contentDocument) { //iframes
					if (!compareHTML(a.contentDocument, b.contentDocument)) return false;
				}
				if (a.contentWindow && a.contentWindow.document) { //iframes for IE7
					if (!compareHTML(a.contentWindow.document, b.contentWindow.document)) return false;
				}
				
				if ('script' === a.nodeName.toLowerCase()) {
					if (a.innerHTML !== b.innerHTML) return false;
				}
				
				if (a.nodeType === 9 && a.doctype) {
					// In JSDom, the doctype is not in childNodes
					if (!compareHTML(a.doctype, b.doctype)) return false;
				}
				
				//Check children
				if (a.nodeName.toLowerCase() !== 'textarea') {
					var aChildren = a.childNodes;
					var bChildren = b.childNodes;
					if (aChildren.length !== bChildren.length) return false;
					for (var j = 0; j < aChildren.length; j++) {
						if (!compareHTML(aChildren[j], bChildren[j])) return false;
					}
				}
				break;
			case 2: //ATTRIBUTE_NODE
				// the classnames for a and b can be in a different order.
				if (a.name === 'class') {
					if (!compareClasses(parentA, parentB)) return false;
				}
				return smpl.data.compare(getAttribute(parentA, a.name), getAttribute(parentB, b.name));
			case 3: //TEXT_NODE
				return a.data === b.data;
			case 4: //CDATA_SECTION_NODE --- comment section
				throw 'node of type CDATA_SECTION_NODE not supported.';
			case 5: //ENTITY_REFERENCE_NODE
				throw 'node of type ENTITY_REFERENCE_NODE not supported.';
			case 6: //ENTITY_NODE
				throw 'node of type ENTITY_NODE not supported.';
			case 7: //PROCESSING_INSTRUCTION_NODE
				throw 'node of type PROCESSING_INSTRUCTION_NODE not supported.';
			case 8: //COMMENT_NODE
				return a.data === b.data;
			case 10: //DOCUMENT_TYPE_NODE --- DOCTYPE
				return a.name === b.name &&
				       a.publicId === b.publicId &&
				       a.systemId === b.systemId &&
				       a.internalSubset === b.internalSubset;
			case 12: //NOTATION_NODE
				throw 'node of type NOTATION_NODE not supported.';
		}
		return true;
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
		if (!compareHTML(value, expected)) {
			// fail breaks in IE with a value or an expected
			fail(message, undefined, undefined, assert.domEquals);
		}
	};
	
	assert.AssertionError = AssertionError;
	
	return assert;
});
