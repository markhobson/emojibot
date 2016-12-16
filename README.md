# Emojibot

Learning AWS Lambda on Node.js.

## Getting started

* [Create an AWS account](https://aws.amazon.com/free/) if haven't got one already
* [Install Serverless](https://serverless.com/framework/docs/providers/aws/guide/installation/) and [configure your AWS credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/)
* [Create your Slack app](https://api.slack.com/slack-apps#create-app) and configure its credentials by creating a `local.yml` file:

	```
	# Local variables -- DO NOT COMMIT!
	
	slack:
	  clientId: "<Your Slack App Client ID>"
	  clientSecret: <Your Slack App Client Secret>
	```

  Note that the client id must be quoted otherwise it is interpreted as a number. Do not commit this file. It is already Git ignored.
* Deploy the server to AWS Lambda:

	```
	serverless deploy
	```
