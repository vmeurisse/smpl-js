if (typeof define !== 'function') {var define = require('amdefine')(module)}
/**
 * Module agregator for the smpl librairy
 * @module smpl
 */
define([
	'./smpl.ajax',
	'./smpl.data',
	'./smpl.data.DataDispatcher',
	'./smpl.date',
	'./smpl.dom',
	'./smpl.Ecb',
	'./smpl.number',
	'./smpl.object',
	'./smpl.string',
	'./smpl.tpl',
	'./smpl.utils'
], function(smpl) {
	return smpl;
});
