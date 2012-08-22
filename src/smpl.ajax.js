define(['./smpl.data'], function(smpl) {
	
	smpl.ajax = function(args) {
		var config = Object.create(smpl.ajax.defaultConfig);
		smpl.data.updateObject(config, args);
		
		['onSuccess', 'onError', 'onDone'].forEach(function (key) {
			if (config[key] && typeof config[key] === "function") {
				config[key] = [config[key]];
			} else if (!config[key]) {
				config[key] = [];
			}
		});
		
		if (config.method === 'POST' && config.data != null) {
			config.headers['Content-type'] = config.headers['Content-type'] || 'application/x-www-form-urlencoded; charset=UTF-8';
		}
		
		return new smpl.ajax.Request(config);
	};

	smpl.ajax.defaultConfig = {
		method: "GET",
		url: "#",
		data: null,
	
		scope: null,
		onSuccess: null,
		onError: null,
		onDone: null,
		
		timeout: 30000,
		
		async: true,
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		},
		
		passThrough: undefined //Not used directly. Can be read by callbacks
	};
	
	smpl.ajax.Request = function(config) {
		this.config = config;
		this.send(this.config.data);
	};
	
	smpl.ajax.Request.prototype.send = function(data) {
		this.xhr = new XMLHttpRequest();
		this.xhr.open(this.config.method, this.config.url, this.config.async);
		for (var header in this.config.headers) {
			this.xhr.setRequestHeader(header, this.config.headers[header]);
		}
		
		if (this.config.async) {
			if (this.config.timeout) {
				this.killer = window.setTimeout(this.abort.bind(this), this.config.timeout);
			}
			this.xhr.onreadystatechange = this.checkReadyState.bind(this);
			this.xhr.send(data);
		} else {
			try {
				this.xhr.send(data);
			} catch(e) {
			}
			this.handleTransactionResponse();
		}
	};
	
	smpl.ajax.Request.prototype.abort = function() {
		if (this.xhr.readyState !== 4 && this.xhr.readyState !== 0) {
			this.xhr.abort();
			this.handleTransactionResponse();
			return true;
		} else {
			return false;
		}
	};
	
	smpl.ajax.Request.prototype.checkReadyState = function() {
		if (this.xhr.readyState === 4) {
			this.handleTransactionResponse();
		}
	};
	
	smpl.ajax.Request.prototype.cleanConnection = function() {
		if (this.killer) {
			window.clearTimeout(this.killer);
		}
	};
	
	smpl.ajax.Request.prototype.handleTransactionResponse = function() {
		this.cleanConnection();

		try {
			var httpStatus = this.xhr.status;
			var httpStatusText = this.xhr.statusText;
		} catch (e) {
		}
		
		if (httpStatus === 1223) {
			//Hey stupid IE<=9: http://bugs.jquery.com/ticket/1450
			httpStatus = 204;
			httpStatusText = 'No Content';
		}
		
		if ([12002, 12029, 12030, 12031, 12152, 13030].indexOf(httpStatus) != -1) {
			//Cool, some more IE non-conformance: http://stackoverflow.com/questions/872206/http-status-code-0-what-does-this-mean-in-ms-xmlhttp#905751
			httpStatus = 0;
			httpStatusText: 'fail';
		}
		
		var responseObject = this.createResponseObject(httpStatus, httpStatusText);
		
		if (httpStatus >= 200 && httpStatus < 300) {
			var callbacks = this.config.onSuccess;
		} else {
			var callbacks = this.config.onError;
		}
		callbacks = callbacks.concat(this.config.onDone);
		var scope = this.config.scope;
		callbacks.forEach(function(callback) {
			callback.call(scope, responseObject);
		});
	};
	
	smpl.ajax.Request.prototype.createResponseObject = function(httpStatus, httpStatusText) {
		var obj = {};
		obj.status = httpStatus;
		obj.statusText = httpStatusText;
		obj.passThrough = this.config.passThrough;
		obj.responseText = this.xhr.responseText;
		obj.responseXML = this.xhr.responseXML;
		return obj;
	};

	return smpl;
});
