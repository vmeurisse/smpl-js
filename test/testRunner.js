// We create a separate instance of smpl for each test suite
(function() {
	/* globals process, __dirname, requirejs */
	var srcPath = (typeof process !== 'undefined' && process && process.env && process.env.PARAFFIN_COVERAGE) ?
	               '../coverage/src' :
	               '../src';
	
	var tests = ['smpl',
	             'smplAssert',
	             'smplData',
	             'smplDate',
	             'smplDom',
	             'smplEcb',
	             'smplNumber',
	             'smplObject',
	             'smplString',
	             'smplTpl', 'smplTplWL',
	             'smplUtils'];
	var config = {
		packages: []
	};
	
	var configId = 1;
	tests.forEach(function(test) {
		config.packages.push({
			name: test,
			// Change the location so each require get a different instance
			location: srcPath + new Array(++configId).join('/../src'),
			main: 'smpl.js'
		});
	});
	if (typeof __dirname !== 'undefined') {
		config.baseUrl = __dirname;
		config.nodeRequire = require;
	}
	requirejs.config(config);
})();

define(['./assert',
        './smpl.data',
        './smpl.date',
        './smpl.dom',
        './smpl.Ecb',
        './smpl.number',
        './smpl.object',
        './smpl.string',
        './smpl.tpl',
        './smpl.utils'], '');
