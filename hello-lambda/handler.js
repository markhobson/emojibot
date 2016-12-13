'use strict';

module.exports.hello = (event, context, callback) => {
	console.log(JSON.stringify(event));
	
	const response = {
		statusCode: 200,
		body: 'Hello!'
	};
	
	callback(null, response);
};
