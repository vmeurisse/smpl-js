define(['smplAssert/assert', 'smplTpl/smpl.tpl', 'smplTplWL/smpl.tpl.WidgetLib'], function(assert, smpl, smplWL) {
	suite('smpl.tpl', function() {
		test('dependencies', function() {
			assert.equals(Object.keys(smpl).sort(), ['string', 'utils', 'tpl'].sort());
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
			tpl.init('{$a} <!--block: a-->block:{$a}; <!--/block: a--><!--block: b-->not parsed<!--/block: b-->{$a}');
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
			tpl.init('m<!-- BLOCK: a -->a<!-- BLOCK: b -->b<!-- /BLOCK: b -->a<!-- /BLOCK: a -->m');
			tpl.parse();
			assert.equals(tpl.retrieve(), 'mabbam');
		});
		
		test('non-existing block', function() {
			var tpl = new smpl.tpl.Template('non-existing block');
			tpl.onParse = function () {
				this.parseBlock('a');
			};
			tpl.init('test<!-- BLOCK: b -->b<!-- /BLOCK: b -->');
			
			var e = assert.throws(tpl.parse.bind(tpl), Error);
			assert.equals(e.message, 'Template <non-existing block>: tried to parse non-existing block <a>.');
		});
		
		suite('widgets', function() {
			var smpl = smplWL;
			suiteSetup(function() {
				var wl = new smpl.tpl.WidgetLib('test');
				var Section = function() {};
				Section.prototype.getHTML = function(config, content) {
					this.config = config;
					var html = '<section';
					if (config.name) html += ' name="' + config.name + '"';
					html += '>' + content + '</section>';
					return html;
				};
				Section.prototype.sayHello = function() {
					return 'hello from ' + this.config.name;
				};
				wl.registerWidget('section', Section);
			});
			test('widget', function() {
				var tpl = new smpl.tpl.Template('widget');
				tpl.onParse = function () {
					this.w = this.parseWidget('a', {
						name: 'test'
					});
				};
				tpl.init('m<!--widget: a@test:section -->b<!--/widget: a-->m');
				
				tpl.parse();
				assert.equals(tpl.retrieve(), 'm<section name="test">b</section>m');
			});
			test('autoclose', function() {
				var tpl = new smpl.tpl.Template('autoclose');
				tpl.onParse = function () {
					this.parseWidget('a', {
						name: 'test'
					});
				};
				tpl.init('m<!--widget: a@test:section /-->m');
				
				tpl.parse();
				assert.equals(tpl.retrieve(), 'm<section name="test"></section>m');
			});
			
			test('arguments', function() {
				var tpl = new smpl.tpl.Template('autoclose');
				tpl.onParse = function () {
					this.parseWidget('a');
				};
				tpl.init('m<!--widget: a@test:section name="test"/-->m');
				
				tpl.parse();
				assert.equals(tpl.retrieve(), 'm<section name="test"></section>m');
			});
		});
	});
});
