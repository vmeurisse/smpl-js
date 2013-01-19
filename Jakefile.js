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

	echo('Linting files...', '\n');

	var failures = {};
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
				if (err.code === 'W102' && err.evidence.match(/^\t+$/)) {
					return;
				}
				if (passed) {
					echo(file);
					passed = false;
				}
				var line = '[L' + err.line + ':' + err.code + ']';
				while (line.length < 15) {
					line += ' ';
				}

				echo(line, err.reason);
			});
		}
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
			var msg = 'Command failed: <' + cmd + ' ' + args.join(' ') + '>\n';
			msg += 'Exit code:' + result.exitCode + '\n';
			msg += result.err + '\n';
			if (result.exitCode == 127) msg += '\nVerify that ' + cmd + ' is installed.';
			console.error(msg);
			process.exit(1);

		} else {
			cb(result);
		}
	});
	proc.stdout.on('data', function(data) {
		result.output += data;
	});
	proc.stderr.on('data', function(data) {
		result.err += data;
	});
}
