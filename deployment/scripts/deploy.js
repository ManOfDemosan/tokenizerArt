const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with ${deployer.address}`);

  const NFT = await ethers.getContractFactory("Jaehwkim42Art");
  const nft = await NFT.deploy(deployer.address);
  await nft.waitForDeployment();

  const nftAddress = await nft.getAddress();
  console.log(`Jaehwkim42Art deployed at ${nftAddress}`);
  console.log(`\nAdd to .env:\nNFT_CONTRACT_ADDRESS=${nftAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
