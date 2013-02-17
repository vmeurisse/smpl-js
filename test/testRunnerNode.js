/* jshint node: true */

var requirejs = require('requirejs');
requirejs.config({
	baseUrl: __dirname,
	nodeRequire: require,
	packages: [{
		name: 'smpl',
		location: process.env.SMPL_COVERAGE ? '../coverage/src' : '../src',
		main: 'smpl.js'
	}]
});

requirejs('./testRunner');