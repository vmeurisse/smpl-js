var path = require('path');
var child_process = require('child_process');
require('shelljs/global');
config.fatal = true; //tell shelljs to fail on errors

var dir = {};
dir.base = path.normalize(__dirname + (path.sep || '/'));
dir.src = dir.base + 'src/';
dir.cov = dir.base + 'src-cov/';
dir.test = dir.base + 'test/';
dir.testCov = dir.cov + 'test/';
dir.bin = path.join(dir.base, 'node_modules', '.bin');

task('default', [], function() {
	amdefine(dir.src, dir.base);
});

task('coverage', [], function() {
	rm('-rf', dir.cov);
	doCommand('jscoverage', ['--no-highlight', dir.src, dir.cov], function(result) {
		amdefine(dir.cov, dir.cov);
		cp('-r', dir.test, dir.testCov);
		doCommand(path.join(dir.bin, 'mocha'), ['--reporter', 'html-cov'], function(result) {
			var resultFile = path.join(dir.testCov, 'coverage.html');
			result.output.to(resultFile);
			console.log('xdg-open ' + resultFile);
		}, {
			cwd: dir.cov
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
	doCommand(path.join(dir.bin, 'mocha'), [], complete, {
		stdio: 'inherit',
		customFds: [0, 1, 2] //customFds is deprecated but works on 0.6. stdio is introduced on 0.8
	});
});

function amdefine(folder, destination) {
	var HEADER = "if (typeof define !== 'function') {var define = require('amdefine')(module);}\n";
	
	var list = find(folder).filter(function(file) { return file.match(/\.js$/); });
	list.forEach(function(srcPath) {
		var filePath = srcPath.substr(folder.length);
		var destDir = destination + path.dirname(filePath);
		jake.mkdirP(destDir);
		(HEADER + cat(srcPath)).to(path.join(destination, filePath));
	});
}

function doCommand(cmd, args, cb, opt) {
	var result = {
		exitCode: 0,
		output: '',
		err: ''
	};
	
	var proc = child_process.spawn(cmd, args || [], opt);
	proc.on('exit', function(code) {
		result.exitCode = code;
		if (code) {
			var msg = 'Command failed: <' + cmd + ' ' + (args || []).join(' ') + '>\n';
			msg += 'Exit code:' + result.exitCode + '\n';
			msg += result.err + '\n';
			if (result.exitCode == 127) msg += '\nVerify that ' + cmd + ' is installed.';
			console.error(msg);
			exit(1);

		} else {
			cb(result);
		}
	});
	if (proc.stdout) {
		proc.stdout.on('data', function(data) {
			result.output += data;
		});
		proc.stderr.on('data', function(data) {
			result.err += data;
		});
	}
}
