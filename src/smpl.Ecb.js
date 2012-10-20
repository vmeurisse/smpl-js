define(['./smpl.core'], function(smpl) {
	'use strict';
	
	smpl.Ecb = function() {
		this.reset();
	};

	smpl.Ecb.prototype.reset = function() {
		this.callbacks = {};
		this.paused = 0;
		this.deferred = [];
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
			if ((fn === undefined || cb.fn === fn) && (scope === undefined || cb.scope === scope)) {
				callbacks.splice(i, 1);
			}
		}
	};
	
	smpl.Ecb.prototype.fire = function(event) {
		if (this.paused) {
			this.deferred.push(arguments);
		} else {
			var callbacks = this.callbacks[event];
			if (callbacks) {
				for (var i = 0, l = callbacks.length; i < l; i++) {
					var cb = callbacks[i];
					cb.fn.apply(cb.scope, arguments);
				}
			}
		}
	};
	
	smpl.Ecb.prototype.pause = function() {
		this.paused++;
	};
	
	smpl.Ecb.prototype.resume = function() {
		if (this.paused) {
			this.paused--;
			if (!this.paused) {
				var length = this.deferred.length;
				for (var i = 0; i < length; i++) {
					this.fire.apply(this, this.deferred[i]);
				}
				this.deferred.splice(0, length);
			}
		}
	};
	
	return smpl;
});