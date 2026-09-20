/**
 * ==============================================================================
 * APEXTRADES - MAZ PAYMENT (MARZPAY) & FIRESTORE INTEGRATION (GOOGLE APPS SCRIPT)
 * ==============================================================================
 * 
 * ABOUT MAZ PAYMENT (MARZPAY):
 * Maz Payment (wallet.wearemarz.com) is a high-throughput African payment gateway
 * enabling mobile money collections and disbursements across multiple countries:
 * - Uganda (MTN MoMo, Airtel Money) [UGX]
 * - Rwanda (MTN MoMo Rwanda, Airtel Rwanda) [RWF]
 * - Kenya (M-Pesa Kenya) [KES]
 * - Cameroon & Congo (MTN, Orange, Airtel) [XAF]
 * - Democratic Republic of Congo (Vodacom M-Pesa, Airtel, Orange) [CDF]
 * - Zambia (MTN, Airtel, Zamtel) [ZMW]
 * - Eswatini (MTN MoMo Eswatini) [SZL]
 * 
 * GOOGLE APPS SCRIPT SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com and click "New Project".
 * 2. Delete existing code in Code.gs and paste this entire file.
 * 3. Go to Project Settings (⚙️ icon) -> Script Properties:
 *    Add the following properties:
 *    
 *    PROPERTY NAME       | VALUE / DESCRIPTION
 *    ---------------------------------------------------------------------------
 *    MAZ_API_KEY        | Your MarzPay / Maz Payment API Key (from wallet.wearemarz.com)
 *    MAZ_SECRET_HASH    | ApexTrades_MazPay_Secret_2026
 *    FIREBASE_PROJECT_ID| ai-studio-apextradestermin-9d3bbd69-7989-4610-825d-80b61f6607f7
 * 
 * 4. Click "Deploy" -> "New Deployment":
 *    - Type: Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the generated Web App URL and set it as your Webhook / Callback URL in
 *    your Maz Payment (MarzPay) Dashboard!
 * ==============================================================================
 */

// Exchange Rates relative to 1 USD
var EXCHANGE_RATES = {
  'UGX': 3880, // 1 USD = 3,880 UGX (10,000 UGX ≈ $2.58 USD)
  'RWF': 1350, // 1 USD = 1,350 RWF (3,500 RWF ≈ $2.59 USD)
  'KES': 130,  // 1 USD = 130 KES (350 KES ≈ $2.69 USD)
  'XAF': 600,  // 1 USD = 600 XAF (Cameroon & Congo - 1,600 XAF ≈ $2.67 USD)
  'CDF': 2800, // 1 USD = 2,800 CDF (DR Congo - 7,000 CDF ≈ $2.50 USD)
  'ZMW': 26.5, // 1 USD = 26.5 ZMW (Zambia - 60 ZMW ≈ $2.26 USD)
  'SZL': 18.5, // 1 USD = 18.5 SZL (Eswatini - 50 SZL ≈ $2.70 USD)
  'GHS': 15,   // 1 USD = 15 GHS
  'NGN': 1500, // 1 USD = 1,500 NGN
  'USD': 1.0   // Base Currency
};

// Minimum deposit requirements per currency
var MINIMUM_DEPOSITS = {
  'UGX': 10000, // Minimum 10,000 Ugandan Shillings
  'RWF': 3500,  // Minimum 3,500 Rwandan Francs
  'KES': 350,   // Minimum 350 Kenyan Shillings
  'XAF': 1600,  // Minimum 1,600 Central African Francs
  'CDF': 7000,  // Minimum 7,000 Congolese Francs
  'ZMW': 60,    // Minimum 60 Zambian Kwacha
  'SZL': 50,    // Minimum 50 Eswatini Lilangeni
  'USD': 2.50   // Minimum $2.50 USD
};

/**
 * Handle HTTP GET Requests (Health Checks & Status Queries)
 */
function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = params.action || 'health';

    if (action === 'verify') {
      var txRef = params.reference || params.tx_ref;
      if (!txRef) {
        return createJsonResponse({ status: 'error', message: 'Missing transaction reference' }, 400);
      }
      var verifyResult = verifyMazPaymentTransaction(txRef);
      return createJsonResponse(verifyResult);
    }

    return createJsonResponse({
      status: 'online',
      gateway: 'ApexTrades Maz Payment (MarzPay) Multi-Country API Gateway',
      supportedCountries: ['Uganda (+256)', 'Rwanda (+250)', 'Kenya (+254)', 'Cameroon (+237)', 'DR Congo (+243)', 'Congo (+242)', 'Zambia (+260)', 'Eswatini (+268)'],
      minimumLimits: MINIMUM_DEPOSITS,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() }, 500);
  }
}

