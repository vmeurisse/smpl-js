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
	
	var indent = function (array, level, chars) {
		if (!array.length) {
			return chars;
		}
		var inlevel = level + '\t';
		return chars.charAt(0) + '\n' + inlevel + array.join(',\n' + inlevel) + '\n' + level + chars.charAt(1);
	};
	
	var stringify = function(value, stringifyStack, level) {
		
		if (value === undefined || value === null) {
			return '' + value;
		}
		
		if (typeof value === 'number') {
			if (value === 0 && 1/value === -Infinity) {
				return '-0';
			}
			return value.toString();
		}
		
		if (typeof value === 'function' || value instanceof RegExp) {
			return value.toString();
		}
		
		if (typeof value === 'string' || typeof value === 'boolean') {
			return JSON.stringify(value);
		}
		
		var proto = Object.prototype.toString.call(value);
		if (proto === '[object Boolean]' || proto === '[object Number]' || proto === '[object String]') {
			return proto.slice(8, -1) + '(' + stringify(value.valueOf(), [], 0) + ')';
		}
		
		if (proto === '[object Date]') {
			return 'new Date("' + value.toString() + '")';
		}
		
		if (typeof value === 'object') {
			var i = stringifyStack.length;
			while (i--) {
				if (stringifyStack[i] === value) {
					return 'circular reference';
				}
			}
			stringifyStack.push(value);
			
			if (Array.isArray(value)) {
				var cleanArray = [];
				var lastIndex = -1;
				for (var k in value) {
					var index = +k;
					if (!isNaN(index)) { //skip stupid non-array values stored in array. (eg. var a = []; a.stupid = true;)
						if (index > lastIndex + 1) {
							cleanArray.push('undefined x ' + (index - lastIndex - 1));
						}
						cleanArray.push(stringify(value[k], stringifyStack, level + '\t'));
						lastIndex = index;
					}
				}
				if (lastIndex < value.length - 1) {
					cleanArray.push('undefined x ' + (value.length - lastIndex - 1));
				}
				return indent(cleanArray, level, '[]')
			} else {
				var str = [];
				var keys = Object.keys(value).sort(); //Make sure we get reproducible results
				for (var i = 0, l = keys.length; i < l; i++) {
					var k = keys[i];
					var v = stringify(value[k], stringifyStack, level + '\t');
					str.push(JSON.stringify(k) + ': ' + v);
				}
				return indent(str, level, '{}')
			}
		}
		return '' + value;
	};
	smpl.utils.stringify = function(object) {
		return stringify(object, [], '');
	};
	
	return smpl;
});