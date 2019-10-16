#!/usr/bin/env bash
STAGES=(dev prod)

usage() {
        local stages_str=( "STAGES" )
        stages_str=$(IFS='|' ; echo "${STAGES[*]}")

        echo "usage: $0 $stages_str S3_BUCKET" 1>&2
        exit 1
}

if [[ $# -lt 2 || ! " ${STAGES[@]} " =~ " $1 " ]]; then
        usage
fi

STAGE=$1
S3_BUCKET=$2

cd "$(dirname $0)/.."

if [[ ${STAGE} == "dev" ]]; then
	source .env
elif [[ ${STAGE} == "prod" ]]; then
	source .env.prod
fi

sam package --s3-bucket "$S3_BUCKET" --output-template-file packaged.yml
sam deploy --stack-name "emojibot-$STAGE" \
	--template-file packaged.yml \
	--parameter-overrides ClientID="$CLIENT_ID" ClientSecret="$CLIENT_SECRET" Stage="$STAGE" \
	--capabilities CAPABILITY_IAM
