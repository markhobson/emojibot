const pluralize = require('pluralize');
const emoji = require('./emoji.js');

const wordToEmojis = Object.keys(emoji)
	.map(name => [[name, `:${name}:`]].concat(emoji[name].map(alternative => [alternative, `:${name}:`])))
	.reduce((array, next) => array.concat(next))
	.reduce((map, next) => {
		map[next[0]] = (map[next[0]] || []).concat(next[1]);
		return map;
	}, {});

const commonWords = [
	'it',
	'like',
	'you'
].reduce((map, next) => {
	map[next] = true;
	return map
}, {});

const Bot = function(web) {
	this.web = web;
};

Bot.prototype.process = function(event) {
	const reply = say(event.text);
	
	this.web.chat.postMessage(event.channel, reply)
		.catch(error => console.log(`Error posting Slack message: ${error}`));
};

const say = (text) => {
	const replies = (text.match(/\w{2,}/g) || [])
		.map(word => word.toLowerCase())
		.filter(word => !commonWords[word])
		.map(word => [pluralize.singular(word), pluralize.plural(word)])
		.reduce((array, next) => array.concat(next), [])
		.map(word => wordToEmojis[word])
		.filter(emojis => emojis !== undefined)
		.reduce((array, next) => array.concat(next), []);
	
	if (replies.length === 0) {
		return 'I have nothing.';
	}
	
	return replies[Math.floor(Math.random() * replies.length)];
};

module.exports = Bot;
