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
    this.verbose = false;
    this.delims = '+++';
    this.language = 'toml';
    this.stripIndex = false;

 	if(process.argv.indexOf("-o") != -1){ //does output flag exist?
		this.setOutput(process.argv[process.argv.indexOf("-o") + 1]); //grab the next item
	}

	if(process.argv.indexOf("-i") != -1){ //does input flag exist?
	    this.setInput(process.argv[process.argv.indexOf("-i") + 1]); //grab the next item
	}

	if(process.argv.indexOf("-d") != -1){ //does input flag exist?
	    this.setDelims(process.argv[process.argv.indexOf("-d") + 1]); //grab the next item
	}

	if(process.argv.indexOf("-l") != -1){ //does input flag exist?
	    this.setLanguage(process.argv[process.argv.indexOf("-l") + 1]); //grab the next item
	}

	if(process.argv.indexOf("-v") != -1){ //does input flag exist?
	    this.setVerbose(!this.verbose); //Toggle the verbose flag
	}

	if(process.argv.indexOf("-s") != -1){ //does input flag exist?
	    this.setStripIndex(!this.stripIndex); //Toggle the stripIndex flag
	}

	this.baseDir = path.dirname(this.input);
}

HugoLunr.prototype.setInput = function(input) {
	this.input = input;
}

HugoLunr.prototype.setOutput = function(output) {
	this.output = output;
}

HugoLunr.prototype.setVerbose = function(input) {
	this.verbose = input;
}

HugoLunr.prototype.setDelims = function(input) {
	this.delims = input;
}

HugoLunr.prototype.setLanguage = function(input) {
	this.language = input;
}

HugoLunr.prototype.setStripIndex = function(input) {
	this.stripIndex = input;
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
	var meta = matter.read(filePath, {
        delims: this.delims,
        lang: this.language
    });
    if (meta.data.draft === true){
		return;
	}

	if (ext == '.md'){
		var plainText = removeMd(meta.content);
	} else if (ext == '.html') {
		var plainText = striptags(meta.content);
	} else {
        if (this.verbose) {
            console.log("Sikpping " + filePath)
        }
        return
    }

    var uri = '/' + filePath.substring(0,filePath.lastIndexOf('.'));
	uri = uri.replace(self.baseDir +'/', '');

    if (this.stripIndex && uri.endsWith('index')) {
        uri = uri.substring(0,uri.lastIndexOf('index'));
    }

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





