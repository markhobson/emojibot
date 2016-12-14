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
	
	database.get(params, (error, result) => {
		if (error) {
			console.log(`Error retrieving OAuth access token: ${error}`);
			return;
		}
	
		callback(result.Item.botAccessToken);
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
	
	database.put(params, (error, result) => {
		if (error) {
			console.log(`Error storing OAuth access token: ${error}`);
		}
	});
};
