var requirejs = require('requirejs');

var config = {
    baseUrl: './src',
    name: 'smpl',
    out: './build/smpl-min.js',
	optimize: 'uglify',
	uglify: {
		unsafe: true
	},
	preserveLicenseComments: false
};

console.log('Building', config.out);
requirejs.optimize(config);

config.optimize = 'none';
config.out = './build/smpl.js';
console.log('Building', config.out);
requirejs.optimize(config);

console.log('done');

