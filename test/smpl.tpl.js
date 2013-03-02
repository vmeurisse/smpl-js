define(['smplAssert/assert', 'smplTpl/smpl.tpl'], function(assert, smpl) {
	suite('smpl.tpl', function() {
		test('dependencies', function() {
			assert.equals(Object.keys(smpl), ['string', 'utils', 'dom', 'tpl']);
		});
		
		test('base', function() {
			var tpl = new smpl.tpl.Template('base');
			tpl.init('this is a test template');
			tpl.parse();
			assert.equals(tpl.retrieve(), 'this is a test template');
		});
		
		test('variables', function() {
			var tpl = new smpl.tpl.Template('variables');
			tpl.onParse = function (a, b) {
				this.set('a', a);
				this.set('b', {b: b});
				this.set('c', {});
			};
			tpl.init('{$a} {$b.b}{$c.c}{$d}');
			tpl.parse('this is a', 'test template');
			assert.equals(tpl.retrieve(), 'this is a test template');
		});
		
		test('blocks', function() {
			var tpl = new smpl.tpl.Template();
			tpl.onParse = function () {
				this.set('a', 1);
				this.set('a', 'a', 2);
				this.parseBlock('a');
				this.parseBlock('a');
			};
			tpl.init('{$a} <!-- BEGIN: a -->block:{$a}; <!-- END: a --><!-- BEGIN: b -->I\m not parsed<!-- END: b -->{$a}');
			tpl.parse();
			assert.equals(tpl.retrieve(), '1 block:2; block:1; 1');
		});
		
		test('subblocks', function() {
			var tpl = new smpl.tpl.Template();
			tpl.onParse = function () {
				this.parseBlock('b');
				this.parseBlock('b');
				this.parseBlock('a');
			};
			tpl.init('m<!-- BEGIN: a -->a<!-- BEGIN: b -->b<!-- END: b -->a<!-- END: a -->m');
			tpl.parse();
			assert.equals(tpl.retrieve(), 'mabbam');
		});
	});
});