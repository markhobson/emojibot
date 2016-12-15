const pluralize = require('pluralize');
const emoji = require('./emoji.js');

const wordToEmojis = Object.keys(emoji)
	.map(name => [[name, name]].concat(emoji[name].map(alternative => [alternative, name])))
	.reduce((array, next) => array.concat(next))
	.reduce((map, next) => map.set(next[0], (map.get(next[0]) || []).concat(next[1])), new Map());

const commonWords = ['it', 'like', 'on', 'you', 'what']
	.reduce((map, next) => map.set(next, true), new Map());

const Bot = function(web) {
	this.web = web;
};

Bot.prototype.process = function(event) {
	const text = event.text.replace(/http[^\s]*/, '');
	
	const names = (text.match(/\w{2,}/g) || [])
		.map(word => word.toLowerCase())
		.filter(word => !commonWords.has(word))
		.map(word => [pluralize.singular(word), pluralize.plural(word)])
		.reduce((array, next) => array.concat(next), [])
		.filter(word => wordToEmojis.has(word))
		.map(word => wordToEmojis.get(word))
		.reduce((array, next) => array.concat(next), []);
	
	const name = names[Math.floor(Math.random() * names.length)];
	
	if (event.channel.startsWith('D')) {
		const reply = name ? `:${name}:` : 'I have nothing.';
		this.web.chat.postMessage(event.channel, reply)
			.catch(error => console.log(`Error posting Slack message: ${error}`));
	}
	else if (name) {
		this.web.reactions.add(name, {channel: event.channel, timestamp: event.event_ts})
			.catch(error => console.log(`Error adding Slack reaction: ${error}`));
	}
};

module.exports = Bot;
