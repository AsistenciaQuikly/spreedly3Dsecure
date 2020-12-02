// ***************** YOUR specific implementation ************
/**
  * Performs a good ol' #purchase call!
  * 
  * The main difference is the new `sca_provider_key` parameter you need to pass.
  * 
  * Additionally, the call does not immediately return a useable result, so we let
  * `Spreedly.ThreeDS.Lifecycle` take over after the initial submission.
  * 
  * @see {@link https://docs.spreedly.com/reference/api/v1/#purchase}
  *
  * @param {string} token Automagically generated by Spreedly.tokenize() (via #submitPaymentForm)
  * @param {object} paymentMethodData card details, etc. Not used in this example.
*/
function onPaymentMethodFn(token, paymentMethodData) {
  var flowToRun = document.getElementById("spf-flow").value

  // Choose a browser size for your application. This will be the size of the challenge
  // iframe that will be presented to a user. *note* If you're creating a modal, you
  // should make the surrounding DOM node a little larger than the option selected
  // below.
  //
  // '01' - 250px x 400px
  // '02' - 390px x 300px
  // '03' - 500px x 600px
  // '04' - 600px x 400px
  // '05' - fullscreen
  var browser_size = '04';

  // The request should include the browser data collected by using `Spreedly.ThreeDS.serialize().
  let browserInfo = Spreedly.ThreeDS.serialize(
    browser_size,
    HEADER_ACCEPT
  );

  // BUT if we want to forcibly kick off 3DS1 **AS A TEST**, inject a simulated "wrong" browser
  if (document.getElementById("spf-3ds1").checked){
    browserInfo = Spreedly.ThreeDS.serialize(
      browser_size,
      HEADER_ACCEPT,
      new SuspiciousBrowser()
    );
  }

  var txObject = {
    transaction: {
      amount: flowToRun,
      currency: "EUR",
      token: token,
      browserData: browserInfo
    }
  }

  // see backend logic in `/routes/index.js`
  var purchaseUrl = `${BASE_URL}/attempt-purchase`
  fetch(purchaseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(txObject)
  }).then(response => response.json()) //unwrap your backend initial transaction response.
    .then(data => {

      // state from backend
      switch (data.state) {
        case "succeeded":
          // congrats the call between the backend and Spreedly API 
          // succeeded w/o the banks requiring 3DS authentication!
          updateUI({
            token: data.token
          }, true);
          break;
        case "error":
          alert("An error occurred between backend and Spreedly API. Investigate your server logs.");
          break;
        case "pending":
          // looks like user will have to authenticate, no worries, Spreedly Lifecycle has you covered.
          letSpreedlyLifecycleHandleIt(data.token);
          break;
      }
    })
    .catch((e) => console.log(`Error accessing ${purchaseUrl}. Details: ${e}`))
    ;
}


/**
 * Hooks Spreedly Lifecycle library to help you get notified when authentication happens
 * @param {*} token to keep track of
 */
function letSpreedlyLifecycleHandleIt(token) {
  var lifecycle = new Spreedly.ThreeDS.Lifecycle({
    environmentKey: SPREEDLY_ENV_KEY, // [1]
    hiddenIframeLocation: 'deviceFingerprint', // [2]
    challengeIframeLocation: 'challengeContainer', // [3]
    transactionToken: token, // [4]
    challengeIframeClasses: 'fitToModal spreedlyColorBorder', // [5]
  })

  lifecycle.start()

  // [1] The environmentKey field is required, but if omitted, you will receive a console warning message and the transaction will still succeed.
  // [2] The DOM node that you'd like to inject hidden iframes
  // [3] The DOM node that you'd like to inject the challenge flow
  // [4] The token for the transaction - used to poll for state
  // [5] optional classes applied to the challenge, when displayed.
}

/**
 * @see {@link https://docs.spreedly.com/reference/iframe/v1/#paymentmethod|Doc}
 */
function on3DSstatusUpdatesFn(event) {
  console.log(`event.action ${event.action}`)

  switch (event.action) {
    case "challenge":
      show3DSChallengeModal()
      break;
    case "succeeded":
      updateUI(event, true);
      break;
    case "finalization-timeout":
      alert("Time-Out. User did not authenticate within expected timeout.")
    case "error":
      updateUI(event, false)
      break;
    default:
      console.log(`Event ${{ event }} not handled`)
  }
}

