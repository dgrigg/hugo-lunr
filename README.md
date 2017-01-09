# hugo-lunr
## Generate lunr.js index files from Hugo static sites
A simple way to add site search to your static [Hugo](https://gohugo.io/) site using [Lunr.js](http://lunrjs.com/).

## Installation

Install the hugo-lunr utility via [npm](http://npmjs.org/):

```
$ npm install hugo-lunr
```

## Options
By default hugo-lunr will read the `content` directory of you and output the lunr index to `public/lunr.json`. If you are using the command line implementation you can pass an input directory `-i` and an output path/file `-o`.

To exclude folders within your input directory, you can pass comma-separated [glob patterns](https://www.npmjs.com/package/glob#glob-primer) with the `--excludes` parameter, e.g.

```
hugo-lunr -i \"content/subdir/**\" -o public/my-index.json --excludes \"content/images/**\"
```

Note that the API version of this flag (`setExcludes()`) can accept a comma-separated string or an array of glob patterns.

## How to use hugo-lunr CLI
The easiest way to use hugo-lunr is via npm scripts:
```
  "scripts": {
    "index": "hugo-lunr"
  },
```

or to pass arguments for input and output:

```
  "scripts": {
    "index": "hugo-lunr -i \"content/subdir/**\" -o public/my-index.json"
  },
```

Which can be executed from a terminal prompt
```
$ npm run index
```

## How to use hugo-lunr API
```javascript
var hugolunr = require('hugo-lunr');
new hugolunr().index();
```

or to set input/output paths

```javascript
var hugolunr = require('hugo-lunr');
var h = new hugolunr();
h.setInput('content/faq/**');
h.setOutput('public/faq.json');
h.setExcludes(['content/faq/images/**', 'content/faq/subdir/assets/**']);
h.index();
```
