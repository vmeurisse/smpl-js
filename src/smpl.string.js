define(['smpl.core'], function(smpl) {
	smpl.string = {};
	
	smpl.string.supplant = function(s, o) {
		return s.replace(/{(\w+)}/g, function(a, b) {
			var r = o[b];
			return (r !== undefined) ? r : a;
		});
	};
	return smpl.string;
});