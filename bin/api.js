#!/usr/bin/env node
var hugolunr = require('../');
var indexer = new hugolunr();
indexer.setInput('content/faq/**');
indexer.setOutput('public/faq.json');
indexer.index();
