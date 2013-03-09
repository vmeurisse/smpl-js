if (typeof define !== 'function') {var define = require('amdefine')(module)}
/**
 * @module smpl
 * @submodule smpl.tpl.WidgetLib
 */
define(['./smpl.tpl'], function(smpl) {
	smpl.tpl = smpl.tpl || {};
	
	/**
	 * 
	 * 
	 * 
	 * @class smpl.tpl.WidgetLib
	 * @constructor
	 */
	smpl.tpl.WidgetLib = function(name) {
		smpl.tpl.utils.registerLibrary(name, this);
		this.widgets = {};
	};
	
	smpl.tpl.WidgetLib.prototype.retrieveWidget = function(name, config, content) {
		var widget = new this.widgets[name]();
		var html = widget.getHTML(config, content);
		return {
			widget: widget,
			html: html
		};
	};
	
	smpl.tpl.WidgetLib.prototype.registerWidget = function(name, constructor) {
		this.widgets[name] = constructor;
	};
	
	return smpl;
});