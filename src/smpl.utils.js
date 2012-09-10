define(['./smpl.core'], function(smpl) {
	smpl.utils = {};

	/**
	* simple method to get a unique number
	*/
	smpl.utils.uniq = function() {
		smpl.utils.uniq.last = smpl.utils.uniq.last + 1 || 1;
		return smpl.utils.uniq.last;
	};

	smpl.utils.escapeJs = function(str) {
		return str.replace(/\\/g, '\\\\')
				.replace(/\r\n/g, '\\n')
				.replace(/[\n\r\u2028\u2029]/g, '\\n\\\n')
				.replace(/'/g, "\\'")
				.replace(/"/g, '\\"')
				.replace(/\//g, '\\/');
	};
	
	var replacer = function(key, value) {
		if (value === undefined) {
			return '' + value;
		}
		if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
			return value.toString();
		}
		if (typeof value === 'function' || value instanceof RegExp) {
			return value.toString();
		}
		if (typeof value === 'object') {
			var i = stringifyStack.length;
			while (i--) {
				if (stringifyStack[i] === value) {
					return 'circular reference';
				}
			}
			stringifyStack.push(value);
		}
		if (Array.isArray(value)) {
			var cleanArray = [];
			var lastIndex = -1;
			for (var k in value) {
				var index = +k;
				if (!isNaN(index)) { //skip stupid non-array values stored in array. (eg. var a = []; a.stupid = true;)
					if (index > lastIndex + 1) {
						cleanArray.push('undefined x ' + (lastIndex - index));
					}
					cleanArray.push(smpl.utils.stringify(value[k], stringifyStack));
					lastIndex = index;
				}
			}
			if (lastIndex < value.length - 1) {
				cleanArray.push('undefined x ' + (value.length - lastIndex - 1));
			}
			return '[' + cleanArray.join(', ') + ']';
		}
		return value;
	};
	var stringifyStack = [];
	
	smpl.utils.stringify = function(object, stack) {
		stringifyStack = stack || [];
		return JSON.stringify(object, replacer, '\t');
	};
	
	return smpl;
});