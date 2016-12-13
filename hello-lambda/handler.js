'use strict';

const https = require('https');

const client = {
	id: process.env.CLIENT_ID,
	secret: process.env.CLIENT_SECRET
}

module.exports.install = (event, context, callback) => {
	callback(null, {
		statusCode: 200,
		headers: {
			'Content-Type': 'text/html'
		},
		body: `<!DOCTYPE html>
			<html>
				<head>
					<title>hellobot</title>
				</head>
				<body>
					<h1>hellobot</h1>
					<p>Click the button to add @hellobot to Slack!</p>
					<a href="https://slack.com/oauth/authorize?scope=bot&client_id=${client.id}">
						<img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"/>
					</a>
				</body>
			</html>`
	});
};

module.exports.thanks = (event, context, callback) => {
	const code = event.queryStringParameters.code;
	
	https.get(`https://slack.com/api/oauth.access?client_id=${client.id}&client_secret=${client.secret}&code=${code}`, response => {
		var body = '';
		response.on('data', chunk => body += chunk);
		response.on('end', () => {
			const jsonBody = JSON.parse(body);
			const botAccessToken = jsonBody.bot.bot_access_token;
			const teamId = jsonBody.team_id;
			console.log(`team id = ${teamId}, bot access token = ${botAccessToken}`);
		});
	});
	
	callback(null, {
		statusCode: 200,
		headers: {
			'Content-Type': 'text/html'
		},
		body: `<!DOCTYPE html>
			<html>
				<head>
					<title>hellobot</title>
				</head>
				<body>
					<h1>hellobot</h1>
					<p>Thanks and enjoy!</p>
				</body>
			</html>`
	});
};

module.exports.hello = (event, context, callback) => {
	console.log(JSON.stringify(event));
	
	var jsonBody = JSON.parse(event.body);
	
	if (jsonBody.type === 'url_verification') {
		callback(null, {
			statusCode: 200,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: jsonBody.challenge
		});
	}

	callback(null, {
		statusCode: 200,
		body: 'Hello!'
	});
};
