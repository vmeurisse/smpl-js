/* jshint node: true */

var srcPath = process.env.PARAFFIN_COVERAGE ? '../coverage/src' : '../src';
var requirejsConfig = {
	baseUrl: __dirname,
	nodeRequire: require,
	packages: [{
		name: 'smpl',
		location: srcPath,
		main: 'smpl.js'
	}]
};

// Delete `requirejs` from node cache to loose its own cache.
// Otherwise, tests are not reimported
require.cache[require.resolve('requirejs')] = null;
var requirejs = require('requirejs');
requirejs.config(requirejsConfig);

// Test the full import with requirejs
requirejs(srcPath + '/smpl');
// Test the full import with requirejs
require(srcPath + '/smpl');
// Actual tests
requirejs('./testRunner');
