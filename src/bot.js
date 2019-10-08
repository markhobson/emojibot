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
	let name = toName(emoji);

	if (!text || !name) {
		return 'I don\'t understand.';
	}
	
	const paths = getPaths(text)
		.filter(path => contains(path.out, name));
	
	const path = randomElement(paths);
	
	return path
		? `I heard _${path.in}_ which made me think of ${emoji}.`
		: 'I never said that.';
}

function getPaths(text) {
	const words = text
		.replace(/http[^\s]*/, '')
		.replace(/@[^\s]+/, '')
		.match(/\w{2,}/g) || [];
	
	return words
		.map(word => ({in: word, out: word.toLowerCase()}))
		.filter(path => !stopwords.has(path.out))
		.map(path => ({...path, out: pluralize.singular(path.out)}))
		.filter(path => emoji.has(path.out))
		.map(path => ({...path, out: emoji.get(path.out)}));
}

const isBotMessage = event => event.subtype === 'bot_message';

const isSlashCommand = event => event.text.startsWith('/');

const isDirectMessage = event => event.channel.startsWith('D');

const toName = emoji => (/:(.*):/.exec(emoji) || [])[1];

const toEmoji = name => `:${name}:`;

const contains = (array, element) => array.indexOf(element) !== -1;

const randomElement = array => array[Math.floor(Math.random() * array.length)];

module.exports.process = process;
module.exports.explain = explain;
