define(['smpl.core', 'smpl.string', 'smpl.utils'], function(smpl) {
	smpl.tpl = {};
	
	smpl.tpl.Template = function (name, txt) {
		this.name = name;
		if (txt !== undefined) {
			this.init(txt);
		}
	};

	smpl.tpl.Template.prototype.init = function(txt) {
		var params = Array.prototype.slice.call(arguments, 1);
		this.onCreate && this.onCreate.apply(this, params);
		smpl.tpl.utils.make(this, txt);
	};

	smpl.tpl.Template.prototype.set = function(key, value) {
		this.data[key] = value;
	};

	smpl.tpl.Template.prototype.retrieve = function(blkId) {
		blkId = blkId || smpl.tpl.utils.MAIN;
		blk = this.parsedBlocks[blkId];
		if (blk) {
			delete this.parsedBlocks[blkId]
			return blk.join('');
		} else {
			return '';
		}
	};

	smpl.tpl.Template.prototype.reset = function(blkId) {
		this.data = {};
		this.parsedBlocks = {};
	};

	smpl.tpl.Template.prototype.parseBlock = function(blkId) {
		var str = this.blocks[blkId].call(this);
		this.parsedBlocks[blkId] = this.parsedBlocks[blkId] || [];
		this.parsedBlocks[blkId].push(str);
	};

	smpl.tpl.Template.prototype.parse = function() {
		this.reset();
		this.onParse.apply(this, arguments);
		this.parseBlock(smpl.tpl.utils.MAIN);
	};

	smpl.tpl.Template.prototype.load = function(container, display) {
		if (typeof container === "string") {
			container = document.getElementById(container);
		}
		if (container) {
			display = display || container.style.display;
			container.style.display = "none";
			smpl.dom.updateContainer(container, this.retrieve());
			this.onLoad && this.onLoad();
			container.style.display = display;
		}
	};

	smpl.tpl.Template.prototype.onParse = function(pfx, obj) {
		this.set(pfx, obj);
	};


	smpl.tpl.utils = {};
	smpl.tpl.utils.libraries = {};
	smpl.tpl.utils.registerLibrary = function(libName, library) {
		smpl.tpl.utils.libraries[libName] = library;
	};
	smpl.tpl.utils.retrieveWidget = function(libName) {
		var lib = smpl.tpl.utils.libraries[libName];
		if (lib) {
			lib.retrieveWidget.apply(lib, arguments.slice(1));
		}
	};

	smpl.tpl.utils.MAIN = "_main";
	smpl.tpl.utils.make = function (tpl, txt) {
		var l = txt.length,
			pos = 0,
			startPos = 0,
			stack = [];
		tpl.blocks = {};
		this.processToken(tpl, stack, {type: 'BEGIN', txt: this.MAIN});
		while (pos < l) {
			var chr = txt.charAt(pos++);
			if (chr === '\\' && '\\{'.indexOf(txt.charAt(pos)) !== -1) { // skip escaped \ and {
				++pos;
			} else if (chr === '<' && txt.charAt(pos) === '!' && txt.charAt(pos + 1) === '-' && txt.charAt(pos + 2) === '-') { // <!-- (BEGIN|END): [-\w]+ --> block
				var newpos = txt.indexOf('-->', pos + 3);
				if (newpos !== -1) {
					var m = /^\s+(BEGIN|END):\s+([-\w]+)\s+$/.exec(txt.substring(pos + 3, newpos));
					if (m) {
						this.processToken(tpl, stack, {type: 'html', txt: txt.substring(startPos, pos - 1)});
						this.processToken(tpl, stack, {type: m[1], txt: m[2]});
						pos = newpos + 3;
						startPos = pos;
					}
				}
			} else if (chr === '{') {
				this.processToken(tpl, stack, {type: 'html', txt: txt.substring(startPos, pos - 1), beforeJs: true});
				startPos = pos;
				pos = this.jsTokenize(txt, pos);
				this.processToken(tpl, stack, {type: 'js', txt: txt.substring(startPos, pos)});
				startPos = ++pos; //skip closing }
			}
		}
		this.processToken(tpl, stack, {type: 'html', txt: txt.substring(startPos, pos)});
		this.processToken(tpl, stack, {type: 'END', txt: this.MAIN});
	};

	smpl.tpl.utils.processToken = function(tpl, stack, token) {
		var processed;
		switch (token.type) {
			case 'BEGIN':
				stack.push(token.txt);
				tpl.blocks[token.txt] = [];
				break;
			case 'END':
				var closed = stack.pop();
				if (closed !== token.txt) {
					console.error(smpl.string.supplant('Incorrect block closed <{0}>. Openned block was <{1}>.', [token.txt, closed]));
				}
				tpl.blocks[closed] = new Function('return ' + tpl.blocks[closed].join(' + '));
				processed = "(this.retrieve('" + closed + "') || '')";
				break;
			case 'html':
				token.txt = token.txt.replace(token.beforeJs ? /(\\*)\1\\({|$)/g : /(\\*)\1\\({)/g,"$1$2");
				processed = "'" + smpl.utils.escapeJs(token.txt) + "'";
				break
			case 'js':
				processed = '((' + this.compileJs(token.txt) + ') || "")';
				break;
		}
		if (processed && stack.length) {
			tpl.blocks[stack[stack.length - 1]].push(processed);
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
			lastchar = '';
		
		while (pos < l) {
			var chr = input.charAt(pos++);
			if (chr === '/' && input.charAt(pos) === '/') { //Single line comment
				while(!/[\u000A\u000D\u2028\u2029]/.test(input.charAt(++pos)));
				++pos;
			} else if (chr === '/' && input.charAt(pos) === '*') { //Multi line comment
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
					if (lastContext != chr) {
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

	smpl.tpl.utils.findUnescaped = function(input, char, pos) {
		var l = input.length;
		while (pos < l) {
			chr = input.charAt(pos++);
			if (chr === '\\') {
				++pos;
			} else if (chr === char) {
				break;
			}
		}
		return pos;
	};

	smpl.tpl.utils.compileJs = function(input) {
		var noDolar = /^\$[@\s]/.test(input);
		var at = /^\$?@/.test(input);
		input = input.substring(+noDolar + at);
		if (!noDolar) {
			input = input.replace(/\$/g, 'this.data.');
		}
		if (at) {
			var id = /^[-\w]+(?::[-\w]+)*\s/.exec(input);
			var args = input.substring(id[0].length).trim();
			input = 'smpl.tpl.utils.retrieveWidget(' + id[0].split(':').join() + (args ? ', ' + args : '') + ')';
		}
		return input;
	};
	
	return smpl.tpl;
});
