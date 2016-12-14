const AWS = require('aws-sdk');

const database = new AWS.DynamoDB.DocumentClient();
const accessTokenTableName = 'accessTokenTable';

module.exports.retrieveAccessToken = (teamId, callback) => {
	const params = {
		TableName: accessTokenTableName,
		Key: {
			teamId: teamId
		}
	};
	
	database.get(params).promise()
		.then((result) => {
			callback(result.Item.botAccessToken);
		})
		.catch((error) => {
			console.log(`Error retrieving OAuth access token: ${error}`);
		});
};

module.exports.storeAccessToken = (teamId, botAccessToken) => {
	const params = {
		TableName: accessTokenTableName,
		Item: {
			teamId: teamId,
			botAccessToken: botAccessToken
		}
	};
	
	database.put(params).promise()
		.catch((error) => {
			console.log(`Error storing OAuth access token: ${error}`);
		});
};
