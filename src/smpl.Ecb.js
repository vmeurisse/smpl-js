if (typeof define !== 'function') {var define = require('amdefine')(module)}
/**
 * @module smpl
 * @submodule smpl.Ecb
 * @class smpl.Ecb
 * @static
 */

define(['./smpl.core'], function(smpl) {
	'use strict';
	
	/**
	 * smpl.Ecb is a simple Event Communication Bus
	 * It provide a simple addListener/fire messaging system
	 * 
	 * @class smpl.Ecb
	 * @constructor
	 */
	smpl.Ecb = function() {
		this.reset();
	};
	
	/**
	 * Reset the ecb. All listener are removed, pending fire are deleted and the ecb is resumed.
	 * 
	 * @method reset
	 */
	smpl.Ecb.prototype.reset = function() {
		this.callbacks = {};
		this.paused = 0;
		this.deferred = [];
	};
	
	/**
	 * Add a listener to an event
	 * 
	 * @method addListener
	 *
	 * @param {String} event Name of the event to listen to
	 * @param {Function} fn  Function to be called
	 * @param {Object} scope Scope under which the `fn` is called (optional)
	 */
	smpl.Ecb.prototype.addListener = function(event, fn, scope) {
		if (!this.callbacks[event]) {
			this.callbacks[event] = [];
		}
		this.callbacks[event].push({
			fn: fn,
			scope: scope
		});
	};
	
	/**
	 * Remove one or multiple listeners.
	 * 
	 * @method removeListener
	 * 
	 * @param {String} event Name of the event
	 * @param {Function} fn  Remove only listeners whose function is equal to `fn`.
	 *                       Ignored is equal to undefined (optional)
	 * @param {Object} scope Remove only listeners whose scope is equal to `fn`.
	 *                       Ignored is equal to undefined (optional)
	 */
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
	
	/**
	 * fire an event. Every listener associated to the event will be called in the order they where registered
	 * Any parameter of `fire` will be passed to the listeners
	 *
	 *     var ecb = new smpl.Ecb();
	 *     ecb.addListener('log', console.log, console);
	 *     ecb.fire('log', 1, 2); // => 'log' 1 2
	 *
	 * @method fire
	 * 
	 * @param {String} event Name of the event
	 */
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
	
	/**
	 * Pause the Ecb. Any call to fire will be delayed until a call to `resume`.
	 * If pause is called multiple time, the same number of call must be done to `resume` to actually resume the Ecb.
	 * 
	 * @method pause
	 */
	smpl.Ecb.prototype.pause = function() {
		this.paused++;
	};
	
	/**
	 * Resume the Ecb. (@see smpl.Ecb.prototype.pause)
	 * 
	 * @method resume
	 */
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