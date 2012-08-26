define(['./smpl.core'], function(smpl) {
	smpl.Ecb = function() {
		this.callbacks = {};
	};

	smpl.Ecb.prototype.addListener = function(event, fn, scope) {
		if (!this.callbacks[event]) {
			this.callbacks[event] = [];
		}
		this.callbacks[event].push({
			fn: fn,
			scope: scope
		});
	};
	
	smpl.Ecb.prototype.removeListener = function(event, fn, scope) {
		var callbacks = this.callbacks[event];
		if (!callbacks) {
			return false;
		}
		var i = callbacks.length;
		while (i--) {
			var cb = callbacks[i];
			if (cb.fn === fn && (arguments.length < 3 || cb.scope === scope)) {
				callbacks.splice(i, 1);
			}
		}
	};
	
	smpl.Ecb.prototype.fire = function(event) {
		var callbacks = this.callbacks[event];
		if (callbacks) {
			for (var i = 0, l = callbacks.length; i < l; i++) {
				var cb = callbacks[i];
				cb.fn.apply(cb.scope, arguments);
			}
		}
	};

	return smpl;
});