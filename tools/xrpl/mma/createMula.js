const xrpl = require('xrpl');
const dotenv = require('dotenv');
dotenv.config();
async function tokenIssue() {
  const PUBLIC_SERVER = 'wss://xrplcluster.com/';
  const client = new xrpl.Client(PUBLIC_SERVER);
  await client.connect();
  //2. set cold and hot wallets
  const cold = xrpl.Wallet.fromSeed(process.env.MULA);
  const hot = xrpl.Wallet.fromSeed(process.env.MYMMA);
  // const signer = xrpl.Wallet.fromSeed(process.env.COOV);
  console.log(cold);
  console.log(hot);

  //3. configure cold and hot settings
  // Configure issuer (cold address) settings ----------------------------------
  // Require Destination Tags	Enabled or Disabled	Enable if you process withdrawals of your token to outside systems. (For example, your token is a stablecoin.)
  // Disallow XRP	Enabled or Disabled	Enable if this address isn't meant to process XRP payments.
  // Transfer Fee	0–1%	Charge a percentage fee when users send your token to each other.
  // Tick Size	5	Limit the number of decimal places in exchange rates for your token in the decentralized exchange. A tick size of 5-6 reduces churn of almost-equivalent offers and speeds up price discovery compared to the default of 15.
  // Domain	(Your domain name)	Set to a domain you own so can verify ownership of the accounts. This can help reduce confusion or impersonation attempts.
  // const cold_settings_tx = {
  //   TransactionType: 'AccountSet',
  //   Account: cold.address,
  //   TransferRate: 1000000000, //1010000000,1%; 1020000000,2%; 1001000000,0.1%;
  //   TickSize: 5, //decimal places on dex
  //   Domain: '68747470733A2F2F6D6F6E65796D696E646564617065732E636F6D2F', // "example.com"
  //   SetFlag: 8,
  //   // Using tf flags, we can enable more flags in one transaction
  //   Flags: 0,
  // };
  // const cst_prepared = await client.autofill(cold_settings_tx);
  // const cst_signed = cold.sign(cst_prepared);

  // console.log('Sending cold address AccountSet transaction...');
  // const cst_result = await client.submitAndWait(cst_signed.tx_blob);
  // if (cst_result.result.meta.TransactionResult == 'tesSUCCESS') {
  //   console.log(
  //     `Transaction succeeded: https://testnet.xrpl.org/transactions/${cst_signed.hash}`
  //   );
  // } else {
  //   throw `Error sending transaction: ${cst_result}`;
  // }
  // Configure hot address settings --------------------------------------------
  // const hot_settings_tx = {
  //   TransactionType: 'AccountSet',
  //   Account: hot.address,
  //   Domain: '68747470733A2F2F6D6F6E65796D696E646564617065732E636F6D2F', // "example.com"
  //   // enable Require Auth so we can't use trust lines that users
  //   // make to the hot address, even by accident:
  //   SetFlag: xrpl.AccountSetAsfFlags.asfRequireAuth,
  //   Flags: 0,
  // };

  // const hst_prepared = await client.autofill(hot_settings_tx);
  // const hst_signed = hot.sign(hst_prepared);

  // console.log('Sending hot address AccountSet transaction...');
  // const hst_result = await client.submitAndWait(hst_signed.tx_blob);
  // if (hst_result.result.meta.TransactionResult == 'tesSUCCESS') {
  //   console.log(
  //     `Transaction succeeded: https://testnet.xrpl.org/transactions/${hst_prepared.hash}`
  //   );
  // } else {
  //   throw `Error sending transaction: ${hst_result.result.meta.TransactionResult}`;
  // }

  // // ... [rest of your code]
  // //4. set trust
  const currency = '6D756C6100000000000000000000000000000000';
  // const trust_set = {
  //   TransactionType: 'TrustSet',
  //   Account: hot.address,
  //   LimitAmount: {
  //     currency: currency,
  //     issuer: cold.address,
  //     value: '1000000000', // Large limit, arbitrarily chosen
  //   },
  // };
  // try {
  //   const ts_prepared = await client.autofill(trust_set);
  //   const ts_signed = hot.sign(ts_prepared);
  //   console.log('Creating trust line from hot address to issuer...');
  //   const ts_result = await client.submitAndWait(ts_signed.tx_blob);
  //   if (ts_result.result.meta.TransactionResult == 'tesSUCCESS') {
  //     console.log(
  //       `Transaction succeeded: https://testnet.xrpl.org/transactions/${ts_signed.hash}`
  //     );
  //   }
  // } catch (error) {
  //   console.log(error);
  //   await client.disconnect();
  // }
  // const ts_prepared = await client.autofill(trust_set);
  // const ts_signed = hot.sign(ts_prepared);
  // console.log('Creating trust line from hot address to issuer...');
  // const ts_result = await client.submitAndWait(ts_signed.tx_blob);
  // if (ts_result.result.meta.TransactionResult == 'tesSUCCESS') {
  //   console.log(
  //     `Transaction succeeded: https://testnet.xrpl.org/transactions/${ts_signed.hash}`
  //   );
  // }
  //5. issue token        1000000000
  const issue_quantity = '99990000';
  const send_token_tx = {
    TransactionType: 'Payment',
    Account: cold.address,
    Amount: {
      currency: currency,
      value: issue_quantity,
      issuer: cold.address,
    },
    Destination: hot.address,
    DestinationTag: 1, // Needed since we enabled Require Destination Tags
    // on the hot account earlier.
  };
  const pay_prepared = await client.autofill(send_token_tx);
  const pay_signed = cold.sign(pay_prepared);
  console.log(`Sending ${issue_quantity} ${currency} to ${hot.address}...`);
  const pay_result = await client.submitAndWait(pay_signed.tx_blob);
  if (pay_result.result.meta.TransactionResult == 'tesSUCCESS') {
    console.log(
      `Transaction succeeded: https://testnet.xrpl.org/transactions/${pay_signed.hash}`
    );
  } else {
    throw `Error sending transaction: ${pay_result.result.meta.TransactionResult}`;
  }
  //6. check bal
  // Check balances ------------------------------------------------------------
  console.log('Getting hot address balances...');
  const hot_balances = await client.request({
    command: 'account_lines',
    account: hot.address,
    ledger_index: 'validated',
  });
  console.log(hot_balances.result);

  console.log('Getting cold address balances...');
  const cold_balances = await client.request({
    command: 'gateway_balances',
    account: cold.address,
    ledger_index: 'validated',
    hotwallet: [hot.address],
  });
  console.log(JSON.stringify(cold_balances.result, null, 2));
  client.disconnect();
}
tokenIssue();
