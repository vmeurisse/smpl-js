/* jshint node: true, camelcase: false, latedef: false */
/* globals jake: false, task: false, fail: false, complete: false */ // Globals exposed by jake
var path = require('path');
require('smpl-build-test');

var dir = {};
dir.base = path.normalize(__dirname + (path.sep || '/'));
dir.src = dir.base + 'src/';
dir.test = dir.base + 'test/';
dir.bin = path.join(dir.base, 'node_modules', '.bin');

var EXIT_CODES = {
	sauceLabsCredentials: 4
};

task('coverage', [], function() {
	jake.invokeTask('smpl-build-test:coverage', [{
		baseDir: dir.base,
		tests: [path.join(dir.test, 'testRunnerNode.js')],
		minCoverage: {
			statements: 50,
			branches: 50,
			functions: 50,
			lines: 50
		}
	}], complete);
});

task('lint', [], function() {
	var files = jake.readdirR(dir.src).concat(jake.readdirR(dir.test)).filter(function (file) {
		return file.match(/\.js(?:on)?$/);
	});
	files.push(dir.base + 'Jakefile.js');
	files.push(dir.base + 'package.json');

	var globals = {
		require: false,
		define: true,
		module: false,
		suite: false,
		test: false,
		setup: false
	};
	
	jake.Task['smpl-build-test:lint'].invoke(files, globals);
});

task('test', ['lint'], {async: true}, function() {
	jake.invokeTask('smpl-build-test:test', [{
		tests: [path.join(dir.test, 'testRunnerNode.js')],
	}], function() {
		if (process.env.TRAVIS_NODE_VERSION && process.env.TRAVIS_NODE_VERSION !== '0.8') {
			// For travis build, only start remote tests once
			complete();
			return;
		}
		jake.invokeTask('remote', complete);
	});
});

task('unit', [], {async: true}, function() {
	jake.invokeTask('smpl-build-test:test', [{
		tests: [path.join(dir.test, 'testRunnerNode.js')],
		reporter: 'spec'
	}], complete);
});

task('remote', [], {async: true}, function() {
	var port = process.env.npm_package_config_port;
	var user = process.env.SAUCELABS_USER || process.env.npm_package_config_sauceLabs_user;
	var key = process.env.SAUCELABS_KEY || process.env.npm_package_config_sauceLabs_key;
	if (!user || !key) {
		fail('Unable to find sauceLabs credentials', EXIT_CODES.sauceLabsCredentials);
	}
	console.log('testing on sauceLabs with user <%s>', user);
	jake.invokeTask('smpl-build-test:remote', [{
		port: port,
		user: user,
		path: dir.base,
		key: key,
		name: 'smpl test suite',
		sauceConnect: true,
		browsers: [
			{name: 'chrome', os: 'Linux'},
			{name: 'firefox', os: 'Linux'},
			{name: 'opera', version: 12, os: 'Linux'},
			{name: 'internet explorer', version: 10, os: 'Windows 2012'},
			{name: 'internet explorer', version: 9, os: 'Windows 2008'},
			{name: 'internet explorer', version: 8, os: 'Windows 2003'},
			{name: 'internet explorer', version: 7, os: 'Windows 2003'},
			{name: 'iPad', version: 6, os: 'Mac 10.8'},
			{name: 'safari', version: 6, os: 'Mac 10.8'},
			{name: 'safari', version: 5, os: 'Mac 10.6'}
		],
		url: 'http://localhost:' + port + '/test/index.html',
		onTest: function(browser, cb) {
			browser.waitForCondition('!!window.mochaResults', 30000, 100, function() {
				/* jshint evil: true */
				browser.eval('window.mochaResults', function(err, res) {
					cb(res);
				});
			});
		}
	}], complete);
});
