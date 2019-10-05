// Generates src/emoji.js

const https = require('https');
const cheerio = require('cheerio');
const pluralize = require('pluralize');
const fs = require('fs');

const inputUrl = 'https://www.webfx.com/tools/emoji-cheat-sheet/index.html';
const outputFile = 'src/emoji.js';

const httpsGet = (url) => new Promise((resolve, reject) => {
	https.get(url, response => {
		if (response.statusCode != 200) {
			reject(new Error(`Request failed: ${response.statusCode} ${response.statusMessage}`));
			response.resume();
		}
		var body = '';
		response.on('data', chunk => body += chunk);
		response.on('end', () => resolve(body));
	});
});

const parse = (html) => {
	const $ = cheerio.load(html);
	const map = new Map();
	
	$('span.name').each((index, element) => {
		const name = $(element).text();
		const alternativeNames = ($(element).data('alternative-name') || '').split(/\s*,\s*/).filter(s => s !== '');
		map.set(name, [...new Set(alternativeNames)]);
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
	const stringAsLiteral = s => `'${s}'`;
	const arrayAsLiteral = array => `[${array.map(stringAsLiteral).join(',')}]`;
	const entryAsLiteral = ([property, value]) => `[${stringAsLiteral(property)},${arrayAsLiteral(value)}]`;
	const mapAsSortedEntries = map => Array.from(map).sort(([a], [b]) => a.localeCompare(b));
	const mapAsLiteral = map => `new Map([\n${mapAsSortedEntries(map).map(entryAsLiteral).join(',\n')}\n])`;

	return `// DO NOT EDIT! Built by: npm run generate

module.exports = ${mapAsLiteral(map)};
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

httpsGet(inputUrl)
	.then(html => fsWriteFile(outputFile, script(transform(parse(html)))))
	.then(() => console.log(`Generated ${outputFile}`))
	.catch(error => console.error(`Generation failed\n${error.stack}`));
