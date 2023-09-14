const rippleKeyPairs = require('ripple-keypairs');

const seed = ''; // Replace with your seed

const keypair = rippleKeyPairs.deriveKeypair(seed);
const address = rippleKeyPairs.deriveAddress(keypair.publicKey);

console.log('Public Key:', keypair.publicKey);
console.log('Private Key:', keypair.privateKey);
console.log('Address:', address);
