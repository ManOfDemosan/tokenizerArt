const { expect } = require("chai");
const { ethers } = require("hardhat");

async function deployFixture() {
  const [owner, other, recipient] = await ethers.getSigners();

  const NFT = await ethers.getContractFactory("Jaehwkim42Art");
  const nft = await NFT.deploy(owner.address);
  await nft.waitForDeployment();

  return { nft, owner, other, recipient };
}

describe("Jaehwkim42Art NFT", function () {
  it("Has correct name and symbol", async function () {
    const { nft } = await deployFixture();
    expect(await nft.name()).to.equal("42 Art by jaehwkim");
    expect(await nft.symbol()).to.equal("J42ART");
  });

  it("Owner can mint an NFT and ownerOf is correct", async function () {
    const { nft, owner, recipient } = await deployFixture();
    const uri = "ipfs://QmTest123";

    await nft.safeMint(recipient.address, uri);
    expect(await nft.ownerOf(0)).to.equal(recipient.address);
  });

  it("tokenURI returns the correct metadata URI", async function () {
    const { nft, owner, recipient } = await deployFixture();
    const uri = "ipfs://QmTestMetadata456";

    await nft.safeMint(recipient.address, uri);
    expect(await nft.tokenURI(0)).to.equal(uri);
  });

  it("totalSupply increases after minting", async function () {
    const { nft, owner, recipient } = await deployFixture();

    expect(await nft.totalSupply()).to.equal(0);
    await nft.safeMint(recipient.address, "ipfs://QmA");
    expect(await nft.totalSupply()).to.equal(1);
    await nft.safeMint(recipient.address, "ipfs://QmB");
    expect(await nft.totalSupply()).to.equal(2);
  });

  it("Non-owner cannot mint", async function () {
    const { nft, other, recipient } = await deployFixture();

    await expect(
      nft.connect(other).safeMint(recipient.address, "ipfs://QmX")
    ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
  });

  it("Token holder can burn their NFT", async function () {
    const { nft, owner, recipient } = await deployFixture();

    await nft.safeMint(recipient.address, "ipfs://QmBurn");
    expect(await nft.totalSupply()).to.equal(1);

    await nft.connect(recipient).burn(0);
    expect(await nft.totalSupply()).to.equal(0);
  });

  it("Non-holder cannot burn an NFT", async function () {
    const { nft, owner, other, recipient } = await deployFixture();

    await nft.safeMint(recipient.address, "ipfs://QmNoBurn");

    await expect(
      nft.connect(other).burn(0)
    ).to.be.revertedWithCustomError(nft, "ERC721InsufficientApproval");
  });

  it("Owner can transfer ownership", async function () {
    const { nft, owner, other } = await deployFixture();

    await nft.transferOwnership(other.address);
    expect(await nft.owner()).to.equal(other.address);

    // New owner can mint
    await nft.connect(other).safeMint(other.address, "ipfs://QmNewOwner");
    expect(await nft.ownerOf(0)).to.equal(other.address);

    // Old owner cannot mint
    await expect(
      nft.connect(owner).safeMint(owner.address, "ipfs://QmOldOwner")
    ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
  });

  it("Supports ERC721 and ERC721Enumerable interfaces", async function () {
    const { nft } = await deployFixture();

    // ERC721 interface ID
    expect(await nft.supportsInterface("0x80ac58cd")).to.be.true;
    // ERC721Enumerable interface ID
    expect(await nft.supportsInterface("0x780e9d63")).to.be.true;
    // ERC721Metadata interface ID
    expect(await nft.supportsInterface("0x5b5e139f")).to.be.true;
  });
});
