const { ethers } = require("hardhat");

async function main() {
  const { NFT_CONTRACT_ADDRESS, METADATA_IPFS_URI } = process.env;

  if (!NFT_CONTRACT_ADDRESS) {
    throw new Error("NFT_CONTRACT_ADDRESS not set in .env");
  }
  if (!METADATA_IPFS_URI) {
    throw new Error("METADATA_IPFS_URI not set in .env");
  }

  const [minter] = await ethers.getSigners();
  console.log(`Minting with ${minter.address}`);

  const nft = await ethers.getContractAt("Jaehwkim42Art", NFT_CONTRACT_ADDRESS);

  const tx = await nft.safeMint(minter.address, METADATA_IPFS_URI);
  const receipt = await tx.wait();
  console.log(`Mint tx: ${receipt.hash}`);

  // Find the tokenId from the Transfer event
  const transferEvent = receipt.logs.find(
    (log) => log.fragment && log.fragment.name === "Transfer"
  );
  const tokenId = transferEvent ? transferEvent.args[2] : await nft.totalSupply() - 1n;
  console.log(`Token ID: ${tokenId}`);

  // Verify ownership (mandatory requirement)
  const owner = await nft.ownerOf(tokenId);
  console.log(`ownerOf(${tokenId}): ${owner}`);

  // Verify metadata URI
  const uri = await nft.tokenURI(tokenId);
  console.log(`tokenURI(${tokenId}): ${uri}`);

  console.log("\nMinting complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
