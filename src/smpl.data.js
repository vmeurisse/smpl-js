define(['./smpl.core'], function(smpl) {
	var data = smpl.data = smpl.data || {};
	
	data.updateObject = function (receiver, updater){
		for(var p in updater) {
			receiver[p]=updater[p];
		}
	};
	
	data.extendObject = function(receiver, extender) {
		for (var p in extender) {
			if (!receiver.hasOwnProperty(p)) {
				receiver[p] = extender[p];
			}
		}
	};
	
	data.filter = function(list, property, value) {
		var filteredList = [];
		for (var i = 0, l = list.length; i < l; i++) {
			var item = list[i];
			if (item[property] === value) {
				filteredList.push(item);
			}
		}
		return filteredList;
	};
	
	data.Sorter = function(sorter) {
		this.type = sorter.type;
		this.key = sorter.key;
		this.dir = sorter.dir || 1;
		this.enumArray = sorter.enumArray;
		
		this.isNumber = (sorter.type === 'number');
		this.isEnum = (sorter.type === 'enum');
		this.isText = (sorter.type === 'text');
		
		this.isCompositeKey = (this.key.indexOf('.') > -1);
		this.keys = this.isCompositeKey ? this.key.split(".") : null;
		
		this.enumMap = null;
		if (this.isEnum) {
			this.enumMap = {};
			for (var i = 0, l = this.enumArray.length; i < l; i++) {
				this.enumMap[this.enumArray[i]] = i + 1;
			}
		}
		
		this.needPreprocess = this.isNumber || this.isEnum || this.isText || this.isCompositeKey;
		this.sortKey = false;
	};
	data.Sorter.prototype.sortValue = function(item) {
		var value = this.isCompositeKey ? data.get(item, this.keys) : item[this.key];
		if (this.isEnum) {
			return this.enumMap[value] || Infinity;
		} else if (this.isText && value.toLocaleLowerCase) {
			return value.toLocaleLowerCase();
		} else {
			return (this.isNumber && (value === null || value === undefined)) ? Infinity : value;
		}
	};
	
	data.SortItem = function(item) {
		this.item = item;
	};
	
	/**
	* Sort an array of objects on the specified properties
	* @param {Object[]} list  the list of object to sort
	* @param {array} sorters  the sorting criterias as an array of object:
	*           {string} key  the property the sort on
	*           {number} dir  the sort direction: ascending (1, default) or descending (-1)
	*/
	data.sort = function(list, sorters, reverse, reversed) {
		if (!list.length || !sorters.length) return list;
		
		var sortList, transformed, originalList = list,
			single = (sorters.length === 1);
		data._prepareSorters(sorters);
		
		single = false;
		sortList = data._preprocessData(list, sorters, single);
		if (sortList) {
			transformed = true;
			list = sortList;
		}
		if (single) {
			var sorter = sorters[0];
			
		} else {
			if (reverse && reversed) {
				// We reverse the list before to have a stable sort
				// (if the browser provide a stable sort)
				list.reverse();
			}
			console.time('sort');
			data._sorters = sorters;
			data._transformed = transformed;
			list.sort(data._sortMultipleKeys);
			console.timeEnd('sort');
		}
		if (reverse) {
			list.reverse();
		}
		if (transformed) {
			data._cleanData(originalList, list);
		}
		return list;
	};
	
	data._prepareSorters = function(sorters) {
		var needPreprocess = false;
		for (var i = 0, l = sorters.length; i < l; ++i) {
			var sorter = sorters[i];
			if (sorter.constructor === data.Sorter) {
				delete sorter.sortKey;
			} else {
				sorters[i] = sorter = new data.Sorter(sorter);
			}
			needPreprocess = needPreprocess || sorter.needPreprocess;
		}
		return needPreprocess;
	};
	
	data._preprocessData = function(list, sorters, force) {
		var sortList, m = list.length, initIndex;
		for (var i = 0, l = sorters.length; i < l; i++) {
			var sorter = sorters[i];
			if (sorter.needPreprocess || force) {
				sorter.sortKey = 'sorter' + i;
				var needInit = false;
				if (!sortList) {
					sortList = data.sortList;
					needInit = true;
					initIndex = sortList.length;
					sortList.length = m;
				}
				for (var j = 0; j < m; j++) {
					var item = list[j];
					if (needInit) {
						if (i > initIndex) {
							sortList[j] = new data.SortItem(item);
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
	
	data.sortList = [];
	
	data._cleanData = function(originalList, sortedList) {
		for (var i = 0, l = originalList.length; i < l; i++) {
			originalList[i] = sortedList[i].item;
			delete sortedList[i].item;
		}
	};
	
	data._sortNumbers = function(a, b) {
		var va = a.sorter0;
		var vb = b.sorter0;
		return (va === vb) ? 0 : ((va < vb) ? -1 : 1);
	};
	
	data._sortMultipleKeys = function(a, b) {
		var sorters = data._sorters, transformed = data._transformed;
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
	
	data.get = function(obj, keys) {
		if (typeof keys === 'string') {
			keys = keys.split('.');
		}
		for (var i = 0, l = keys.length; i < l; i++) {
			if (obj) {
				obj = obj[keys[i]];
			}
		}
		return obj;
	};
	
	data.compare = function (a, b, stackA, stackB) {
		if (a === b) {
			// We must take care that comparing 0 and -0 should return false;
			return a !== 0 || 1 / a == 1 / b;
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
			return '' + a === '' + b;
		}
		
		if (typeof a !== 'object' || typeof b !== 'object') return false;
		if (!a || !b) return false;
		
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
			if (!data.compare(a[key], b[key], stackA, stackB)) return false;
		}
		return true;
	};
	
	return smpl;
});

