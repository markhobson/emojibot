# lambda-node

Learning AWS Lambda on Node.js.

## Getting started

* Install [Serverless]([https://serverless.com/) and set your AWS credentials:
	```
	serverless config credentials --provider aws --key YOURKEY --secret YOURSECRET
	```
* Deploy the AWS Lambda:
	```
	cd hello-lambda && serverless deploy
	```
* Run the client:
	```
	cd client && npm install && npm start
	```
