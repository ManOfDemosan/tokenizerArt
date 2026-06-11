# TokenizeArt

BEP-721 (ERC-721) NFT smart contract deployed on BNB Smart Chain Testnet.

## Why These Tools?

- **Hardhat** - Industry-standard Ethereum development environment with built-in testing, compilation, and deployment. Consistent with the Tokenizer project.
- **OpenZeppelin Contracts v5** - Battle-tested, audited smart contract library. ERC721, ERC721URIStorage, ERC721Enumerable, ERC721Burnable, and Ownable provide all needed NFT functionality.
- **Solidity 0.8.24** - Latest stable compiler with built-in overflow checks and custom errors.
- **IPFS (Pinata)** - Decentralized, content-addressed storage ensuring metadata permanence.
- **ethers.js v6** - Lightweight library for frontend blockchain interaction.

## Directory Structure

```
TokenizeArt/
├── code/                       # Solidity smart contracts
│   ├── Jaehwkim42Art.sol       # ERC-721 NFT (IPFS metadata)
│   └── Jaehwkim42ArtOnChain.sol # [Bonus] Fully on-chain NFT
├── deployment/
│   ├── hardhat.config.js       # Hardhat configuration
│   ├── scripts/                # Deploy scripts
│   └── test/                   # Unit tests
├── mint/
│   ├── scripts/                # Minting scripts
│   └── metadata/               # NFT metadata JSON
├── frontend/                   # [Bonus] Minting DApp
└── documentation/              # Technical documentation
```

## Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to BSC Testnet
npm run deploy:testnet

# Mint an NFT
npm run mint:testnet
```

## Contracts

### Jaehwkim42Art
- **Name**: "42 Art by jaehwkim"
- **Symbol**: J42ART
- **Features**: ERC721 + URIStorage + Enumerable + Burnable + Ownable
- **Minting**: `safeMint(address to, string uri)` - owner only

### Jaehwkim42ArtOnChain (Bonus)
- **Name**: "42 OnChain Art by jaehwkim"
- **Symbol**: J42OC
- **Features**: Fully on-chain SVG art + metadata (no IPFS dependency)

## Deployment

> Fill in after deployment

| Item | Value |
|------|-------|
| Network | BNB Smart Chain Testnet (Chain ID: 97) |
| Deployer | [`0x4A6AC203f3c46B070E9251902E35524572dd1a5b`](https://testnet.bscscan.com/address/0x4A6AC203f3c46B070E9251902E35524572dd1a5b) |
| NFT Contract | [`0x5F51AF1cb11E90Aa4d4C158fd093B77857c8E56a`](https://testnet.bscscan.com/address/0x5F51AF1cb11E90Aa4d4C158fd093B77857c8E56a) |
| Verified Source | [View Code](https://testnet.bscscan.com/address/0x5F51AF1cb11E90Aa4d4C158fd093B77857c8E56a#code) |
| OnChain NFT | [`0x9726ECFD907cFb37FA1ea7248b5b2134Dcf9F87B`](https://testnet.bscscan.com/address/0x9726ECFD907cFb37FA1ea7248b5b2134Dcf9F87B) |
| OnChain Mint Tx | [`0x4d6ddbb6...`](https://testnet.bscscan.com/tx/0x4d6ddbb68cc32f2dfa498609b0aeed59343c86d77b99f576a6436b63d59f3db8) (token #0, fully on-chain SVG) |
| Token Tracker | [42 Art by jaehwkim (J42ART)](https://testnet.bscscan.com/token/0x5F51AF1cb11E90Aa4d4C158fd093B77857c8E56a) |
| Explorer | https://testnet.bscscan.com |

## Security

- **Mint access**: Owner-only via OpenZeppelin Ownable
- **Burn access**: Token holder or approved operator only
- **Metadata**: Immutable IPFS content (content-addressed)
- **Standards**: Full ERC-721 compliance with Enumerable extension
# tokenizerArt
