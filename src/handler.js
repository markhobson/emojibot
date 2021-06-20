const querystring = require('querystring');
const { WebClient } = require('@slack/web-api');
const Bot = require('./bot.js');

const botAccessToken = process.env.BOT_ACCESS_TOKEN;

function event(event, context, callback) {
	const jsonBody = JSON.parse(event.body);
	const response = {
		statusCode: 200
	};
	
	switch (jsonBody.type) {
		case 'url_verification':
			response.headers = {
				'Content-Type': 'application/x-www-form-urlencoded'
			};
			response.body = jsonBody.challenge;
			break;
		
		case 'event_callback':
			handleEvent(jsonBody.event, botAccessToken);
			break;
	}

	callback(null, response);
}

function handleEvent(event, token) {
	switch (event.type) {
		case 'message':
			const web = new WebClient(token);
			Bot.process(event, web);
			break;
	}
}

function explain(event, context, callback) {
	const jsonBody = querystring.parse(event.body);
	
	const requestText = jsonBody.text;
	const words = requestText.split(' ');
	const emoji = words.pop();
	const text = words.join(' ');

	const responseText = Bot.explain(text, emoji);

	callback(null, {
		statusCode: 200,
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			'response_type': 'ephemeral',
			'text': responseText
		})
	});
}

module.exports.event = event;
module.exports.explain = explain;
