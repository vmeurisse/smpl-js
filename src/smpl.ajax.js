define(['./smpl.data'], function(smpl) {
	
	/**
	 * Make an ajax call to a server
	 * 
	 * @param {Object} args
	 * @param {String} args.method                       Method to use to connect to the server. Default to 'GET'. (optional)
	 * @param {String} args.url                          Url to connect to.
	 * @param {String} args.data                         Data to be send in the body of the request. (optional)
	 * @param {Function|Array.<Function>} args.onSuccess Called after a successfull response from the server. (optional)
	 *                                                   The function take a `smpl.ajax.Response` as parameter
	 * @param {Function|Array.<Function>} args.onError   Called after a error response from the server or an abort. (optional)
	 *                                                   The function take a `smpl.ajax.Response` as parameter
	 * @param {Function|Array.<Function>} args.onDone    Called everytime after the other `onSuccess` or `onError` callbacks. (optional)
	 *                                                   The function take a `smpl.ajax.Response` as parameter
	 * @param {Object} args.scope                        Scope to be used when calling `onSuccess`, `onError` and `onDone` callbacks
	 * @param {number} args.timeout                      Timeout of the call in ms. Default to 30000. (optional)
	 * @param {boolean} args.async                       Set it to false for synchronus call. Default to true. (optional)
	 * @param {Object.<String, String>} args.headers     Headers to set for the calls.
	 * @param {?} args.passThrough                       Will be transmited to the `smpl.ajax.Response`. Usefull if you have multiple calls in parallel and you need to identify the responses.
	 * @return {smpl.ajax.Request|smpl.ajax.Response} The `smpl.ajax.Request` object for asynchronus calls, the `smpl.ajax.Response` object for synchronus ones.
	 */
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
		
		if (config.method === 'POST' && config.data !== undefined) {
			config.headers['Content-type'] = config.headers['Content-type'] || 'application/x-www-form-urlencoded; charset=UTF-8';
		}
		
		
		var request = new smpl.ajax.Request(config);
		return config.async ? request : request.synchronusResponse;
	};
	
	/**
	 * Store default values for configuration.
	 */
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
	
	/**
	 * Request object. Allows the user to cancel an ongoing ajax call
	 */
	smpl.ajax.Request = function(config) {
		this.config = config;
		this.synchronusResponse = this.send(this.config.data);
	};
	
	/**
	 * Create the `XMLHttpRequest` object and send the call
	 * @private
	 */
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
			return this.handleTransactionResponse();
		}
	};
	
	/**
	 * abort the call. If the call is already terminated, has no effect.
	 * The callbacks associated to the ajax call will be called as for any error case.
	 * @return {boolean} `true` if the call was aborted, `false` if it was already finished
	 */
	smpl.ajax.Request.prototype.abort = function() {
		if (this.xhr.readyState !== 4) {
			this.xhr.abort();
			this.handleTransactionResponse();
			return true;
		} else {
			return false;
		}
	};
	
	/**
	 * Check the state of the call and call `handleTransactionResponse` if needed
	 * Should never be called directly (only through xhr.onreadystatechange)
	 * @private
	 */
	smpl.ajax.Request.prototype.checkReadyState = function() {
		if (this.xhr.readyState === 4) {
			this.handleTransactionResponse();
		}
	};
	
	/**
	 * Called at the end of the call. Takes care of creating the `smpl.ajax.Response` and calling the callbacks.
	 * @private
	 */
	smpl.ajax.Request.prototype.handleTransactionResponse = function() {
		if (this.killer) {
			window.clearTimeout(this.killer);
		}
		
		var responseObject = new smpl.ajax.Response(xhr, passThrough);
		
		var callbacks = responseObject.successfull ? this.config.onSuccess : this.config.onError;
		callbacks = callbacks.concat(this.config.onDone);
		var scope = this.config.scope;
		callbacks.forEach(function(callback) {
			callback.call(scope, responseObject);
		});
		return responseObject;
	};
	
	/**
	 * Hold the response of the server
	 */
	smpl.ajax.Response = function(xhr, passThrough) {
		this.setStatus(xhr);
		
		/**
		 * `passThrough` object as passed to `smpl.ajax`
		 */
		this.passThrough = passThrough;
		
		/**
		 * Response text returned by the server
		 */
		this.responseText = xhr.responseText;
		
		/**
		 * XML Response returned by the server if any
		 */
		this.responseXML = xhr.responseXML;
	};
	
	/**
	 * Read the `status` and `statusText` of the `xhr` object.
	 */
	smpl.ajax.Response.prototype.setStatus = function(xhr) {
		/**
		 * HTTP status of the call
		 */
		this.status = 0;
		
		/**
		 * Text associated to the HTTP status
		 */
		this.statusText = 'fail';

		try {
			this.status = xhr.status;
			this.statusText = xhr.statusText;
		} catch (e) {
		}
		
		if (this.status === 1223) {
			//Hey stupid IE<=9: http://bugs.jquery.com/ticket/1450
			this.status = 204;
			this.statusText = 'No Content';
		}
		
		if ([12002, 12029, 12030, 12031, 12152, 13030].indexOf(status) != -1) {
			//Cool, some more IE non-conformance: http://stackoverflow.com/questions/872206/http-status-code-0-what-does-this-mean-in-ms-xmlhttp#905751
			this.status = 0;
			this.statusText = 'fail';
		}
		
		this.successfull = (this.status >= 200 && this.status < 300);
	};
	
	return smpl;
});
