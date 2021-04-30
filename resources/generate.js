// Generates src/emoji.js

const https = require('https');
const cheerio = require('cheerio');
const pluralize = require('pluralize');
const fs = require('fs');

// http://www.emoji-cheat-sheet.com after following redirects
const inputUrl = 'https://www.webfx.com/tools/emoji-cheat-sheet/index.html';
const outputFile = 'src/emoji.js';

function httpsGet(url) {
	return new Promise((resolve, reject) =>
		https.get(url, response => {
			if (response.statusCode !== 200) {
				reject(new Error(`Request failed: ${response.statusCode} ${response.statusMessage}`));
				response.resume();
			}
			let body = '';
			response.on('data', chunk => body += chunk);
			response.on('end', () => resolve(body));
		})
	);
}

function parse(html) {
	const $ = cheerio.load(html);
	const map = new Map();
	
	$('span.name').each((index, element) => {
		const name = $(element).text();
		const alternativeNames = ($(element).data('alternative-name') || '').split(/\s*,\s*/).filter(s => s !== '');
		map.set(name, [...new Set(alternativeNames)]);
	});

	return map;
}

function transform(map) {
	return [...map]
		.map(([name, alternativeNames]) => [[pluralize.singular(name), name]]
			.concat(alternativeNames.map(alternativeName => [pluralize.singular(alternativeName), name]))
		)
		.reduce((array, next) => array.concat(next))
		.reduce((map, next) => map.set(next[0], (map.get(next[0]) || []).concat(next[1])), new Map());
}

function script(map) {
	const uniqueArray = array => [...new Set(array)];
	const sortedArray = array => Array.from(array).sort((a, b) => a.localeCompare(b));
	const sortedMap = map => Array.from(map).sort(([a], [b]) => a.localeCompare(b));

	const stringToLiteral = s => `'${s}'`;
	const arrayToLiteral = array => `[${sortedArray(uniqueArray(array)).map(stringToLiteral).join(',')}]`;
	const entryToLiteral = ([property, value]) => `[${stringToLiteral(property)},${arrayToLiteral(value)}]`;
	const mapToLiteral = map => `new Map([\n${sortedMap(map).map(entryToLiteral).join(',\n')}\n])`;

	return `// DO NOT EDIT! Built by: npm run generate

module.exports = ${mapToLiteral(map)};
`;
}

function fsWriteFile(file, data) {
	return new Promise((resolve, reject) =>
		fs.writeFile(file, data, (error) =>
			error ? reject(error) : resolve()
		)
	);
}

httpsGet(inputUrl)
	.then(html => fsWriteFile(outputFile, script(transform(parse(html)))))
	.then(() => console.log(`Generated ${outputFile}`))
	.catch(error => console.error(`Generation failed\n${error.stack}`));
