const pluralize = require('pluralize');
const emoji = require('./emoji.js');

const wordToEmojis = Object.keys(emoji)
	.map(name => [[name, `:${name}:`]].concat(emoji[name].map(alternative => [alternative, `:${name}:`])))
	.reduce((array, next) => array.concat(next))
	.reduce((map, next) => map.set(next[0], (map.get(next[0]) || []).concat(next[1])), new Map());

const commonWords = ['it', 'like', 'you']
	.reduce((map, next) => map.set(next, true), new Map());

const Bot = function(web) {
	this.web = web;
};

Bot.prototype.process = function(event) {
	const replies = (event.text.match(/\w{2,}/g) || [])
		.map(word => word.toLowerCase())
		.filter(word => !commonWords.has(word))
		.map(word => [pluralize.singular(word), pluralize.plural(word)])
		.reduce((array, next) => array.concat(next), [])
		.filter(word => wordToEmojis.has(word))
		.map(word => wordToEmojis.get(word))
		.reduce((array, next) => array.concat(next), []);
	
	const direct = event.channel.startsWith('D');
	const defaultReply = direct ? 'I have nothing.' : undefined;
	const reply = replies[Math.floor(Math.random() * replies.length)] || defaultReply;

	if (reply) {
		this.web.chat.postMessage(event.channel, reply)
			.catch(error => console.log(`Error posting Slack message: ${error}`));
	}
};

module.exports = Bot;
