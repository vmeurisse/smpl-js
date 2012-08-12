define(['smpl.core'], function(smpl) {
	var data = smpl.data = {};

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
			return (this.isNumber && value == null) ? Infinity : value;
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
		};
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

	data.compare = function (o1, o2, deep) {
		if (o1 === o2) return true;
		if (typeof o1 !== 'object' || typeof o2 !== 'object') return false;
		if (!o1 || !o2) return false;
		var k1 = Object.keys(o1).sort(),
			k2 = Object.keys(o2).sort(),
			i = k1.length;
		if (k2.length != i) return false;
		while (i--) {
			var key = k1[i];
			if (k2[i] !== key) return false;
			if (deep && !data.compare(o1[key], o2[key], deep)) return false;
			if (!deep && o1[key] !== o2[key]) return false;
		}
		return true;
	};

	return smpl.data;
});

