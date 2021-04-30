// Generates src/emoji.js

const emojilib = require('emojilib');
const emojidata = require('emoji-datasource');
const pluralize = require('pluralize');
const fs = require('fs');

const outputFile = 'src/emoji.js';

function emojiMap() {
	return emojidata
		.map(emoji => [emoji.short_name, emojilib[parseUnified(emoji.unified)] || []])
		.reduce((map, next) => map.set(next[0], next[1]), new Map());
}

function parseUnified(unified) {
	const codePoints = unified
		.split('-')
		.map(codePoint => parseInt(codePoint, 16));
	
	return String.fromCodePoint(...codePoints);
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

	const stringToLiteral = s => `'${s.replace('\'', '\\\'')}'`;
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

fsWriteFile(outputFile, script(transform(emojiMap())))
	.then(() => console.log(`Generated ${outputFile}`))
	.catch(error => console.error(`Generation failed\n${error.stack}`));
