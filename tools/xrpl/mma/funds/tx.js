const xrpl = require('xrpl');
const fs = require('fs');
const path = require('path');
const LEDGER_START = 81818780;
const LEDGER_END = 82229812;
const DIR_PATH = path.dirname(require.main.filename);
const wallets = [
  'rJkJAujK2W4Kzrz9JEWtcXHcTt7iTaJ2f2',
  'rDDPTdg9exZGybHcBjHWNeA2vw8scpiiCX',
  'rJDbbrHXLbU86VbxknbiRzgD3UXuah7yYj',
  'rMULA5hkZqsu7545NPnJZfu5ghKxuRbCro',
  'rMYmma64idd8Wq3HgH7iqiBuUdHLhQYuY4',
  'r44MoneyvZgUo8wEidp6NXcghkZ8YVMdkB',
  // 'rKVDThoi5wZGfXua1dZin1U1wtEe5D1XVU',
];

const client = new xrpl.Client('wss://xrplcluster.com/');

function ensureDirectoryExistence(dirName) {
  const fullPath = path.join(DIR_PATH, dirName);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath);
  }
  return fullPath;
}
async function fetchAllTransactions(address) {
  let allTxs = [];
  let marker;

  do {
    const response = await client.request({
      command: 'account_tx',
      account: address,
      ledger_index_min: LEDGER_START,
      ledger_index_max: LEDGER_END,
      limit: 1000,
      marker: marker,
    });

    allTxs = allTxs.concat(response.result.transactions);
    marker = response.result.marker;
  } while (marker);

  return allTxs;
}

async function calculateIncomingXRP(address) {
  let totalIncoming = 0;
  try {
    const txs = await fetchAllTransactions(address);
    const incomingPayments = txs.filter((tx) => {
      const txn = tx.tx;
      if (
        txn.TransactionType === 'Payment' ||
        txn.TransactionType === 'NFTokenAcceptOffer'
      ) {
        return true;
      }
    });
  } catch (error) {
    console.error(`Error fetching transactions for address ${address}:`, error);
  }

  return totalIncoming;
}

async function calculateSpentXRP(address) {
  let totalSpent = 0;

  try {
    const txs = await fetchAllTransactions(address);

    const outgoingPayments = txs.filter((tx) => {
      const txn = tx.tx;
      return (
        txn.TransactionType === 'Payment' &&
        txn.Account === address &&
        typeof txn.Amount !== 'object' &&
        txn.Amount
      );
    });

    totalSpent = outgoingPayments.reduce((sum, tx) => {
      return sum + Number(tx.tx.Amount) / 1000000;
    }, 0);
  } catch (error) {
    console.error(`Error fetching transactions for address ${address}:`, error);
  }

  return totalSpent;
}

async function calculateBurnedXRP(address) {
  let totalBurned = 0;

  try {
    const txs = await fetchAllTransactions(address);

    totalBurned = txs.reduce((sum, tx) => {
      return sum + Number(tx.tx.Fee) / 1000000;
    }, 0);
  } catch (error) {
    console.error(`Error fetching transactions for address ${address}:`, error);
  }

  return totalBurned;
}

async function main() {
  await client.connect();

  const incomeDir = ensureDirectoryExistence('income');
  const expenseDir = ensureDirectoryExistence('expense');
  const burnedDir = ensureDirectoryExistence('burned');

  let totalBurnedAll = 0;

  for (const address of wallets) {
    try {
      const incoming = (await calculateIncomingXRP(address)) || 0;
      fs.writeFileSync(
        path.join(incomeDir, 'income.txt'),
        `${address}: ${incoming} XRP\n`,
        {
          flag: 'a',
        }
      );

      const expense = (await calculateSpentXRP(address)) || 0;
      fs.writeFileSync(
        path.join(expenseDir, 'expense.txt'),
        `${address}: ${expense} XRP\n`,
        {
          flag: 'a',
        }
      );

      const burned = (await calculateBurnedXRP(address)) || 0;
      totalBurnedAll += burned;
      fs.writeFileSync(
        path.join(burnedDir, 'burned.txt'),
        `${address}: ${burned} XRP\n`,
        {
          flag: 'a',
        }
      );
    } catch (err) {
      console.error(`Error processing wallet ${address}:`, err);
    }
  }

  fs.writeFileSync(
    path.join(burnedDir, 'burned.txt'),
    `Total Burned from All Accounts: ${totalBurnedAll} XRP\n`,
    {
      flag: 'a',
    }
  );

  await client.disconnect();
}

main().catch(console.error);
