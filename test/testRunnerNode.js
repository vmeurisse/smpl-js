/* jshint node: true */

// Delete `requirejs` from node cache. It will reload it so `requirejs` will loose its own cache.
// Otherwise, tests are not reimported
require.cache[require.resolve('requirejs')] = null;

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
