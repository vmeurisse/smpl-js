/* jshint node: true, camelcase: false, latedef: false */
/* globals jake: false, task: false, fail: false, complete: false */ // Globals exposed by jake
/* globals config: false, rm: false, mkdir: false, find: false */ // Globals exposed by shelljs
var path = require('path');
var smpl_build = require('smpl-build');
var smpl_build_test = require('smpl-build-test');
require('shelljs/global');
config.fatal = true; //tell shelljs to fail on errors

var dir = {};
dir.base = path.normalize(__dirname + (path.sep || '/'));
dir.src = dir.base + 'src/';
dir.test = dir.base + 'test/';
dir.cov = dir.base + 'coverage/';
dir.covTest = dir.cov + 'test/';
dir.covSrc = dir.cov + 'src/';
dir.bin = path.join(dir.base, 'node_modules', '.bin');

var EXIT_CODES = {
	command: 1,
	remoteTests: 3,
	sauceLabsCredentials: 4
};

task('coverage', [], function() {
	rm('-rf', dir.cov);
	mkdir(dir.cov);
	var jscoverCmd = path.join(dir.bin, 'jscover');
	var jscoverArgs =  path.relative(__dirname, dir.src) + ' ' + path.relative(__dirname, dir.covSrc);
	
	smpl_build.run(jscoverCmd + ' ' + jscoverArgs, function(result) {
		if (result.exitCode) fail();
		process.env.SMPL_COVERAGE = '1';
		smpl_build.run(path.join(dir.bin, 'mocha') + ' --reporter html-cov ./test/testRunnerNode.js', {
			cb: function(result) {
				process.env.SMPL_COVERAGE = '';
				if (result.exitCode) fail();
				var resultFile = path.join(dir.cov, 'coverage.html');
				result.output.to(resultFile);
				console.log('xdg-open ' + resultFile);
			}
		});
	});
});

task('lint', [], function() {
	var files = find(dir.src, dir.test).filter(function (file) {
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
	runUnitTests(function() {
		if (process.env.TRAVIS_NODE_VERSION && process.env.TRAVIS_NODE_VERSION !== '0.8') {
			// For travis build, only start remote tests once
			complete();
			return;
		}
		var remote = jake.Task.remote;
		remote.addListener('complete', function() {
			complete();
		});
		remote.execute();
	});
});

task('unit', [], {async: true}, function() {
	runUnitTests(function() {
		complete();
	}, true);
});

task('remote', [], {async: true}, function() {
	var Remote = smpl_build_test.Remote;
	var port = process.env.npm_package_config_port;
	var user = process.env.SAUCELABS_USER || process.env.npm_package_config_sauceLabs_user;
	var key = process.env.SAUCELABS_KEY || process.env.npm_package_config_sauceLabs_key;
	if (!user || !key) {
		fail('Unable to find sauceLabs credentials', EXIT_CODES.sauceLabsCredentials);
	}
	console.log('testing on sauceLabs with user <%s>', user);
	var remote = new Remote({
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
		onEnd: function(fails) {
			if (fails) fail(EXIT_CODES.remoteTests);
			complete();
		},
		onTest: function(browser, cb) {
			browser.waitForCondition('!!window.mochaResults', 30000, 100, function() {
				/* jshint evil: true */
				browser.eval('window.mochaResults', function(err, res) {
					cb(res);
				});
			});
		}
	});
	
	remote.run();
});

function runUnitTests(cb, details) {
	var opts = details ? ' -R spec' : '';
	opts += ' ./test/testRunnerNode.js';
	smpl_build.run(path.join(dir.bin, 'mocha') + opts, {
		silent: false,
		cb: function(result) {
			if (result.exitCode) fail();
			cb();
		}
	});
}
