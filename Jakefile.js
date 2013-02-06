/* jshint node: true, camelcase: false, latedef: false */
/* globals jake: false, task: false, fail: false, complete: false */ // Globals exposed by jake
/* globals config: false, cp: false, rm: false, mkdir: false, find: false */ // Globals exposed by shelljs
var path = require('path');
var child_process = require('child_process');
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

task('default', [], function() {
	cp('-fr', dir.src + '*', dir.base);
});

task('coverage', [], function() {
	rm('-rf', dir.cov);
	mkdir(dir.cov);
	var jscoverCmd = path.join(dir.bin, 'jscover');
	var jscoverArgs =  path.relative(__dirname, dir.src) + ' ' + path.relative(__dirname, dir.covSrc);
	
	doCommand(jscoverCmd + ' ' + jscoverArgs, function() {
		cp('-r', dir.test, dir.covTest);
		doCommand(path.join(dir.bin, 'mocha') + ' --reporter html-cov', {
			cwd: dir.cov
		}, function(result) {
			var resultFile = path.join(dir.cov, 'coverage.html');
			result.output.to(resultFile);
			console.log('xdg-open ' + resultFile);
		});
	});
});

task('lint', [], function() {
	require('smpl-build-test');
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
	var Remote = require('smpl-build-test').Remote;
	var port = process.env.npm_package_config_port;
	var user, key;
	if (process.env.SAUCELABS_USER && process.env.SAUCELABS_KEY) {
		user = process.env.SAUCELABS_USER;
		key = process.env.SAUCELABS_KEY;
	} else if (process.env.npm_package_config_sauceLabs_user && process.env.npm_package_config_sauceLabs_key) {
		user = process.env.npm_package_config_sauceLabs_user;
		key = process.env.npm_package_config_sauceLabs_key;
	} else {
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
		url: 'http://localhost:' + port + '/test/test.html',
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
	doCommand(path.join(dir.bin, 'mocha') + opts, {silent: false}, cb);
}

function doCommand(cmd, opts, cb) {
	var result = {
		exitCode: 0,
		output: '',
		err: ''
	};
	
	if (typeof opts === 'function') {
		cb = opts;
		opts = {};
	}
	if (opts.silent !== false) opts.silent = true;
	var options = {
		env: process.env,
		cwd: opts.cwd || dir.base
	};
	
	var proc = child_process.exec(cmd, options, function(err) {
		result.exitCode = err ? err.code : 0;
		if (err) {
			var msg = 'Command failed: <' + cmd + '>\n';
			msg += 'Exit code:' + err.code + '\n';
			msg += result.err + '\n';
			if (err.code === 127) msg += '\nVerify that ' + cmd.split(' ')[0] + ' is installed.';
			process.stdout.write(msg);
			fail('subcommand execution error', EXIT_CODES.command);
		} else {
			if (cb) {
				cb(result);
			}
		}
		
	});
	proc.stdout.on('data', function(data) {
		result.output += data;
		 if (!opts.silent) {
			process.stdout.write(data);
		 }
	});
	proc.stderr.on('data', function(data) {
		result.err += data;
		 if (!opts.silent) {
			process.stderr.write(data);
		 }
	});
}
