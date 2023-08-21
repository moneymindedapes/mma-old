import { SologenicNFTManager } from 'sologenic-nft-sdk';
import fs from 'fs';

const minter = new SologenicNFTManager({
  mode: 'mainnet' | 'testnet' | 'devnet',
  xrpl_node: XRPL_NODE,
});

// Example of how to submit the files
const collectionCoverBuffer = fs.readFileSync('PATH_TO_COLLECTION_COVER_FILE');
const collectionThumbnailBuffer = fs.readFileSync(
  'PATH_TO_COLLECTION_THUMBNAIL_FILE'
);
const nftFileBuffer = fs.readFileSync('PATH_TO_NFT_FILE');
const nftThumbnailBuffer = fs.readFileSync('PATH_TO_NFT_THUMBNAIL_FILE');

// Set the account to mint with
const connected_account = minter.setAccount(YOUR_WALLET_SECRET);

// After initializing the Minter, we need to set the collection address in which we want to mint
// Use setCollectionAddress() if you know the collection you want to mint in
// minter.setCollectionAddress(YOUR_DESIRED_COLLECTION);

// or create a new collection with createCollection(). This method sets the recently created collection as the default to mint on, it can be overriden with setCollectionAddress().
await minter.createCollection({
  name: 'Test Collection', // REQUIRED: The name of the collection
  description: 'Collection description', // OPTIONAL: The description of the collection
  cover: collectionCoverBuffer, // Cover of the Collection, can be only JPG, JPEG, PNG or GIF, recommended to be a compressed version, as this is for display purposes, it's not stored on the ledger
  thumbnail: collectionThumbnailBuffer, // Thumbnail of the Collection, can be only JPG, JPEG, PNG or GIF, recommended to be a compressed version, as this is for display purposes, it's not stored on the ledger
  transfer_fee: 10000, // OPTIONAL (Defaults to 0): Sets the Royalty percentage for all the NFTs within this collection. Can be overwritten per NFT. A number between 0 and 50000 i.e to get 10% royalty transfer_fee  must be 10000
});

// Once the collection is set. If you have available Slot (or burns) you can start minting.
const { mint_tx_hash, NFTokenID } = await minter.mint({
  file: nftFileBuffer, // Original data of the NFT can be any of the supported files Sologenic accepts
  thumbnail: nftThumbnailBuffer, // Thumbnail of the NFT, can be only JPG, JPEG, PNG or GIF, recommended to be a compressed version, as this is for display purposes, it's not stored on the ledger
  name: 'Testing NFT 3', // REQUIRED: The name of the NFT
  category: 'arts', // REQUIRED: Sets the category on the NFT for the Marketplace
  only_xrp: false, // REQUIRED (Defaults to false): Sets if the NFT can only be traded for XRP
  is_explicit: false, // REQUIRED (Default to false): Sets if the NFT contains Explicit content
  transfer_fee: 10000, // OPTIONAL (Defaults to 0): A number between 0 and 50000 i.e to get 10% royalty transfer_fee must be 10000. If set, it will override the Collection Transfer fee.
  description: 'Testing NFT description', // OPTIONAL: Description of the NFT
  external_url: 'https://sologenic.org', // OPTIONAL: URL for more information of the NFT
  attributes: [
    //OPTIONAL: Attributes of the NFT, what makes it unique
    {
      trait_type: 'attribute',
      value: 'attr',
    },
    {
      trait_type: 'attribute 2',
      value: 1,
      max_value: 2,
    },
  ],
});
