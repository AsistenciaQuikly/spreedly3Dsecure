const axios = require("axios");
const express = require('express');
const router = express.Router();


const ENV_KEY = process.env.SPREEDLY_ENV_KEY || 'XFIRqFab2SNsCm7ZG9YByRT1FqU'
const GATEWAY_KEY = process.env.SPREEDLY_GATEWAY_KEY || 'B7O1DDzj7pbY4A0Gz62xWPqsc0g' // Strpipe: 3idkOg0KFoTJpAKsGzS845Fjq4e, Test: PkynhwagOYog13CuUlt7ws6OulS
const SCA_PROVIDER_KEY = process.env.SCA_PROVIDER_KEY || 'NOT SET'
const REDIRECT_URL = process.env.REDIRECT_URL || 'http://to-be-set.ngrok.io'
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://to-be-set.ngrok.io'
const BASIC_AUTH_CREDS = process.env.BASIC_AUTH_CREDS || 'WEZJUnFGYWIyU05zQ203Wkc5WUJ5UlQxRnFVOnlvWWZEOTBzMzV3Nno4WDRRVXRReG53YUE0RWhiZmYzcjBKN2UzSkZ0OEQ0Q0xNV1VOZlBnNEdJbnAycTRnS24='
const CORE_URL = process.env.CORE_URL || 'https://core.spreedly.com'
const BASE_URL = process.env.BASE_URL || 'http://localhost:8081'
const TEST_SCENARIOS = new Map();

TEST_SCENARIOS.set('1000', {test_scenario: { scenario: 'authenticated'}})
TEST_SCENARIOS.set('2500', {test_scenario: { scenario: 'authenticated'}, exemption_type: 'low_value_exemption'})
TEST_SCENARIOS.set('5000', {test_scenario: { scenario: 'authenticated'}, exemption_type: 'transaction_risk_analysis_exemption', acquiring_bank_fraud_rate: 'level_one'})
TEST_SCENARIOS.set('7500', {test_scenario: { scenario: 'authenticated'}, exemption_type: 'low_value_exemption'})
TEST_SCENARIOS.set('9000', {test_scenario: { scenario: 'not_authenticated'}})
TEST_SCENARIOS.set('10000', {test_scenario: { scenario: 'challenge'}})



/* GET home page. IFrame-based example */
router.get('/', function (req, res, next) {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Credentials', 'true');

  console.debug(`Accept Header is ${req.get('Accept')}`)

  res.render('index.html', {
    SPREEDLY_GATEWAY_KEY: GATEWAY_KEY,
    SPREEDLY_ENV_KEY: ENV_KEY,
    SCA_PROVIDER_KEY: SCA_PROVIDER_KEY,
    BASIC_AUTH_CREDS: BASIC_AUTH_CREDS,
    REDIRECT_URL: REDIRECT_URL,
    CALLBACK_URL: CALLBACK_URL,
    CORE_URL: CORE_URL,
    BASE_URL: BASE_URL,
    HEADER_ACCEPT: req.get('Accept')
  });
});

/* GET Express-based example page. */
router.get('/express', function (req, res, next) {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Credentials', 'true');

  console.debug(`Accept Header is ${req.get('Accept')}`)

  res.render('express.html', {
    SPREEDLY_GATEWAY_KEY: GATEWAY_KEY,
    SPREEDLY_ENV_KEY: ENV_KEY,
    SCA_PROVIDER_KEY: SCA_PROVIDER_KEY,
    BASIC_AUTH_CREDS: BASIC_AUTH_CREDS,
    REDIRECT_URL: REDIRECT_URL,
    CALLBACK_URL: CALLBACK_URL,
    CORE_URL: CORE_URL,
    HEADER_ACCEPT: req.get('Accept')
  });
});

/* Performs a call to Spreedly API 
 * @see {@link https://docs.spreedly.com/reference/api/v1/#purchase}
*/
router.post('/attempt-purchase', function (req, res, next) {
  var purchaseUrl = `${CORE_URL}/v1/gateways/${GATEWAY_KEY}/purchase.json`
  console.log('------------URI------------------');
  console.debug(`Attempting purchase at ${purchaseUrl} with auth ${BASIC_AUTH_CREDS}`)

  console.log('------------DATA BY FRONT------------------');
  var frontendTx = req.body.transaction
  console.debug(`frontendTx received = ${JSON.stringify(frontendTx)}`)

  var txObject = {
    transaction: {
      amount: 100,
      currency_code: 'USD',
      payment_method_token: frontendTx.payment_method_token, 
      browser_info: frontendTx.browserData,/*
      redirect_url: REDIRECT_URL,
      callback_url: CALLBACK_URL,
      sca_provider_key: `${SCA_PROVIDER_KEY}`,
      sca_authentication_parameters: 
        TEST_SCENARIOS.get(String(frontendTx.amount)) */
    }
  }
console.log('------------REQUEST------------------');
  console.debug(`Tx request to Spreedly API: ${JSON.stringify(txObject)} `);
  console.log('------------Authorization------------------');
  console.debug(`Authorization: BASIC ${BASIC_AUTH_CREDS}`);

  axios.post(purchaseUrl, txObject,
    {
      auth:{
        username: 'XFIRqFab2SNsCm7ZG9YByRT1FqU',
        password: 'yoYfD90s35w6z8X4QUtQxnwaA4Ehbff3r0J7e3JFt8D4CLMWUNfPg4GInp2q4gKn'
      },      headers: {
        //'Authorization': `Basic ${BASIC_AUTH_CREDS}`,
        'Content-Type': 'application/json'
      }
    }
  ).then(coreResponse => {
    data = coreResponse.data
    console.log('------------RESPONSE------------------');
    console.debug(`Data received is ${JSON.stringify(data)}`)

    // return frontend ONLY the data we need there.
    res.json({
      token: data.transaction.token,
      state: data.transaction.state,
      message: data.transaction.message
    })
  })
    .catch((e) => {
      console.log('------------ERROR------------------');
      console.debug(`Error received is ${JSON.stringify(e)}`)
      if (e.response.status == 422) {

        res.json({
          token: e.response.data.transaction.token,
          state: e.response.data.transaction.state,
          message: e.response.data.transaction.message
        })
        // Request was made and server responded with error.
      console.log('------------STATUS 422------------------');

        console.debug(e.response.data)
        console.debug(e.response.data.transaction.token)
      } else{
        console.debug(`Error accessing ${purchaseUrl}. Details: ${e}`)
        res.json({
          token: frontendTx.token,
          state: "error"
        })
      }
      }
    );

});


router.get('/redirect', function (req, response, next) {
  try {

    // poor man's URL parser to obtain token.
    transactionToken = req.url.split("=")[1]
    coreUrl = `${CORE_URL}/v1/transactions/${transactionToken}.json`;

    console.debug(`CoreURL is ${coreUrl}, auth is ${BASIC_AUTH_CREDS}, transactionToken is ${transactionToken}`)

    axios.get(coreUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${BASIC_AUTH_CREDS}`,
        'Content-Type': 'application/json'
      }
    }).then(coreResponse => {
      data = coreResponse.data;
      console.debug(coreResponse);
      console.debug(data);

      if (data.transaction.succeeded) {
        response.render('success.html', {
          transactionMessage: data.transaction.message,
          transactionToken: data.transaction.token
        })
      }
      else {
        response.render('failure.html')
      }

    })

  } catch (error) {
    console.log(error)
  }

});



router.get('/callback', function (req, res, next) {
  console.debug("Callback received", req)
});

module.exports = router;