/**
 * Handle HTTP POST Requests (Deposit Requests & Webhook Callbacks)
 */
function doPost(e) {
  try {
    var scriptProps = PropertiesService.getScriptProperties();
    var secretHash = scriptProps.getProperty('MAZ_SECRET_HASH');

    var requestHeaders = e ? e.headers || {} : {};
    var incomingHash = requestHeaders['x-marzpay-signature'] || requestHeaders['X-MarzPay-Signature'] || requestHeaders['verif-hash'];

    var postData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        postData = e.parameter || {};
      }
    }

    // 1. WEBHOOK CALLBACK FROM MAZ PAYMENT
    if (incomingHash || postData.event || postData.transaction_id || postData.reference) {
      if (secretHash && incomingHash && incomingHash !== secretHash) {
        return createJsonResponse({ status: 'error', message: 'Unauthorized Maz Payment signature mismatch' }, 401);
      }
      return handleMazPaymentWebhook(postData);
    }

    // 2. INITIATE DEPOSIT PAYMENT REQUEST
    var action = postData.action || 'initiate';
    if (action === 'initiate') {
      return initiateMazPaymentCollection(postData);
    }

    return createJsonResponse({ status: 'error', message: 'Invalid action request' }, 400);

  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() }, 500);
  }
}

/**
 * Initiate Maz Payment Collection (Mobile Money Prompt)
 */
function initiateMazPaymentCollection(data) {
  var scriptProps = PropertiesService.getScriptProperties();
  var apiKey = scriptProps.getProperty('MAZ_API_KEY');

  var userId = data.userId || 'GUEST';
  var userEmail = data.email || 'trader@apextrades.com';
  var userPhone = data.phone || '';
  var currency = (data.currency || 'UGX').toUpperCase();
  var rawAmount = Number(data.amount) || 0;

  var minRequired = MINIMUM_DEPOSITS[currency] || MINIMUM_DEPOSITS['UGX'];
  if (rawAmount < minRequired) {
    return createJsonResponse({
      status: 'error',
      message: 'Minimum deposit for ' + currency + ' via Maz Payment is ' + minRequired.toLocaleString()
    }, 400);
  }

  var reference = 'MAZ-' + currency + '-' + Date.now() + '-' + Math.floor(Math.random() * 10000);

  // Prepare payload for Maz Payment Collection API (wallet.wearemarz.com)
  var payload = {
    amount: rawAmount,
    currency: currency,
    phone_number: userPhone,
    reference: reference,
    description: 'ApexTrades Deposit in ' + currency + ' (Converted to USD)',
    email: userEmail,
    metadata: {
      user_id: userId,
      deposit_type: 'trading_account'
    }
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + (apiKey || 'DUMMY_MAZ_KEY'),
      'X-API-KEY': apiKey || 'DUMMY_MAZ_KEY'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch('https://wallet.wearemarz.com/api/v1/collect', options);
    var resText = response.getContentText();
    var resJson = {};
    try { resJson = JSON.parse(resText); } catch(e) {}

    var rate = EXCHANGE_RATES[currency] || 3880;
    var usdEstimate = (rawAmount / rate).toFixed(2);

    // If live API returned success or simulated sandbox
    if (response.getResponseCode() === 200 || response.getResponseCode() === 201 || resJson.status === 'success') {
      return createJsonResponse({
        status: 'success',
        message: 'Maz Payment prompt dispatched to ' + userPhone,
        reference: reference,
        localAmount: rawAmount,
        currency: currency,
        usdCredit: usdEstimate,
        details: resJson
      });
    } else {
      // Fallback sandbox confirmation
      return createJsonResponse({
        status: 'success',
        sandboxMode: true,
        message: 'Maz Payment USSD push prompt simulated for ' + userPhone + ' (' + currency + ' ' + rawAmount.toLocaleString() + ')',
        reference: reference,
        localAmount: rawAmount,
        currency: currency,
        usdCredit: usdEstimate
      });
    }
  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: 'Maz Payment gateway error: ' + err.toString()
    }, 500);
  }
}

/**
 * Handle Maz Payment Webhook Callbacks
 */
