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
	lintFailed: 2,
	remoteTests: 3
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
	var jshint = require('jshint').JSHINT;
	var OPTIONS = JSON.parse(cat(dir.base + 'jshint.json'));
	
	var files = find(dir.src, dir.test).filter(function (file) {
		return file.match(/\.js$/);
	});

	echo('Linting files...');

	var hasErrors = false;
	files.forEach(function (file) {
		jshint(cat(file), OPTIONS, {
			require: false,
			define: true,
			module: false,
			suite: false,
			test: false,
			setup: false
		});
		var passed = true;
		var errors = jshint.data().errors;
		if (errors) {
			errors.forEach(function(err) {
				if (!err) {
					return;
				}
				// ignore trailing spaces on indentation only lines
				if (err.code === 'W102' && err.evidence.match(/^\t+$/)) {
					return;
				}
				// required { for one line blocks
				if (err.code === 'W116' && err.a === '{' &&
					err.evidence.match(/^\t* *(if|for|while) ?\(.*;(\s*\/\/.*)?$/)) {
					return;
				}
				// Allow double quote string if they contain single quotes
				if (err.code === 'W109') {
					// https://github.com/jshint/jshint/issues/824
					if (err.character === 0) {
						return;
					}
					var line = err.evidence.replace(/\t/g, '    ');
					var i = err.character - 2; //JSHINT use base 1 for column and return the char after the end
					var single = 0, double = 0;
					while (i--) {
						if (line[i] === "'") single++;
						else if (line[i] === '"') {
							var nb = 0;
							while (i-- && line[i] === '\\') nb++;
							if (nb % 2) double++;
							else break;
						}
					}
					if (single > double) {
						return;
					}
				}
				
				// Missing space after function
				if (err.code === 'W013' && err.a === 'function') {
					return;
				}
				
				// jslint bug: `while(i--);` require a space before `;`
				if (err.code === 'W013') {
					var line = err.evidence.replace(/\t/g, '    ');
					if (line[err.character - 1] === ';') return;
				}
				
				// Indentation. White option turn this on
				if (err.code === 'W015') return;
				
				if (passed) {
					echo('\n', file);
					passed = false;
					hasErrors = true;
				}
				var line = '[L' + err.line + ':' + err.code + ']';
				while (line.length < 15) {
					line += ' ';
				}

				echo(line, err.reason);
				console.log(err.evidence.replace(/\t/g, '    '));
				console.log(Array(err.character).join(' ') + '^');
			});
		}
	});
	if (hasErrors) {
		fail('FAIL !!!', EXIT_CODES.lintFailed);
	} else {
		echo('ok');
	}
});

