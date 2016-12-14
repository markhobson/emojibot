# lambda-node

Learning AWS Lambda on Node.js.

## Getting started

* [Create an AWS account](https://aws.amazon.com/free/) if haven't got one already
* Install [Serverless]([https://serverless.com/) and set your AWS credentials:

	```
	serverless config credentials --provider aws --key <Your AWS key> --secret <Your AWS secret>
	```
	
* [Create your Slack app](https://api.slack.com/slack-apps#create-app) and configure its credentials:

	```
	export CLIENT_ID=<Your Slack App Client ID>
	export CLIENT_SECRET=<Your Slack App Client Secret>
	```
	
* Deploy the server to AWS Lambda:

	```
	serverless deploy
	```
