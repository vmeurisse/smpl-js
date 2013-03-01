if (typeof define !== 'function') {var define = require('amdefine')(module)}
/**
 * @module smpl
 * @submodule smpl.data
 * @class smpl.data
 * @static
 */
define(['./smpl.core'], function(smpl) {
	smpl.data = smpl.data || {};
	
	smpl.data.updateObject = function(receiver, updater) {
		for (var p in updater) {
			receiver[p] = updater[p];
		}
		return receiver;
	};
	
	smpl.data.extendObject = function(receiver, extender) {
		for (var p in extender) {
			if (!receiver.hasOwnProperty(p)) {
				receiver[p] = extender[p];
			}
		}
		return receiver;
	};
	
	/**
	 * Filter an array of object. Each object is searched for the property whith the given value.
	 *
	 *     smpl.data.filter([{o:1,a:1},{o:2,a:2},{o:3,a:1}], 'a', 1) // => [{o:1,a:1},{o:3,a:1}]
	 *
	 * @method filter
	 * 
	 * @param {Array.<Object>} list The list to filter. The original list is not modified.
	 * @param {String} property The property to search in each object.
	 * @param {?} property The property to search in each object. Equality is tested using the === operator.
	 * @return {Array.<Object>} The filtered list.
	 */
	smpl.data.filter = function(list, property, value) {
		var filteredList = [];
		for (var i = 0; i < list.length; i++) {
			var item = list[i];
			if (item[property] === value) {
				filteredList.push(item);
			}
		}
		return filteredList;
	};
	
	 /**
	 * Sorter constructor to be used with `smpl.data.sort`.
	 * 
	 * @class smpl.data.Sorter
	 * @constructor
	 * 
	 * @param {Object} args
	 * @param {String} args.type            Type of the sorter. Default: 'default'. (optional). Supported values are:
	 *                                       - 'default': 
	 *                                       - 'number': 
	 *                                       - 'enum': Compare values against a given order. Not found items are put at
	 *                                                 the end.
	 *                                       - 'text': To compare text in a case insensitive maner
	 * @param {String} args.key             
	 * @param {Number} args.dir             
	 * @param {Array.<?>} args.enumArray    
	 */
	smpl.data.Sorter = function(sorter) {
		this.type = sorter.type;
		this.key = sorter.key;
		this.dir = sorter.dir || 1;
		this.enumArray = sorter.enumArray;
		
		this.isNumber = (sorter.type === 'number');
		this.isEnum = (sorter.type === 'enum');
		this.isText = (sorter.type === 'text');
		
		if (!this.key) {
			this.keys = [];
		} else {
			this.keys = (this.key.indexOf('.') > -1) ? this.key.split('.') : null;
		}
		
		this.enumMap = null;
		if (this.isEnum) {
			this.enumMap = {};
			for (var i = 0, l = this.enumArray.length; i < l; i++) {
				this.enumMap[this.enumArray[i]] = i + 1;
			}
		}
		
		this.needPreprocess = this.isNumber || this.isEnum || this.isText || this.keys;
		this.sortKey = false;
	};
	smpl.data.Sorter.prototype.sortValue = function(item) {
		var value = this.keys ? smpl.data.get(item, this.keys) : item[this.key];
		if (this.isEnum) {
			return this.enumMap[value] || Infinity;
		} else if (this.isText && value.toLocaleLowerCase) {
			return value.toLocaleLowerCase();
		} else {
			return (this.isNumber && (value === null || value === undefined)) ? Infinity : value;
		}
	};
	
	/**
	 * Sort an array of objects on the specified properties
	 * 
	 * @method sort
	 * 
	 * @param {Array<?>} list  the list of items to sort. The original list is modified
	 * @param {Array.<smpl.data.Sorter|Object>} sorters  the sorting criterias as an array of object:
	 * @param {Boolean} reverse  
	 * @param {Boolean} reversed  
	 * @return the sorted list.
	 */
	smpl.data.sort = function(list, sorters, reverse, reversed) {
		if (!sorters) sorters = [{}];
		if (!list.length || !sorters.length) return list;
		
		var sortList, transformed, originalList = list,
			single = (sorters.length === 1);
		smpl.data._prepareSorters(sorters);
		
		single = false;
		sortList = smpl.data._preprocessData(list, sorters, single);
		if (sortList) {
			transformed = true;
			list = sortList;
		}
		
		if (reversed) {
			// We reverse the list before to have a stable sort (if the browser provide a stable sort)
			list.reverse();
		}
		smpl.data._sorters = sorters;
		smpl.data._transformed = transformed;
		list.sort(smpl.data._sortMultipleKeys);

		if (reverse) {
			list.reverse();
		}
		if (transformed) {
			smpl.data._cleanData(originalList, list);
			list = originalList;
		}
		return list;
	};
	
	smpl.data._prepareSorters = function(sorters) {
		var needPreprocess = false;
		for (var i = 0, l = sorters.length; i < l; ++i) {
			var sorter = sorters[i];
			if (sorter.constructor === smpl.data.Sorter) {
				delete sorter.sortKey;
			} else {
				sorters[i] = sorter = new smpl.data.Sorter(sorter);
			}
			needPreprocess = needPreprocess || sorter.needPreprocess;
		}
		return needPreprocess;
	};
	
	smpl.data._preprocessData = function(list, sorters, force) {
		var sortList, m = list.length, initIndex;
		for (var i = 0, l = sorters.length; i < l; i++) {
			var sorter = sorters[i];
			if (sorter.needPreprocess || force) {
				sorter.sortKey = 'sorter' + i;
				var needInit = false;
				if (!sortList) {
					sortList = smpl.data.sortList;
					needInit = true;
					initIndex = sortList.length;
					sortList.length = m;
				}
				for (var j = 0; j < m; j++) {
					var item = list[j];
					if (needInit) {
						if (j >= initIndex) {
							sortList[j] = {
								item: item
							};
						} else {
							sortList[j].item = item;
						}
					}
					sortList[j][sorter.sortKey] = sorter.sortValue(item);
				}
			}
		}
		return sortList;
	};
	
	smpl.data.sortList = [];
	
	smpl.data._cleanData = function(originalList, sortedList) {
		for (var i = 0, l = originalList.length; i < l; i++) {
			originalList[i] = sortedList[i].item;
			sortedList[i].item = undefined; //Avoid memory leaks
		}
	};
	
	smpl.data._sortMultipleKeys = function(a, b) {
		var sorters = smpl.data._sorters, transformed = smpl.data._transformed;
		var sorter, va, vb;
		for (var i = 0, l = sorters.length; i < l; ++i) {
			sorter = sorters[i];
			if (sorter.sortKey) {
				va = a[sorter.sortKey];
				vb = b[sorter.sortKey];
			} else if (transformed) {
				va = a.item[sorter.key];
				vb = b.item[sorter.key];
			} else {
				va = a[sorter.key];
				vb = b[sorter.key];
			}
			if (va !== vb) {
				return (va < vb) ? -sorter.dir : sorter.dir;
			}
		}
		return 0;
	};
	
	/**
	 * Safe method to get recurcive values inside an object.
	 *
	 *     smpl.data.get({a:{b:{c:2}}}, 'a.b.c') // => 2
	 *     smpl.data.get({a:{b:{c:2}}}, ['a', 'b', 'c']) // => 2
	 *
	 * @method get
	 * 
	 * @param {Object} obj The object to search in.
	 * @param {String|Array.<String>} keys The keys to search in object. String and array notation are equivalent:
	 *                                     'a.b.c' <=> ['a', 'b', 'c']. Use array notation in performance critcal
	 *                                     sections as spliting the string as a performance inpact.
	 * @return The value or `undefined` if the value is not found.
	 */
	smpl.data.get = function(obj, keys) {
		if (typeof keys === 'string') {
			keys = (keys === '') ? [] : keys.split('.');
		}
		for (var i = 0, l = keys.length; i < l; i++) {
			if (obj) {
				obj = obj[keys[i]];
			} else {
				return undefined;
			}
		}
		return obj;
	};
	
	smpl.data.compare = function (a, b, stackA, stackB) {
		if (a === b) {
			// We must take care that comparing 0 and -0 should return false;
			return a !== 0 || 1 / a === 1 / b;
		}
		if (a !== a && b !== b) {
			// Test for NaN
			// NaN is the only value where x !== x
			// Don't use isNaN as isNaN('x') === true
			return true;
		}
		
		var stringA = Object.prototype.toString.call(a);
		if (stringA !== Object.prototype.toString.call(b)) {
			return false;
		}
		
		if (stringA === '[object RegExp]') {
			// We test for RegExp before using typeof as some implementation return 'function' instead of 'object'
			// (old chrome for exemple)
			return '' + a === '' + b;
		}
		
		if (typeof a !== 'object' || typeof b !== 'object') return false;
		if (!a || !b) return false; //a or b is null
		
		if (stringA === '[object Boolean]' || stringA === '[object Number]') {
			return smpl.data.compare(a.valueOf(), b.valueOf());
		}
		
		stackA  = stackA || [];
		stackB = stackB || [];
		
		var i = stackA.length;
		while (i--) {
			if (stackA[i] === a) {
				return stackB[i] === b;
			}
		}
		
		if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
			return false;
		}
		
		if (a.length !== b.length) {
			// Special case for arrays: the length property is not returned by Object.keys but as impact on the array
			return false;
		}

		
		var keysA = Object.keys(a).sort(),
		    keysB = Object.keys(b).sort();
		i  = keysA.length;
		if (keysB.length !== i) return false;
		
		while (i--) {
			if (keysA[i] !== keysB[i]) {
				return false;
			}
		}

		stackA.push(a);
		stackB.push(b);
	
		i = keysA.length;
		while (i--) {
			var key = keysA[i];
			if (!smpl.data.compare(a[key], b[key], stackA, stackB)) return false;
		}
		return true;
	};
	
	return smpl;
});

