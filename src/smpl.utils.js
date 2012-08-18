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
	
	return smpl;
});