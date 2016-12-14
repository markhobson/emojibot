'use strict';

const https = require('https');
const AWS = require('aws-sdk');

const client = {
	id: process.env.CLIENT_ID,
	secret: process.env.CLIENT_SECRET
}
const accessTokenTableName = 'accessTokenTable';

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
			const database = new AWS.DynamoDB.DocumentClient();
			const jsonBody = JSON.parse(body);
			const params = {
				TableName: accessTokenTableName,
				Item: {
					teamId: jsonBody.team_id,
					botAccessToken: jsonBody.bot.bot_access_token
				}
			};
			database.put(params, (error, result) => {
				if (error) {
					console.log(`Error storing OAuth access token: ${error}`);
				}
			});
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
			const database = new AWS.DynamoDB.DocumentClient();
			const params = {
				TableName: accessTokenTableName,
				Key: {
					teamId: jsonBody.team_id
				}
			};
			database.get(params, (error, result) => {
				if (error) {
					console.log(`Error retrieving OAuth access token: ${error}`);
					return;
				}
				const botAccessToken = result.Item.botAccessToken;
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

const handleEvent = (event, accessToken) => {
	console.log(`event=${JSON.stringify(event)} hasAccessToken=${accessToken !== undefined}`);
};
