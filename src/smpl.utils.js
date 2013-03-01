if (typeof define !== 'function') {var define = require('amdefine')(module)}
/**
 * @module smpl
 * @submodule smpl.utils
 * @class smpl.utils
 * @static
 */
define(['./smpl.core'], function(smpl) {
	smpl.utils = {};

	/**
	* simple method to get a unique number
	* 
	* @method uniq
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
	
	var stringify = function(value, path, stringifyStack, level) {
		var i, k, l, str;
		
		var string = '<non js object>';
		
		if (value === undefined || value === null) {
			string = '' + value;
		} else if (typeof value === 'number') {
			if (value === 0 && 1 / value === -Infinity) {
				string = '-0';
			} else {
				string = value.toString();
			}
		} else if (typeof value === 'function' || value instanceof RegExp) {
			string =  value.toString();
		} else  if (typeof value === 'string' || typeof value === 'boolean') {
			string = JSON.stringify(value);
		} else if (typeof value === 'object') {
			var objectType = Object.prototype.toString.call(value).slice(8, -1);
			
			if (objectType === 'Boolean' || objectType === 'Number' || objectType === 'String') {
				string = objectType + '(' + stringify(value.valueOf(), '', [], 0) + ')';
			} else if (objectType === 'Date') {
				string = 'Date("' + value.toString() + '")';
			} else {
				i = stringifyStack.length;
				while (i--) {
					if (stringifyStack[i].value === value) {
						string = 'circular reference(' + stringifyStack[i].path + ')';
						break;
					}
				}
				
				if (i === -1) {
					stringifyStack = stringifyStack.slice();
					stringifyStack.push({
						path: path,
						value: value
					});
					
					if (objectType === 'Array' || objectType === 'Arguments') {
						var cleanArray = [];
						var lastIndex = -1;
						for (k in value) {
							var index = +k;
							//skip stupid non-array values stored in array. (eg. var a = []; a.stupid = true;)
							if (!isNaN(index) && value[k] !== undefined) {
								if (index > lastIndex + 1) {
									cleanArray.push('undefined x ' + (index - lastIndex - 1));
								}
								cleanArray.push(stringify(value[k], path + '[' + index + ']',
								                stringifyStack, level + '\t'));
								lastIndex = index;
							}
						}
						if (lastIndex < value.length - 1) {
							cleanArray.push('undefined x ' + (value.length - lastIndex - 1));
						}
						str = indent(cleanArray, level, '[]');
						if (objectType === 'Array') {
							string =  str;
						} else {
							string = objectType + '(' + str + ')';
						}
					} else {
						str = [];
						var keys = Object.keys(value).sort(); //Make sure we get reproducible results
						for (i = 0, l = keys.length; i < l; i++) {
							k = keys[i];
							if (k !== '__proto__') {
								var key = JSON.stringify(k);
								var v = stringify(value[k], path + '[' + key + ']', stringifyStack, level + '\t');
								str.push(key + ': ' + v);
							}
						}
						string = indent(str, level, '{}');
					}
				}
			}
		}
		return string;
	};
	smpl.utils.stringify = function(object) {
		return stringify(object, '$', [], '');
	};
	
	return smpl;
});