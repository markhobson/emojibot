const https = require('https');
const WebClient = require('@slack/client').WebClient;
const OAuth = require('./oauth.js');
const Templates = require('./templates.js');
const emoji = require('./emoji.js');

const client = {
	id: process.env.CLIENT_ID,
	secret: process.env.CLIENT_SECRET
};

module.exports.install = (event, context, callback) => {
	callback(null, {
		statusCode: 200,
		headers: {
			'Content-Type': 'text/html'
		},
		body: Templates.install(client.id)
	});
};

module.exports.authorized = (event, context, callback) => {
	const code = event.queryStringParameters.code;
	
	https.get(`https://slack.com/api/oauth.access?client_id=${client.id}&client_secret=${client.secret}&code=${code}`, response => {
		var body = '';
		response.on('data', chunk => body += chunk);
		response.on('end', () => {
			const jsonBody = JSON.parse(body);
			OAuth.storeAccessToken(jsonBody.team_id, jsonBody.bot.bot_access_token);
		});
	});
	
	callback(null, {
		statusCode: 200,
		headers: {
			'Content-Type': 'text/html'
		},
		body: Templates.authorized(client.id, client.secret)
	});
};

module.exports.event = (event, context, callback) => {
	const jsonBody = JSON.parse(event.body);
	var response;
	
	switch (jsonBody.type) {
		case 'url_verification':
			response = {
				statusCode: 200,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: jsonBody.challenge
			};
			break;
		
		case 'event_callback':
			OAuth.retrieveAccessToken(jsonBody.team_id, (botAccessToken) => {
				handleEvent(jsonBody.event, botAccessToken);
			});
			response = {
				statusCode: 200
			};
			break;
			
		default:
			response = {
				statusCode: 200
			};
	}

	callback(null, response);
};

const handleEvent = (event, token) => {
	const web = new WebClient(token);
	
	switch (event.type) {
		case 'message':
			// ignore ourselves
			if (event.subtype && event.subtype === 'bot_message') {
				break;
			}
			const reply = emoji[event.text] ? `:${event.text}:` : 'Sorry, I\'ve run out of emojis. :(';
			web.chat.postMessage(event.channel, reply, function(error, result) {
				if (error) {
					console.log(`Error posting Slack message: ${error}`);
				}
			});
			break;
	}
};
