if (typeof define !== 'function') {var define = require('amdefine')(module)}
/**
 * @module smpl
 * @submodule smpl.tpl
 * @class smpl.tpl
 * @static
 */
define(['./smpl.string', './smpl.utils'], function(smpl) {
	'use strict';
	
	var MESSAGES = {
		wrongClosed: 'Incorrect element closed <{0}.{1}>. Openned one was <{2}.{3}>.',
		wrongParsed: 'Template <{0}>: tried to parse non-existing {1} <{2}>.',
		duplicateBlock: 'Template <{0}>: Block name <{1}> was used twice.'
	};
	var REGEX = {
		block: /^\s*(\/?BLOCK):\s*([-\w]+)\s*$/i,
		widget: /^\s*(\/?WIDGET):\s*([-\w]+)(?:@([-\w]+):([-:\w]+))?\s*([-\w]+=".*?"+\s*)*(\/?\s*)$/i
	};
	smpl.tpl = {};
	
	smpl.tpl.Template = function (name, blocks, parents) {
		this.__name = name || 'anonymous';
		this.__blocks = blocks;
		this.__widgets = {};
		this.__parents = parents;
	};
	
	smpl.tpl.Template.prototype.getInstance = function() {
		var tpl = Object.create(this);
		tpl.__data = null;
		return tpl;
	};
	
	smpl.tpl.Template.prototype.init = function(html, partial) {
		/* jshint evil: true */
		if (typeof html === 'string') {
			smpl.tpl.utils.make(this, html);
		}
		if (!partial && typeof this.__blocks[smpl.tpl.utils.MAIN]  === 'string') {
			for (var blkId in this.__blocks) {
				if (typeof this.__blocks[blkId]  === 'string') {
					this.__blocks[blkId] = new Function('smpl', '$', '"use strict";' + this.__blocks[blkId]);
				}
			}
		}
		if (smpl.tpl.globalObj) {
			this.__globalKey = this.__name + '_' + smpl.utils.uniq();
			smpl.tpl.globalObj[this.__globalKey] = this;
			this.__globalKey = smpl.tpl.globalKey + '["' + this.__globalKey + '"]';
		}
	};
	
	smpl.tpl.Template.prototype.set = function(block, key, value) {
		if (arguments.length === 2) {
			value = key;
			key = block;
			block = smpl.tpl.utils.MAIN;
		}
		this.getData(block)[key] = value;
	};
	
	smpl.tpl.Template.prototype.get = function(block, key) {
		if (arguments.length === 1) {
			key = block;
			block = smpl.tpl.utils.MAIN;
		}
		return this.getData(block)[key];
	};
	
	smpl.tpl.Template.prototype.getData = function(blockId) {
		if (this.__data[blockId]) return this.__data[blockId];
		var parent = this.getData(this.__parents[blockId]);
		var data = Object.create(parent);
		this.__data[blockId] = data;
		return data;
	};
	
	smpl.tpl.Template.prototype.retrieve = function(blkId) {
		blkId = blkId || smpl.tpl.utils.MAIN;
		var blk = this.__parsedBlocks[blkId];
		if (blk) {
			delete this.__parsedBlocks[blkId];
			return blk.join('');
		} else {
			return '';
		}
	};
	
	smpl.tpl.Template.prototype.reset = function() {
		if (!this.__data) {
			this.init();
		}
		this.__data = {};
		this.__data[smpl.tpl.utils.MAIN] = {
			me: this.__globalKey
		};
		this.__parsedBlocks = {};
		return this;
	};
	
	smpl.tpl.Template.prototype.parseBlock = function(blkId, config) {
		if (this.__blocks[blkId]) {
			var str = this.__blocks[blkId].call(this, smpl, this.getData(blkId));
			delete this.__data[blkId];
			
			var widget = this.__widgets[blkId];
			if (widget) {
				var lib = smpl.tpl.utils.libraries[widget.lib];
				
				widget = lib.retrieveWidget(widget.widget, config, str);
				
				str = widget.html;
			}
			this.__parsedBlocks[blkId] = this.__parsedBlocks[blkId] || [];
			this.__parsedBlocks[blkId].push(str);
			
			return widget && widget.widget;
		} else {
			throw new Error(smpl.string.supplant(MESSAGES.wrongParsed, [this.__name, 'block', blkId]));
		}
	};
	
	smpl.tpl.Template.prototype.parseWidget = function(widgetId, config) {
		if (this.__widgets[widgetId]) {
			var widget = this.__widgets[widgetId];
			config = config || {};
			if (widget.args) {
				for (var key in widget.args) {
					config[key] = widget.args[key];
				}
				//TODO: Support token in config
			}
			return this.parseBlock(widgetId, config);
		} else {
			throw new Error(smpl.string.supplant(MESSAGES.wrongParsed, [this.__name, 'widget', widgetId]));
		}
		
	};
	
	smpl.tpl.Template.prototype.parse = function() {
		this.reset();
		this.onParse.apply(this, arguments);
		this.parseBlock(smpl.tpl.utils.MAIN);
		return this;
	};
	
	smpl.tpl.Template.prototype.load = function(container, display) {
		/* jshint browser: true */
		if (typeof container === 'string') {
			container = document.getElementById(container);
		}
		if (container) {
			display = display || container.style.display;
			container.style.display = 'none';
			container.innerHTML = this.retrieve();
			if (this.onLoad) {
				this.onLoad(container, display);
			}
			container.style.display = display;
		}
	};
	
	smpl.tpl.Template.prototype.onParse = function(pfx, obj) {
		this.set(pfx, obj);
	};
	
	smpl.tpl.globalRepo = {};
	smpl.tpl.enableGlobal = function(key, obj) {
		if (key) {
			smpl.tpl.globalKey = key;
			smpl.tpl.globalObj = obj;
		} else if (smpl.global.smpl === smpl) {
			smpl.tpl.globalKey = 'smpl.tpl.globalRepo';
			smpl.tpl.globalObj = smpl.tpl.globalRepo;
		}
		return !!smpl.tpl.globalKey;
	};
	
	smpl.tpl.utils = {};
	smpl.tpl.utils.libraries = {};
	smpl.tpl.utils.registerLibrary = function(libName, library) {
		smpl.tpl.utils.libraries[libName] = library;
	};
	
	smpl.tpl.utils.MAIN = '_main';
	smpl.tpl.utils.make = function (tpl, txt) {
		var l = txt.length,
			pos = 0,
			startPos = 0,
			stack = [],
			newpos;
		tpl.__blocks = {};
		tpl.__parents = {};
		this.processToken(tpl, stack, {type: 'block', name: this.MAIN});
		while (pos < l) {
			var chr = txt.charAt(pos++);
			var nextChar = txt.charAt(pos);
			if (chr === '\\' && (nextChar === '\\' || nextChar === '{')) { // skip escaped \ and {
				++pos;
			} else if (chr === '<' && nextChar === '!' && txt.charAt(pos + 1) === '-' && txt.charAt(pos + 2) === '-') {
				// html comment. search for block or widget
				
				newpos = txt.indexOf('-->', pos + 3);
				if (newpos !== -1) {
					var m = REGEX.block.exec(txt.slice(pos + 3, newpos));
					if (!m) {
						m = REGEX.widget.exec(txt.slice(pos + 3, newpos));
					}
					if (m) {
						this.processToken(tpl, stack, {type: 'html', txt: txt.slice(startPos, pos - 1)});
						this.processToken(tpl, stack, {
							type: m[1].toLowerCase(),
							name: m[2],
							lib: m[3],
							widget: m[4],
							args: m[5] && this.parseArgs(m[5])
						});
						if (m[6]) { //Autoclose widget (`/` at the end of the block)
							this.processToken(tpl, stack, {type: '/' + m[1].toLowerCase(), name: m[2]});
						}
						pos = newpos + 3;
						startPos = pos;
					}
				}
			} else if (chr === '{') {
				newpos = this.jsTokenize(txt, pos);
				if (newpos !== pos) {
					var tokenTxt = txt.slice(startPos, pos - 1);
					this.processToken(tpl, stack, {type: 'html', txt: tokenTxt, beforeJs: true});
					startPos = pos;
					this.processToken(tpl, stack, {type: 'js', txt: txt.slice(pos, newpos)});
					startPos = pos = newpos + 1; //skip closing }
				}
			}
		}
		this.processToken(tpl, stack, {type: 'html', txt: txt.slice(startPos, pos)});
		this.processToken(tpl, stack, {type: '/block', name: this.MAIN});
	};
	
	smpl.tpl.utils.parseArgs = function(argsText) {
		var args = {};
		if (argsText) {
			var re = /([-\w]+)="(.*?)"/g;
			var arg;
			while ((arg = re.exec(argsText)) !== null) {
				args[arg[1]] = smpl.string.unescapeHTML(arg[2]);
			}
		}
		return args;
	};
	
	smpl.tpl.utils.processToken = function(tpl, stack, token) {
		var processed;
		switch (token.type) {
			case 'block':
			case 'widget':
				stack.push(token);
				if (tpl.__blocks[token.name]) {
					throw new Error(smpl.string.supplant(MESSAGES.duplicateBlock, [tpl.__name, token.name]));
				}
				tpl.__blocks[token.name] = [];
				if (token.type === 'widget') {
					tpl.__widgets[token.name] = {
						lib: token.lib,
						widget: token.widget,
						args: token.args
					};
				}
				break;
			case '/widget':
			case '/block':
				var closed = stack.pop();
				if (closed.name !== token.name || closed.type !== token.type.slice(1)) {
					throw new Error(smpl.string.supplant(MESSAGES.wrongClosed,
					                                     [token.type.slice(1), token.name, closed.type, closed.name]));
				}
				tpl.__blocks[closed.name] = 'return ' + (tpl.__blocks[closed.name].join(' + ') || '""');
				var parent = stack[stack.length - 1];
				if (parent) {
					tpl.__parents[closed.name] = parent.name;
				}
				processed = "(this.retrieve('" + closed.name + "') || '')";
				break;
			case 'html':
				token.txt = token.txt.replace(token.beforeJs ? /(\\*)\1\\(\{|$)/g : /(\\*)\1\\(\{)/g, '$1$2');
				processed = "'" + smpl.string.escapeJs(token.txt) + "'";
				break;
			case 'js':
				processed = this.compileJs(token.txt);
				break;
		}
		if (processed && stack.length) {
			var activeToken = stack[stack.length - 1];
			tpl.__blocks[activeToken.name].push(processed);
		}
	};
	
	smpl.tpl.utils.jsTokenize = function(input, pos) {
		var l = input.length,
			context = [],
			closingChar = {
				'(': ')',
				'[': ']',
				'{': '}'
			},
			lastchar = '',
			newLine = /[\u000A\u000D\u2028\u2029]/,
			at = input.charAt(pos) === '@',
			initialPos = pos;
		
		while (pos < l) {
			var chr = input.charAt(pos++);
			if (newLine.test(chr)) {
				if (!at) return initialPos;
			} else if (chr === '/' && input.charAt(pos) === '/') { //Single line comment
				if (!at) return initialPos;
				while (!newLine.test(input.charAt(++pos)));
				++pos;
			} else if (chr === '/' && input.charAt(pos) === '*') { //Multi line comment
				if (!at) return initialPos;
				var newpos = input.indexOf('*/', pos + 1);
				pos = (newpos === -1) ? l : newpos + 2;
			} else {
				if (chr === '"' || chr === "'") { //String
					pos = this.findUnescaped(input, chr, pos);
				} else if (chr === '/' && '(,=:[!&|?{};'.indexOf(lastchar) !== -1) { //Regexp literal
					while (pos < l) {
						chr = input.charAt(pos++);
						if (chr === '\\') {
							++pos;
						} else if (chr === '[') {
							pos = this.findUnescaped(input, ']', pos);
						} else if (chr === '/') {
							break;
						}
					}
				} else if (chr === '{' || chr === '[' || chr === '(') { //new context opening
					context.push(closingChar[chr]);
				} else if (chr === '}' || chr === ']' || chr === ')') { //closing context
					var lastContext = context.pop();
					if (lastContext !== chr) {
						--pos;
						break;
					}
				}
				if (!/\s/.test(chr)) {
					lastchar = chr;
				}
			}
		}
		return pos;
	};
	
	smpl.tpl.utils.findUnescaped = function(input, character, pos) {
		var l = input.length;
		while (pos < l) {
			var chr = input.charAt(pos++);
			if (chr === '\\') {
				++pos;
			} else if (chr === character) {
				break;
			}
		}
		return pos;
	};
	
	smpl.tpl.utils.compileJs = function(input) {
		var noEscape;
		if (input.charAt(0) === '{' && input.charAt(input.length - 1) === '}') {
			noEscape = true;
			input = input.slice(1, -1);
		}
		var noDolar = /^\$[@\s]/.test(input);
		var at = /^\$?@/.test(input);
		input = input.slice(+noDolar + at);
		if (!noDolar) {
			input = input.replace(/\$(?!\.)/g, '$.');
		}
		if (noEscape) {
			input = '((' + input + ")||'')";
		} else {
			input = 'smpl.string.escapeHTML(' + input + "||'')";
		}
		return input;
	};
	
	smpl.tpl.utils.precompile = function(html) {
		var tpl = new smpl.tpl.Template();
		tpl.init(html, true);
		var js = 'define(["module", "smpl/smpl.tpl"], function(module, smpl) {';
		js += 'return new smpl.tpl.Template(module.id,';
		js += JSON.stringify(tpl.__blocks);
		js += ',';
		js += JSON.stringify(tpl.__parents);
		js += ');});';
		return js;
	};
	
	return smpl;
});
