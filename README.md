# Emojibot

Learning AWS Lambda on Node.js.

## Getting started

1. [Create an AWS account](https://aws.amazon.com/free/) if haven't got one already

1. [Install Serverless](https://serverless.com/framework/docs/providers/aws/guide/installation/) and [configure your AWS credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

1. [Create your Slack app](https://api.slack.com/slack-apps#create-app) and configure its credentials by creating a `local.yml` file:

	```
	# Local variables -- DO NOT COMMIT!
	
	dev:
	  slack:
	    clientId: "<Your Dev Slack App Client ID>"
	    clientSecret: <Your Dev Slack App Client Secret>
	
	production:
	  slack:
	    clientId: "<Your Production Slack App Client ID>"
	    clientSecret: <Your Production Slack App Client Secret>
	```

	Note that the client id must be quoted otherwise it is interpreted as a number. Do not commit this file. It is already Git ignored.

1. Deploy the server to AWS Lambda:

	```
	npm install
	serverless deploy
	```

	Note that you'll be charged for these services until they are [removed](#removing).

	Make a note of the endpoints output once it has deployed, e.g.:

	```
	endpoints:
	  GET - https://ab12cd34ef.execute-api.eu-west-1.amazonaws.com/dev/install
	  GET - https://ab12cd34ef.execute-api.eu-west-1.amazonaws.com/dev/authorized
	  POST - https://ab12cd34ef.execute-api.eu-west-1.amazonaws.com/dev/event
	```
	
1. Go to your [Slack app](https://api.slack.com/apps) settings and update them to point to your server:
	
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
npm test
```

## Removing

To undeploy the server from AWS:

```
serverless remove
```

## See also

* Blog: [Building a serverless chatbot on AWS Lambda](https://www.blackpepper.co.uk/blog/creating-a-serverless-slack-bot-on-aws-lambda)
