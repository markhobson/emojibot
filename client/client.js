var AWS = require('aws-sdk');

// workaround: https://github.com/aws/aws-sdk-js/issues/1039
AWS.config.update({region: 'eu-west-1'});

var lambda = new AWS.Lambda();
lambda.invoke({FunctionName: 'aws-nodejs-dev-hello'}, function(error, data) {
	console.log(error ? error : data);
});
