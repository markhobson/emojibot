const pluralize = require('pluralize');
const emoji = require('./emoji.js');

const Bot = function(web) {
	this.web = web;
};

Bot.prototype.process = function(event) {
	const reply = say(event.text);
	
	this.web.chat.postMessage(event.channel, reply)
		.catch(error => console.log(`Error posting Slack message: ${error}`));
};

const say = (text) => {
	const replies = (text.match(/\w{3,}/g) || [])
		.map(word => word.toLowerCase())
		.map(word => [pluralize.singular(word), pluralize.plural(word)])
		.reduce((x, y) => x.concat(y), [])
		.filter(word => emoji[word])
		.map(word => `:${word}:`);
	
	if (replies.length === 0) {
		return 'I have nothing.';
	}
	
	return replies[Math.floor(Math.random() * replies.length)];
};

module.exports = Bot;
