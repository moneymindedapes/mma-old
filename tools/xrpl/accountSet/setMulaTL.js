const xrpl = require('xrpl');
const dotenv = require('dotenv');
dotenv.config();

async function setMulaTL() {
  const wallets = [
    // xrpl.Wallet.fromSeed(process.env.MYMMA),
    // xrpl.Wallet.fromSeed(process.env.MMA),
    // xrpl.Wallet.fromSeed(process.env.TGA),
    // xrpl.Wallet.fromSeed(process.env.DOM),
    // xrpl.Wallet.fromSeed(process.env.KVD),
    xrpl.Wallet.fromSeed(process.env.RHSS), //not found?
    xrpl.Wallet.fromSeed(process.env.NFT),
    xrpl.Wallet.fromSeed(process.env.MOGULSDAO),
  ];
  const cold = xrpl.Wallet.fromSeed(process.env.MULA);

  const PUBLIC_SERVER = 'wss://xrplcluster.com/';
  const client = new xrpl.Client(PUBLIC_SERVER);
  await client.connect();

  const currency = '6D756C6100000000000000000000000000000000';

  for (let wallet of wallets) {
    const trust_set = {
      TransactionType: 'TrustSet',
      Account: wallet.address,
      LimitAmount: {
        currency: currency,
        issuer: cold.address,
        value: '1000000000', // Large limit, arbitrarily chosen
      },
    };

    try {
      const ts_prepared = await client.autofill(trust_set);
      const ts_signed = wallet.sign(ts_prepared);
      console.log(`Creating trust line from ${wallet.address} to issuer...`);
      const ts_result = await client.submitAndWait(ts_signed.tx_blob);

      if (ts_result.result.meta.TransactionResult == 'tesSUCCESS') {
        console.log(
          `Transaction succeeded for ${wallet.address}: https://testnet.xrpl.org/transactions/${ts_signed.hash}`
        );
      } else {
        console.log(
          `Transaction failed for ${wallet.address}: ${ts_result.result.meta.TransactionResult}`
        );
      }
    } catch (error) {
      console.log(`Error for ${wallet.address}:`, error);
    }
  }

  await client.disconnect();
}

setMulaTL().catch(console.error);
