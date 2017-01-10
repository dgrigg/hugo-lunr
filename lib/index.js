var fs = require('fs');
var glob = require('glob');
var matter = require('gray-matter');
var removeMd = require('remove-markdown');
var striptags = require('striptags');
var path = require('path');
/*
exports.hugolunr = function(){
	var h = new HugoLunr();
	return h.index();
}*/

module.exports = HugoLunr;


function HugoLunr(input, output){
	var self = this;
	var stream;
	this.list = [];

	//defaults
	this.input = 'content/**';
	this.output = 'public/lunr.json';
	this.excludes = [];

	// Default file reading options
	this.fileOpts = {
		matter: {delims: '+++', lang:'toml'},
		taxonomies: ['tags'],
		indexDrafts: false,
		params: [],
		callback: null
	};

 	if(process.argv.indexOf("-o") != -1){ //does output flag exist?
		this.setOutput(process.argv[process.argv.indexOf("-o") + 1]); //grab the next item
	}

	if(process.argv.indexOf("-i") != -1){ //does input flag exist?
	    this.setInput(process.argv[process.argv.indexOf("-i") + 1]); //grab the next item
	}

	if(process.argv.indexOf("--excludes") != -1){ //does excludes flag exist?
	    this.setExcludes(process.argv[process.argv.indexOf("--excludes") + 1]); //grab the next item
	}

	if(process.argv.indexOf("--fileopts") != -1){ //does fileopts flag exist?
	    this.setFileOpts(process.argv[process.argv.indexOf("--fileopts") + 1]); //grab the next item
	}

	this.baseDir = path.dirname(this.input);
}

HugoLunr.prototype.setInput = function(input) {
	this.input = input;
	this.baseDir = path.dirname(input);
}

HugoLunr.prototype.setOutput = function(output) {
	this.output = output;
}

HugoLunr.prototype.setExcludes = function(excludes) {
	// Comma-separated array of glob paths from --excludes arg
	// Or array if using API
	this.excludes = typeof excludes === 'string' ? excludes.split(',') : excludes;
}

HugoLunr.prototype.setFileOpts = function(opts) {
	// If string assume path to opts JSON file
	// otherwise assume object was passed to API
	var optsObj = opts;
	if ('string' === typeof opts) {
		try {
			var filename = path.resolve(path.dirname(process.argv[1]), opts);
			optsObj = JSON.parse(fs.readFileSync(filename, 'utf8'));
		} catch (e)  {
			optsObj = null;
		}
	}

	if (!optsObj) {
		return;
	}

	// Merge into this.fileOpts
	var self = this;
	Object.keys(optsObj).forEach(function(key) {
		self.fileOpts[key] = optsObj[key];
	});
}

HugoLunr.prototype.index = function(input, output){
	var self = this;

	if (input){
		self.input = input;
	}

	if (output){
		self.output = output;
	}

	self.list = [];
	self.stream = fs.createWriteStream(self.output);
	self.readDirectory(self.input);
	self.stream.write(JSON.stringify(self.list, null,4) );
	self.stream.end();
}


HugoLunr.prototype.readDirectory = function(path){
	var self = this;
	var files = glob.sync(path, { ignore: this.excludes });
	var len = files.length;
	for (var i=0;i<len;i++){
		var stats = fs.lstatSync(files[i]);
		if (!stats.isDirectory()){
			self.readFile(files[i]);
		}
	}
  	return true;
}

HugoLunr.prototype.readFile = function(filePath){
	var self = this;
	var ext = path.extname(filePath);
	var meta = matter.read(filePath, self.fileOpts.matter);
	if (meta.data.draft === true && !self.fileOpts.indexDrafts){
		return;
	}

	// Setup title and content
	var item = {
		title: meta.data.title || '',
		content: ext == '.md' ? removeMd(meta.content) : striptags(meta.content)
	};

	// Setup URI
	if (meta.data.url != undefined){
		item.uri = meta.data.url;
	} else {
		var uri = '/' + filePath.substring(0,filePath.lastIndexOf('.'));
		uri = uri.replace(self.baseDir +'/', '');

		if (meta.data.slug !=  undefined){
			uri = path.dirname(uri) + meta.data.slug;
		}

		item.uri = uri;
	}

	// Setup taxonomies
	self.fileOpts.taxonomies.forEach(function(taxonomy) {
		item[taxonomy] = meta.data[taxonomy] || [];
	});

	// Setup additional specified params
	if (self.fileOpts.params.length) {
		self.fileOpts.params.forEach(function(param) {
			item[param] = meta.data[param] || null;
		});
	}

	if ('function' === typeof self.fileOpts.callback) {
		item = self.fileOpts.callback(item);
	}

	self.list.push(item);
}
