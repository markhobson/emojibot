// Generates src/emoji.js

const http = require('http');
const cheerio = require('cheerio');
const fs = require('fs');

const inputUrl = 'http://www.webpagefx.com/tools/emoji-cheat-sheet/index.html';
const outputFile = 'src/emoji.js';

const httpGet = (url) => new Promise((resolve, reject) => {
	http.get(url, response => {
		var body = '';
		response.on('data', chunk => body += chunk);
		response.on('end', () => resolve(body));
	})
});

const parse = (html) => {
	const $ = cheerio.load(html);
	const map = new Map();
	
	$('span.name').each((index, element) => {
		const name = $(element).text();
		const alternativeNames = ($(element).data('alternative-name') || '').split(/\s*,\s*/);
		map.set(name, alternativeNames);
	});

	return map;
};

const script = (map) => {
	const object = {};
	map.forEach((value, key) => object[key] = value);
	
	const string = JSON.stringify(object, null, '\t')
		.replace(/"/g, '\'');
	
	return `// DO NOT EDIT! Built by: npm run generate

module.exports = ${string};
`;
};

const fsWriteFile = (file, data) => new Promise((resolve, reject) => {
	fs.writeFile(file, data, (error) => {
		if (error) {
			reject(error);
		}
		else {
			resolve();
		}
	})
});

httpGet(inputUrl)
	.then(html => fsWriteFile(outputFile, script(parse(html))))
	.then(console.log(`Generated ${outputFile}`));
