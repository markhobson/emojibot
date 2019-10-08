const https = require('https');
const querystring = require('querystring');
const OAuth = require('./oauth.js');
const Templates = require('./templates.js');
const WebClient = require('@slack/web-api').WebClient;
const Bot = require('./bot.js');

const client = {
	id: process.env.CLIENT_ID,
	secret: process.env.CLIENT_SECRET
};

function install(event, context, callback) {
	callback(null, {
		statusCode: 200,
		headers: {
			'Content-Type': 'text/html'
		},
		body: Templates.install(client.id)
	});
}

function authorized(event, context, callback) {
	const code = event.queryStringParameters.code;
	
	https.get(`https://slack.com/api/oauth.access?client_id=${client.id}&client_secret=${client.secret}&code=${code}`, response => {
		let body = '';
		response.on('data', chunk => body += chunk);
		response.on('end', () => {
			const jsonBody = JSON.parse(body);
			OAuth.storeAccessToken(jsonBody.team_id, jsonBody.bot.bot_access_token)
				.catch(error => console.log(error));
		});
	});
	
	callback(null, {
		statusCode: 200,
		headers: {
			'Content-Type': 'text/html'
		},
		body: Templates.authorized()
	});
}

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
			OAuth.retrieveAccessToken(jsonBody.team_id)
				.then(botAccessToken => handleEvent(jsonBody.event, botAccessToken))
				.catch(error => console.log(error));
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

module.exports.install = install;
module.exports.authorized = authorized;
module.exports.event = event;
module.exports.explain  = explain;
