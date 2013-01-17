var fs = require('fs');
var path = require('path');
var child_process = require('child_process')

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
	var fse = require('fs-extra');
	fse.removeSync(dir.cov);
	
	doCommand('jscoverage', ['--no-highlight', dir.src, dir.cov], function(result) {
		amdefine(dir.cov, dir.cov);
		fse.copy(dir.test, dir.testCov, function(err){
			if (err) {
				console.error(err);
				process.exit(1);
			} else {
//				console.log('cd ' + dir.cov + ' && ' + path.join(dir.bin, 'mocha') + ' --reporter html-cov > coverage.html && xdg-open coverage.html && cd ..');
				
				doCommand(path.join(dir.bin, 'mocha'), ['--reporter', 'html-cov'], function(result) {
					var resultFile = path.join(dir.testCov, 'coverage.html');
					fs.writeFileSync(resultFile, result.output, 'utf8');
					console.log('xdg-open ' + resultFile);
				}, {
					cwd: dir.cov
				});
			}
		});
	})
});

function amdefine(folder, destination) {
	var list = new jake.FileList();
	list.include(folder + '**/*.js');
	list = list.toArray();
	list.forEach(function(srcPath) {
		var stat = fs.statSync(srcPath);
		if (stat.isFile()) {
			var filePath = srcPath.substr(folder.length);
			var destDir = destination + path.dirname(filePath);
			jake.mkdirP(destDir);
			var txt = fs.readFileSync(srcPath, 'utf8');
			txt = "if (typeof define !== 'function') {var define = require('amdefine')(module);}\n" + txt; 
			fs.writeFileSync(path.join(destination, filePath), txt, 'utf8');
		}
	});
};

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
