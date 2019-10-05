const pluralize = require('pluralize');
const stopwords = require('./stopwords.js');
const emoji = require('./emoji.js');

module.exports.process = function(event, web) {
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
		web.chat.postMessage({channel: event.channel, text: reply})
			.catch(error => console.log(`Error posting Slack message: ${error}`));
	}
	else if (name) {
		web.reactions.add({name, channel: event.channel, timestamp: event.event_ts})
			.catch(error => console.log(`Error adding Slack reaction: ${error}`));
	}
};
