# lunr-hugo
## Generate lunr.js index files from Hugo static sites
A simple way to add site search to your static [Hugo](https://gohugo.io/) site using [Lunr.js](http://lunrjs.com/).

## Installation

Install the lunr-hugo utility via [npm](http://npmjs.org/):

```
$ npm install lunr-hugo
```

## Options
By default lunr-hugo will read the `content` directory of you and output the lunr index to `public/lunr.json`. If you are using the command line implementation you can pass an input directory `-i` and and output path/file `-o`.


## How to use lunr-hugo CLI
The easiest way to use lunr-hugo is via npm scripts:
```
  "scripts": {
    "index": "lunr-hugo"
  },
```

or to pass arguments for input and output:

```
  "scripts": {
    "index": "lunr-hugo -i \"content/subdir/**\" -o public/my-index.json"
  },
```

Which can be executed from a terminal prompt
```
$ npm run index
```

## How to use lunr-hugo API
```javascript
var hugolunr = require('lunr-hugo');
new hugolunr().index();
```

or to set input/output paths

```javascript
var hugolunr = require('lunr-hugo');
var h = new hugolunr();
h.setInput('content/faq/**');
h.setOutput('public/faq.json');
h.index();
```

# License
This project is a fork from https://github.com/dgrigg/hugo-lunr
It is under ISC License. Check LICENSE.md for more information. 
