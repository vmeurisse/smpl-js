define(['./smpl.core'], function(smpl) {
	smpl.string = {};
	
	smpl.string.supplant = function(string, object) {
		return string.replace(/\{(\w+)\}/g, function(a, key) {
			var replacer = object[key];
			return (replacer !== undefined) ? replacer : key;
		});
	};
	
	smpl.string.startsWith = function(string, start) {
		return string.substr(0, start.length) === start;
	};
	return smpl;
});
