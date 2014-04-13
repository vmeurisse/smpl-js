/* jshint node: true, camelcase: false, latedef: false, es5: true */
/* globals jake: false, task: false, fail: false, complete: false */ // Globals exposed by jake
var path = require('path');
var smplBuild = require('smpl-build-test');

var dir = {};
dir.base = path.normalize(__dirname + (path.sep || '/'));
dir.coverageDir = dir.base + 'coverage/';
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

var coverageConfig = {
	node: {
		tests: [path.join(dir.test, 'testRunnerNode.js')],
		globals: ['window', 'document']
	},
	server: {
		path: dir.base,
		port: process.env.npm_package_config_port,
		coverageDir: dir.coverageDir
	},
	coverage: {
		baseDir: dir.base,
		src: dir.src,
		coverageDir: dir.coverageDir,
		minCoverage: 70,
		copyall: true,
		coverageOnly: true
	},
	remote: {
		user: process.env.SAUCELABS_USER || process.env.npm_package_config_sauceLabs_user,
		key: process.env.SAUCELABS_KEY || process.env.npm_package_config_sauceLabs_key,
		name: 'smpl test suite',
		url: 'http://localhost:' + process.env.npm_package_config_port + '/test/index.html',
		browsers: [
			{browserName: 'chrome', platform: 'Linux'},
			{browserName: 'firefox', platform: 'Linux'},
			{browserName: 'opera', version: 12, platform: 'Linux'},
			{browserName: 'internet explorer', version: 11, platform: 'Windows 8.1'},
			{browserName: 'internet explorer', version: 10, platform: 'Windows 8'},
			{browserName: 'internet explorer', version: 9, platform: 'Windows 7'},
			{browserName: 'internet explorer', version: 8, platform: 'Windows XP'},
			{browserName: 'internet explorer', version: 7, platform: 'Windows XP'},
			//{browserName: 'android', version: '4.0', platform: 'Linux'},
			{browserName: 'iphone', version: '7.1', platform: 'Mac 10.9'},
			{browserName: 'safari', version: 7, platform: 'Mac 10.9'},
			{browserName: 'safari', version: 6, platform: 'Mac 10.8'}
		],
	},
	sauceConnect: {
		user: process.env.SAUCELABS_USER || process.env.npm_package_config_sauceLabs_user,
		key: process.env.SAUCELABS_KEY || process.env.npm_package_config_sauceLabs_key
	},
	manualStop: true
};

var getConfig = function(features) {
	var config = {};
	features.forEach(function(feature) {
		config[feature] = coverageConfig[feature];
	});
	if (process.env.TRAVIS_NODE_VERSION && process.env.TRAVIS_NODE_VERSION !== '0.10') {
		// For travis build, only start remote tests once
		delete config.remote;
	}
	if (config.remote && (!config.remote.user || !config.remote.key)) {
		fail('Unable to find sauceLabs credentials', EXIT_CODES.sauceLabsCredentials);
	}
	
	return config;
};

var showReportLocation = function() {
	var location = dir.coverageDir.replace(/\\/g, '/');
	console.log();
	console.log('HTML report is at file:///' + location + 'html-report/index.html');
	console.log();
};

var manualStop = function(e, runner) {
	if (e) {
		console.log(e);
		runner.stop(function() {
			callback(e);
		});
	} else {
		console.log();
		console.log('Please run your unit tests');
		console.log();
		console.log(coverageConfig.remote.url);
		console.log(coverageConfig.remote.url + '?coverage=true');
		console.log();
		console.log('Press [ENTER] when ready to generate report');
		console.log();
		process.stdin.resume();
		process.stdin.once('data', function() {
			process.stdin.pause();
			runner.stop(function() {
				showReportLocation();
				complete();
			});
		});
	}
};

task('coverage', [], {async: true}, function() {
	smplBuild.tests(getConfig(['node', 'coverage']), callback);
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

task('remote', [], {async: true}, function() {
	smplBuild.tests(getConfig(['server', 'remote', 'sauceConnect', 'coverage']), callback);
});

task('local', [], {async: true}, function() {
	smplBuild.tests(getConfig(['server', 'coverage', 'manualStop']), function(e, runner) {
		manualStop(e, runner);
	});
});

task('tunnel', [], {async: true}, function() {
	smplBuild.tests(getConfig(['server', 'coverage', 'sauceConnect', 'manualStop']), function(e, runner) {
		manualStop(e, runner);
	});
});

task('test', ['lint'], {async: true}, function() {
	smplBuild.tests(getConfig(['node', 'server', 'remote', 'sauceConnect', 'coverage']), callback);
});

task('unit', [], {async: true}, function() {
	smplBuild.tests(getConfig(['node']), callback);
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
