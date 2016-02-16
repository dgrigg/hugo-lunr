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

 	if(process.argv.indexOf("-o") != -1){ //does output flag exist?
		this.setOutput(process.argv[process.argv.indexOf("-o") + 1]); //grab the next item
	}

	if(process.argv.indexOf("-i") != -1){ //does input flag exist?
	    this.setInput(process.argv[process.argv.indexOf("-i") + 1]); //grab the next item
	}

	this.baseDir = path.dirname(this.input);
}

HugoLunr.prototype.setInput = function(input) {
	this.input = input;
}

HugoLunr.prototype.setOutput = function(output) {
	this.output = output;
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
	var files = glob.sync(path);
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
	var meta = matter.read(filePath, {delims: '+++', lang:'toml'});
	if (meta.data.draft === true){
		return;
	}

	if (ext == '.md'){
		var plainText = removeMd(meta.content);
	} else {
		var plainText = striptags(meta.content);
	}

	var uri = '/' + filePath.substring(0,filePath.lastIndexOf('.'));
	uri = uri.replace(self.baseDir +'/', '');

	if (meta.data.slug !=  undefined){
		uri = path.dirname(uri) + meta.data.slug;
	}

	if (meta.data.url != undefined){
		uri = meta.data.url
	}

	var tags = [];

	if (meta.data.tags != undefined){
		tags = meta.data.tags;
	}

	var item = {'uri' : uri , 'title' : meta.data.title, 'content':plainText, 'tags':tags};
	self.list.push(item);
}