task('test', ['lint'], {async: true}, function() {
	runUnitTests(function() {
		var remote = jake.Task['remote'];
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
	var PORT = process.env.npm_package_config_port;
	var remote = new Remote({
		port: PORT,
		user: process.env.npm_package_config_sauceLabs_user,
		key: process.env.npm_package_config_sauceLabs_key,
		name: 'smpl test suite',
		browsers: [
			{name: 'chrome', os: 'Linux'},
			{name: 'firefox', os: 'Linux'},
			{name: 'opera', version: 12, os: 'Linux'},
			{name: 'internet explorer', version: 10, os: 'Windows 2012'},
			{name: 'internet explorer', version: 9, os: 'Windows 2008'},
			{name: 'internet explorer', version: 8, os: 'Windows 2003'},
			{name: 'safari', version: 6, os: 'Mac 10.8'}
		],
		url: 'http://localhost:' + PORT + '/test/test.html',
		onEnd: function(fails) {
//			if (fails) fail(EXIT_CODES.remoteTests);
			complete();
		}
	});
	remote.startServer();
	remote.startSauceConnect(function() {
		remote.run(function(browser, cb) {
			browser.get(remote.config.url, function() {
				browser.waitForCondition('!!window.mochaResults', 30000, 100, function(err, res) {
					browser.eval('window.mochaResults', function(err, res) {
						cb(res);
					});
				});
			});
		});
	});
});

var Remote = function(config) {
	this.config = config;
	this.id = process.env.TRAVIS_JOB_ID;
	this.tags = [];
	if (this.id) {
		this.tags.push('travis');
	} else {
		this.tags.push('custom', '' + Math.floor(Math.random() * 100000000));
	}
	this.status = {};
};

Remote.prototype.startServer = function() {
	var static = require('node-static');
	var file = new static.Server();
	this.server = require('http').createServer(function (request, response) {
		request.addListener('end', function () {
			file.serve(request, response);
		});
	});
	this.server.listen(this.config.port);
	
	console.log('server ready: ' + this.config.url);
};

Remote.prototype.stopServer = function() {
	this.server.close();
	console.log('server stoped');
};

Remote.prototype.startSauceConnect = function(cb) {
	var options = {
		username: this.config.user,
		accessKey: this.config.key,
		verbose: false,
		logger: console.log,
		no_progress: true // optionally hide progress bar
	};
	var sauceConnectLauncher = require('sauce-connect-launcher');
	var self = this;
	sauceConnectLauncher(options, function (err, sauceConnectProcess) {
		if (err) {
			if (!(err+'').match(/Exit code 143/)) {
				console.log(err);
			}
			return;
		}
		self.sauceConnect = sauceConnectProcess;
		cb();
	});
};

Remote.prototype.stopSauceConnect = function() {
	this.sauceConnect.close();
};

Remote.prototype.run = function(test) {
	this.nbTests = this.config.browsers.length;
	this.config.browsers.forEach(this.startBrowser.bind(this, test));
};

Remote.prototype.startBrowser = function(test, b) {
	var webdriver = require('wd');

	var browser = webdriver.remote('ondemand.saucelabs.com', 80, this.config.user, this.config.key);
	var name = this.getBrowserName(b);
	var desired = {
		name: this.config.name + ' - ' + name,
		browserName: b.name,
		platform: b.os,
		version: b.version,
		build: this.id,
		tags: this.tags
	};
	browser.on('status', function(info){
		console.log('%s : \x1b[36m%s\x1b[0m', name, info);
	});

	browser.on('command', function(meth, path){
		console.log('%s : > \x1b[33m%s\x1b[0m: %s', name, meth, path);
	});

	var self = this;
	browser.init(desired, function(err, sessionID) {
		test(browser, self.testDone.bind(self, browser, name, sessionID));
	});
};

Remote.prototype.getBrowserName = function(browser) {
	var name = browser.name;
	if (browser.version) name += ' ' + browser.version;
	if (browser.os) name += ' (' + browser.os + ')';
	return name;
};

Remote.prototype.testDone = function(browser, name, id, status) {
	browser.quit();
	this.status[name] = status;
	this.report(id, status, name, this.finish.bind(this));
};

Remote.prototype.finish = function() {
	if (0 === --this.nbTests) {
		this.stopSauceConnect();
		this.stopServer();
		var self = this;
		setTimeout(function() {
			self.displayResults();
		}, 1000);
	}
};

Remote.prototype.report = function(jobId, status, name, done) {
	var request = require('request');
	
	var success = !!(status && status.ok && status.failed && status.ok.length && !status.failed.length);
	var httpOpts = {
		url: 'http://' + this.config.user + ':' + this.config.key + '@saucelabs.com/rest/v1/' + this.config.user + '/jobs/' + jobId,
		method: 'PUT',
		headers: {
			'Content-Type': 'text/json'
		},
		body: JSON.stringify({
			passed: success
		}),
		jar: false /* disable cookies: they break next request */
	};

	request(httpOpts, function(err, res) {
		if(err) {
			console.log('%s : > job %s: unable to set status:', name, jobId, err); 
		} else {
			console.log('%s : > job %s marked as %s', name, jobId, success ? 'passed' : 'failed'); 
		}
		done();
	});
};

Remote.prototype.displayResults = function() {
	var failures = 0;
	var self = this;
	console.log();
	console.log();
	console.log('**********************************');
	console.log('*             Status             *');
	console.log('**********************************');
	console.log();
	console.log();
	this.config.browsers.forEach(function(browser) {
		var name = self.getBrowserName(browser);
		var status = self.status[name];
		
		var ok = status && status.ok && status.ok.length;
		var failed = status && status.failed && status.failed.length;

		if (!ok && !failed) {
			console.log('    %s: \033[31mno results\033[m', name);
		} else if (failed) {
			console.log('    %s: \033[31m%d/%d failed\033[m', name, failed, ok + failed);
		} else {
			console.log('    %s: \033[90m%d passed\033[m', name, ok);
		}
		
		if (failed) {
			failures++;
			failed = status.failed;
			var n = 0;
			failed.forEach(function(test) {
				var err = test.error;
				var msg = err.message || '';
				var stack = err.stack || msg;
				var i = stack.indexOf(msg) + msg.length;
				msg = stack.slice(0, i);
				console.log();
				console.log('      %d) %s', ++n, test.fullTitle);
				console.log('\033[31m%s\033[m', stack.replace(/^/gm, '        '));
			});
			console.log();
			console.log();
		}
	});
	console.log();
	console.log();
	if (this.config.onEnd) this.config.onEnd(failures);
};

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
			if (err.code == 127) msg += '\nVerify that ' + cmd.split(' ')[0] + ' is installed.';
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
