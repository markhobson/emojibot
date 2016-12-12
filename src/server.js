var AWS = require('aws-sdk');

// workaround: https://github.com/aws/aws-sdk-js/issues/1039
AWS.config.update({region: 'us-west-2'});

var lambda = new AWS.Lambda();
lambda.invoke({FunctionName: 'hello-world-function'}, function(error, data) {
	console.log(error ? error : data);
});
