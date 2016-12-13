'use strict';

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
