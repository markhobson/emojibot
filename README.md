# Emojibot

Learning AWS Lambda on Node.js.

## Getting started

1. [Create an AWS account](https://aws.amazon.com/free/) if haven't got one already

1. [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) and [configure your AWS credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/)
1. [Install AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

1. [Create your Slack app](https://api.slack.com/slack-apps#create-app) and configure its credentials by creating `.env` and `.env.prod` files:

	```
	# Local variables -- DO NOT COMMIT!
	.env
	    CLIENT_ID="<Your Dev Slack App Client ID>"
	    CLIENT_SECRET="<Your Dev Slack App Client Secret>"
	
	.env.prod
	    CLIENT_ID="<Your Dev Slack App Client ID>"
	    CLIENT_SECRET="<Your Dev Slack App Client Secret>"
	```

 	Do not commit these file. It is already Git ignored.

1. Create an S3 bucket to store the lambda code
	```
	aws s3 mb $S3_BUCKET_NAME
	```

1. Deploy the server to AWS Lambda:

	```
	npm install
	./scripts/deploy.sh dev|prod $S3_BUCKET_NAME
	```

	Note that you'll be charged for these services until they are [removed](#removing).

	Make a note of the endpoints output once it has deployed, e.g.:

	```
	endpoints:
	  GET - https://ab12cd34ef.execute-api.eu-west-1.amazonaws.com/dev/install
	  GET - https://ab12cd34ef.execute-api.eu-west-1.amazonaws.com/dev/authorized
	  POST - https://ab12cd34ef.execute-api.eu-west-1.amazonaws.com/dev/event
	  POST - https://ab12cd34ef.execute-api.eu-west-1.amazonaws.com/dev/explain
	```
	
1. Go to your [Slack app](https://api.slack.com/apps) settings and update them to point to your server:
	
	1. Select 'Slash Commands' and add the following command:
	    * Command: `/explain`
	    * Request URL: paste the `explain` endpoint
	    * Short Description: `Explains an emoji`
	    * Usage Hint: `[input text] [received emoji]`
	1. Select 'OAuth & Permissions' and under 'Redirect URLs' add the `authorized` endpoint
	1. Select 'Event Subscriptions' and:
		1. Turn on 'Enable Events'
		1. In the 'Request URL' box paste the `event` endpoint
		1. Under 'Subscribe to Bot Events' add bot user events for:
			* `message.channels`
			* `message.groups`
			* `message.im`
			* `message.mpim`
	1. Select 'Bot Users' and add a bot user

1. Finally, install your Slack app by visiting your `install` endpoint and clicking the 'Add to Slack' button

## Updating emojis

The bot works by using a map of words to emojis. This map is derived from [Emoji cheat sheet](http://www.emoji-cheat-sheet.com) and stored in [emoji.js](src/emoji.js). To regenerate it:

```
npm run generate
```

## Running tests

To run the unit tests:

```
npm run test:unit
```

To run the api tests:
```
npm run test:api
```

To run both:
```
npm test
```

## Removing

To undeploy the server from AWS:

```
aws cloudformation delete-stack --stack-name emojibot-dev|prod
```

## See also

* Blog: [Building a serverless chatbot on AWS Lambda](https://www.blackpepper.co.uk/blog/creating-a-serverless-slack-bot-on-aws-lambda)
