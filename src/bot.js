const pluralize = require('pluralize');
const stopwords = require('./stopwords.js');
const emoji = require('./emoji.js');

function process(event, web) {
	if (isBotMessage(event) || isSlashCommand(event)) {
		return;
	}
		
	const names = getPaths(event.text)
		.map(path => path.out)
		.reduce((array, next) => array.concat(next), []);
	
	const name = randomElement(names);
	
	if (isDirectMessage(event)) {
		const reply = name ? toEmoji(name) : 'I have nothing.';
		web.chat.postMessage({channel: event.channel, text: reply})
			.catch(error => console.log(`Error posting Slack message: ${error}`));
	}
	else if (name) {
		web.reactions.add({name, channel: event.channel, timestamp: event.event_ts})
			.catch(error => console.log(`Error adding Slack reaction: ${error}`));
	}
}

function explain(text, emoji) {
	const name = toName(emoji);

	if (!text || !name) {
		return 'I don\'t understand.';
	}
	
	const paths = getPaths(text)
		.filter(path => path.out.includes(name));
	
	const path = randomElement(paths);
	
	return path
		? `I heard _${path.in}_ which made me think of ${emoji}.`
		: 'I never said that.';
}

function getPaths(text) {
	const toPath = word => ({in: word, out: word});
	const mapPath = f => path => ({...path, out: f(path.out)});
	const toLowerCase = mapPath(out => out.toLowerCase());
	const notStopword = path => !stopwords.has(path.out);
	const toSingular = mapPath(out => pluralize.singular(out));
	const hasEmoji = path => emoji.has(path.out);
	const toEmoji = mapPath(out => emoji.get(out));
	
	return getWords(text)
		.map(toPath)
		.map(toLowerCase)
		.filter(notStopword)
		.map(toSingular)
		.filter(hasEmoji)
		.map(toEmoji);
}

function getWords(text) {
	const hyperlink = /http[^\s]*/;
	const mention = /@[^\s]+/;
	const emoji = /:[^\s]+:/;
	const word = /\w{2,}/g;
	
	return text
		.replace(hyperlink, '')
		.replace(mention, '')
		.replace(emoji, '')
		.match(word) || [];
}

const isBotMessage = event => event.subtype === 'bot_message';

const isSlashCommand = event => event.text.startsWith('/');

const isDirectMessage = event => event.channel.startsWith('D');

const toName = emoji => (/:(.*):/.exec(emoji) || [])[1];

const toEmoji = name => `:${name}:`;

const randomElement = array => array[Math.floor(Math.random() * array.length)];

module.exports.process = process;
module.exports.explain = explain;
