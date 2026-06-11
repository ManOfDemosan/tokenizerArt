const { ethers } = require("hardhat");

// Transfer a token to another address (demo of ERC-721 transfer + ownerOf change).
// Usage:
//   TO=0xRecipient TOKEN_ID=1 npx hardhat run mint/scripts/transfer.js --network bsctest
// (TOKEN_ID defaults to 1 if omitted)

async function main() {
  const { NFT_CONTRACT_ADDRESS, TO } = process.env;
  const tokenId = process.env.TOKEN_ID ?? "1";

  if (!NFT_CONTRACT_ADDRESS) throw new Error("NFT_CONTRACT_ADDRESS not set in .env");
  if (!TO) throw new Error("Recipient address (TO) is required. e.g. TO=0x...");
  if (!ethers.isAddress(TO)) throw new Error(`Invalid address: ${TO}`);

  const [signer] = await ethers.getSigners();
  const nft = await ethers.getContractAt("Jaehwkim42Art", NFT_CONTRACT_ADDRESS);

  const before = await nft.ownerOf(tokenId);
  console.log(`Sender wallet:           ${signer.address}`);
  console.log(`token #${tokenId} ownerOf (before): ${before}`);

  if (before.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(`This wallet is not the owner of token #${tokenId}. Transfer aborted.`);
  }

  console.log(`\n-> Transferring token #${tokenId} to ${TO}...`);
  const tx = await nft.safeTransferFrom(signer.address, TO, tokenId);
  const receipt = await tx.wait();
  console.log(`Transfer tx: ${receipt.hash}`);
  console.log(`explorer: https://testnet.bscscan.com/tx/${receipt.hash}`);

  const after = await nft.ownerOf(tokenId);
  console.log(`\ntoken #${tokenId} ownerOf (after): ${after}  ${after.toLowerCase() === TO.toLowerCase() ? "<- transfer OK" : ""}`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
