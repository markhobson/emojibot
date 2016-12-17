// Generates src/emoji.js

const http = require('http');
const cheerio = require('cheerio');
const pluralize = require('pluralize');
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

const transform = (map) => {
	return [...map]
		.map(([name, alternativeNames]) => [[pluralize.singular(name), name]]
			.concat(alternativeNames.map(alternativeName => [pluralize.singular(alternativeName), name]))
		)
		.reduce((array, next) => array.concat(next))
		.reduce((map, next) => map.set(next[0], (map.get(next[0]) || []).concat(next[1])), new Map());
};

const script = (map) => {
	const string = JSON.stringify([...map])
		.replace(/"/g, '\'');
	
	return `// DO NOT EDIT! Built by: npm run generate

module.exports = new Map(${string});
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
	.then(html => fsWriteFile(outputFile, script(transform(parse(html)))))
	.then(console.log(`Generated ${outputFile}`));
