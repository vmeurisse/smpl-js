if (typeof define !== 'function') {var define = require('amdefine')(module)}
/**
 * @module smpl
 * @submodule smpl.object
 * @class smpl.object
 * @static
 */
define(['./smpl.core'], function(smpl) {
	smpl.object = {};
	
	smpl.object.update = function(receiver, updater) {
		for (var p in updater) {
			receiver[p] = updater[p];
		}
		return receiver;
	};
	
	smpl.object.extend = function(receiver, extender) {
		for (var p in extender) {
			if (!receiver.hasOwnProperty(p)) {
				receiver[p] = extender[p];
			}
		}
		return receiver;
	};
	
	return smpl;
});