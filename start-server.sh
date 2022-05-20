#!/bin/sh

# replace these values with your own
# you can generate the creds using `echo -n XFIRqFab2SNsCm7ZG9YByRT1FqU:yoYfD90s35w6z8X4QUtQxnwaA4Ehbff3r0J7e3JFt8D4CLMWUNfPg4GInp2q4gKn | base64`
#
# see https://docs.spreedly.com/reference/api/v1/#using-the-api

SPREEDLY_GATEWAY_KEY=PkynhwagOYog13CuUlt7ws6OulSX \
SPREEDLY_ENV_KEY=XFIRqFab2SNsCm7ZG9YByRT1FqU \
REDIRECT_URL=http://localhost:8081/redirect \
CALLBACK_URL=http://localhost:8081/callback \
BASIC_AUTH_CREDS=WEZJUnFGYWIyU05zQ203Wkc5WUJ5UlQxRnFVOnlvWWZEOTBzMzV3Nno4WDRRVXRReG53YUE0RWhiZmYzcjBKN2UzSkZ0OEQ0Q0xNV1VOZlBnNEdJbnAycTRnS24= \
SCA_PROVIDER_KEY=VucILwtFJBaMZp9X9R81iA9XyXG \
BASE_URL=http://localhost:8081 \
CORE_URL=http://core.spreedly.com \
    yarn start


    