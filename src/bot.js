const pluralize = require('pluralize');
const stopwords = require('./stopwords.js');
const emoji = require('./emoji.js');

const Bot = function(web) {
	this.web = web;
};

Bot.prototype.process = function(event) {
	const text = event.text
		.replace(/http[^\s]*/, '')
		.replace(/@[^\s]+/, '');
	
	const names = (text.match(/\w{2,}/g) || [])
		.map(word => word.toLowerCase())
		.filter(word => !stopwords.has(word))
		.map(word => pluralize.singular(word))
		.filter(word => emoji.has(word))
		.map(word => emoji.get(word))
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
