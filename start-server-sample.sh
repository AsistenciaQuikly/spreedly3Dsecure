#!/bin/sh

# replace these values with your own
# you can generate the creds using `echo -n username:password | base64`
#
# see https://docs.spreedly.com/reference/api/v1/#using-the-api

SPREEDLY_GATEWAY_KEY=XXXXXXXXXXXXXXXXXX \
SPREEDLY_ENV_KEY=XXXXXXXXXXXXXXXXXX \
REDIRECT_URL=http://localhost:8081/redirect \
CALLBACK_URL=http://localhost:8081/callback \
BASIC_AUTH_CREDS="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" \
SCA_PROVIDER_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \
BASE_URL=http://localhost:8081 \
CORE_URL=http://core.spreedly.com \
    yarn start