if (typeof define !== 'function') {var define = require('amdefine')(module)}
define(['./smpl.core'], function(smpl) {
	var data = smpl.data = smpl.data || {};
	
	data.DataDispatcher = function() {
		this.processors = {};
		this.endpoints = {};
		this.listeners = [];
	};
	
	data.DataDispatcher.prototype.addProcessor = function(key, fn) {
		this.processors[key] = this.processors[key] || [];
		this.processors[key].push(fn);
	};
	
	data.DataDispatcher.prototype.addEndpoint = function(key, fn) {
		this.endpoints[key] = this.endpoints[key] || [];
		this.endpoints[key].push(fn);
	};

	data.DataDispatcher.prototype.addListener = function(keys, fn) {
		if (typeof keys === 'string') {
			keys = [keys];
		}
		var mapKeys = {};
		for (var i = 0, l = keys.length; i < l; i++) {
			mapKeys[keys[i]] = true;
		}
		this.listeners.push({
			keys: mapKeys,
			fn: fn
		});
	};
	
	data.DataDispatcher.prototype.dispatch = function(data) {
		var i, l, key;
		for (key in data) {
			var item = data[key];
			
			var processors = this.processors[key] || [];
			for (i = 0, l = processors.length; i < l; i++) {
				item = processors[i](item);
			}
			
			var endpoints = this.endpoints[key] || [];
			for (i = 0, l = endpoints.length; i < l; i++) {
				endpoints[i](item);
			}
		}
		
		for (i = 0, l = this.listeners.length; i < l; i++) {
			var listener = this.listeners[i];
			for (key in data) {
				if (listener.keys[key]) {
					listener.fn();
					break;
				}
			}
		}
		
	};
	
	return smpl;
});
