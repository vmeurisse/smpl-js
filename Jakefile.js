/* jshint node: true, camelcase: false, latedef: false, es5: true */
/* globals jake: false, task: false, fail: false, complete: false */ // Globals exposed by jake
var path = require('path');
var smplBuild = require('smpl-build-test');

var dir = {};
dir.base = path.normalize(__dirname + (path.sep || '/'));
dir.src = dir.base + 'src/';
dir.test = dir.base + 'test/';
dir.bin = path.join(dir.base, 'node_modules', '.bin');

var EXIT_CODES = {
	sauceLabsCredentials: 4
};

var callback = function(err) {
	if (err) fail(err);
	else complete();
};

var coverage = function(cb) {
	smplBuild.coverage({
		baseDir: dir.base,
		tests: [path.join(dir.test, 'testRunnerNode.js')],
		minCoverage: 50,
		globals: ['window', 'document']
	}, cb);
};

task('coverage', [], {async: true}, function() {
	coverage(callback);
});

task('lint', [], {async: true}, function() {
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
		setup: false,
		teardown: false,
		suiteSetup: false,
		suiteTeardown: false
	};
	
	smplBuild.lint({
		files: files,
		js: {
			globals: globals,
			options: {
				lastsemic: true
			}
		}
	}, callback);
});

var remote = function(cb) {
	var port = process.env.npm_package_config_port;
	var user = process.env.SAUCELABS_USER || process.env.npm_package_config_sauceLabs_user;
	var key = process.env.SAUCELABS_KEY || process.env.npm_package_config_sauceLabs_key;
	if (!user || !key) {
		fail('Unable to find sauceLabs credentials', EXIT_CODES.sauceLabsCredentials);
	}
	console.log('testing on sauceLabs with user <%s>', user);
	smplBuild.remote({
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
	}, cb);
};

task('remote', [], {async: true}, function() {
	remote(callback);
});

task('test', ['lint'], {async: true}, function() {
	smplBuild.test({
		tests: [path.join(dir.test, 'testRunnerNode.js')],
		globals: ['window', 'document']
	}, function(err) {
		if (err) return fail(err);
		coverage(function(err) {
			if (err) return fail(err);
			if (process.env.TRAVIS_NODE_VERSION && process.env.TRAVIS_NODE_VERSION !== '0.8') {
				// For travis build, only start remote tests once
				complete();
				return;
			}
			remote(callback);
		});
	});
});

task('unit', [], {async: true}, function() {
	smplBuild.test({
		tests: [path.join(dir.test, 'testRunnerNode.js')],
		reporter: 'spec',
		globals: ['window', 'document']
	}, callback);
});
task('doc', [], {async: true}, function() {
	smplBuild.document({
		paths: [__dirname + '/src'],
		outdir: __dirname + '/docs',
		basePath: __dirname,
		project: {
			dir: __dirname
		}
	}, callback);
});