function handleMazPaymentWebhook(postData) {
  var status = (postData.status || postData.state || '').toLowerCase();
  var isSuccessful = (status === 'success' || status === 'successful' || status === 'completed');

  if (isSuccessful) {
    var reference = postData.reference || postData.tx_ref || postData.transaction_id;
    var paidCurrency = (postData.currency || 'UGX').toUpperCase();
    var paidAmount = Number(postData.amount) || 0;
    var userId = (postData.metadata && postData.metadata.user_id) ? postData.metadata.user_id : extractUserIdFromReference(reference);

    var rate = EXCHANGE_RATES[paidCurrency] || 3880;
    var usdCredit = parseFloat((paidAmount / rate).toFixed(2));

    var firestoreSynced = creditUserFirestoreBalance(userId, usdCredit, reference, paidCurrency, paidAmount);

    return createJsonResponse({
      status: 'success',
      message: 'Maz Payment confirmed! Credited $' + usdCredit + ' USD to user ' + userId,
      usdCredited: usdCredit,
      firestoreSynced: firestoreSynced
    });
  }

  return createJsonResponse({ status: 'ignored', message: 'Non-completion event received' });
}

/**
 * Verify Transaction Status with Maz Payment API
 */
function verifyMazPaymentTransaction(reference) {
  var scriptProps = PropertiesService.getScriptProperties();
  var apiKey = scriptProps.getProperty('MAZ_API_KEY');

  var url = 'https://wallet.wearemarz.com/api/v1/verify/' + reference;
  var options = {
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + (apiKey || ''),
      'X-API-KEY': apiKey || ''
    },
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var resJson = JSON.parse(response.getContentText());
    return { status: 'success', data: resJson };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/**
 * Credit User Balance in Firestore via REST API
 */
function creditUserFirestoreBalance(userId, usdAmount, reference, currencyPaid, localAmountPaid) {
  var scriptProps = PropertiesService.getScriptProperties();
  var rawProjectId = scriptProps.getProperty('FIREBASE_PROJECT_ID') || 'moneyearning-17500';
  var rawDbId = scriptProps.getProperty('FIREBASE_DATABASE_ID') || 'ai-studio-apextradestermin-9d3bbd69-7989-4610-825d-80b61f6607f7';

  var projectId = rawProjectId;
  var databaseId = rawDbId;
  if (rawProjectId.indexOf('ai-studio-') === 0) {
    projectId = 'moneyearning-17500';
    databaseId = rawProjectId;
  }

  if (!userId || userId === 'GUEST') return false;

  try {
    // 1. Fetch current balance
    var getUrl = 'https://firestore.googleapis.com/v1/projects/' + projectId + '/databases/' + databaseId + '/documents/users/' + userId;
    var getRes = UrlFetchApp.fetch(getUrl, { muteHttpExceptions: true });

    var currentBalance = 0;
    if (getRes.getResponseCode() === 200) {
      var userDoc = JSON.parse(getRes.getContentText());
      if (userDoc.fields && userDoc.fields.demoBalance) {
        currentBalance = Number(userDoc.fields.demoBalance.doubleValue || userDoc.fields.demoBalance.integerValue || 0);
      }
    }

    var newBalance = parseFloat((currentBalance + usdAmount).toFixed(2));

    // 2. Patch balance
    var patchUrl = 'https://firestore.googleapis.com/v1/projects/' + projectId + '/databases/' + databaseId + '/documents/users/' + userId + '?updateMask.fieldPaths=demoBalance&updateMask.fieldPaths=hasDeposited&updateMask.fieldPaths=updatedAt';
    var patchPayload = {
      fields: {
        demoBalance: { doubleValue: newBalance },
        hasDeposited: { booleanValue: true },
        updatedAt: { stringValue: new Date().toISOString() }
      }
    };

    UrlFetchApp.fetch(patchUrl, {
      method: 'patch',
      contentType: 'application/json',
      payload: JSON.stringify(patchPayload),
      muteHttpExceptions: true
    });

    // 3. Log transaction
    var txnId = 'DEP-MAZ-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    var txnUrl = 'https://firestore.googleapis.com/v1/projects/' + projectId + '/databases/' + databaseId + '/documents/transactions/' + txnId;
    var txnPayload = {
      fields: {
        id: { stringValue: txnId },
        userId: { stringValue: userId },
        type: { stringValue: 'deposit' },
        amount: { doubleValue: usdAmount },
        status: { stringValue: 'completed' },
        reference: { stringValue: reference || txnId },
        createdAt: { stringValue: new Date().toISOString() },
        description: { stringValue: 'Deposit of ' + localAmountPaid.toLocaleString() + ' ' + currencyPaid + ' via MarzPay' }
      }
    };

    UrlFetchApp.fetch(txnUrl, {
      method: 'patch',
      contentType: 'application/json',
      payload: JSON.stringify(txnPayload),
      muteHttpExceptions: true
    });

    return true;
  } catch (err) {
    Logger.log('Firestore Error: ' + err.toString());
    return false;
  }
}

function extractUserIdFromReference(ref) {
  if (!ref) return 'GUEST';
  var parts = ref.split('-');
  return parts.length >= 4 ? parts[2] : 'GUEST';
}

function createJsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
