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
		echo('FAIL !!!');
		exit(1);
	} else {
		echo('ok');
	}
});

task('test', ['lint'], {async: true}, function() {
	runUnitTests();
});

task('unit', [], {async: true}, function() {
	runUnitTests(true);
});

function runUnitTests(details) {
	var opts = details ? ' -R spec' : '';
	doCommand(path.join(dir.bin, 'mocha') + opts, {silent: false}, complete);
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
			exit(1);
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
