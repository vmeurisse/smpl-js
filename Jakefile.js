var fs = require('fs');
var path = require('path');

var dir = {
	base: path.normalize(__dirname + '/')
};

dir.src = dir.base + 'src/';

task('default', [], function() {
	var list = new jake.FileList();
	list.include(dir.src + '/**');
	list = list.toArray();
	list.forEach(function(srcPath) {
		var stat = fs.statSync(srcPath);
		if (stat.isFile()) {
			var filePath = srcPath.substr(dir.src.length);
			var destDir = dir.base + path.dirname(filePath);
			jake.mkdirP(destDir);
			var txt = fs.readFileSync(srcPath, 'utf8');
			txt = "if (typeof define !== 'function') {var define = require('amdefine')(module);}\n" + txt; 
			fs.writeFileSync(filePath, txt, 'utf8');
		}
	});
});
