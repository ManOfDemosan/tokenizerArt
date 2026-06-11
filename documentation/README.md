# TokenizeArt - Technical Documentation

## Project Overview

TokenizeArt is a BEP-721 (ERC-721) NFT project deployed on the BNB Smart Chain Testnet. It implements a non-fungible token smart contract that allows minting unique digital artworks with metadata stored on IPFS, plus a fully on-chain variant as a bonus.

### Network Information

| Property | Value |
|----------|-------|
| Network | BNB Smart Chain Testnet |
| Chain ID | 97 |
| RPC URL | https://bsc-testnet.publicnode.com |
| Explorer | https://testnet.bscscan.com |
| Faucet | https://www.bnbchain.org/en/testnet-faucet |

### Token Standard

**BEP-721 (ERC-721)** - The standard for non-fungible tokens on BNB Chain. Each token is unique and has its own metadata URI pointing to a JSON document describing the asset.

---

## Installation & Setup

```bash
# Clone and install
cd TokenizeArt
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your private key and settings
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `BSC_TESTNET_RPC` | BNB Testnet RPC endpoint |
| `PRIVATE_KEY` | Deployer wallet private key |
| `BSCSCAN_API_KEY` | BscScan API key for verification |
| `NFT_CONTRACT_ADDRESS` | Deployed NFT contract address |
| `METADATA_IPFS_URI` | IPFS URI for NFT metadata JSON |
| `ONCHAIN_NFT_CONTRACT_ADDRESS` | Deployed on-chain NFT address |

### Commands

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm test` | Run unit tests |
| `npm run deploy:local` | Deploy to local Hardhat network |
| `npm run deploy:testnet` | Deploy to BNB Testnet |
| `npm run mint:local` | Mint on local Hardhat network |
| `npm run mint:testnet` | Mint on BNB Testnet |
| `npm run deploy:onchain:testnet` | Deploy on-chain NFT to testnet |

---

## IPFS Upload Process

NFT metadata and images are stored on IPFS for decentralized, permanent storage.

### Steps:

1. **Prepare the image**: Create or select an image that includes "42"
2. **Upload image to Pinata**:
   - Go to [pinata.cloud](https://pinata.cloud) and create an account
   - Upload the image file
   - Copy the resulting CID (Content Identifier)
3. **Create metadata JSON** (`mint/metadata/1.json`):
   - Set `image` field to `ipfs://<IMAGE_CID>`
   - Include name, description, and attributes
4. **Upload metadata JSON to Pinata**:
   - Upload the JSON file
   - Copy the metadata CID
5. **Configure**: Set `METADATA_IPFS_URI=ipfs://<METADATA_CID>` in `.env`

---

## Smart Contract Design

### Jaehwkim42Art (IPFS Version)

**Inheritance chain**: ERC721 → ERC721URIStorage → ERC721Enumerable → ERC721Burnable → Ownable

| Feature | Implementation |
|---------|---------------|
| Collection Name | "42 Art by jaehwkim" |
| Symbol | "J42ART" |
| Token ID | Auto-incrementing from 0 |
| Metadata | Per-token IPFS URI via ERC721URIStorage |
| Minting | `safeMint(to, uri)` - owner only |
| Burning | Token holder can burn their own NFT |
| Enumeration | `totalSupply()`, `tokenByIndex()` |
| Access Control | Ownable with transferable ownership |

### Jaehwkim42ArtOnChain (On-Chain Version)

**Inheritance chain**: ERC721 → ERC721Enumerable → ERC721Burnable → Ownable

| Feature | Implementation |
|---------|---------------|
| Collection Name | "42 OnChain Art by jaehwkim" |
| Symbol | "J42OC" |
| Metadata | Fully on-chain via base64-encoded JSON |
| Image | SVG generated on-chain with deterministic colors |
| Minting | `safeMint(to)` - no URI needed |

The on-chain version generates SVG artwork directly in the `tokenURI()` function. Each token gets a unique gradient background based on its token ID, with "42" prominently displayed.

---

## Security Model

| Aspect | Mechanism |
|--------|-----------|
| Mint access | Only the contract owner (Ownable) |
| Burn access | Only the token holder or approved operator |
| Ownership transfer | `transferOwnership()` - owner only |
| Immutability | Contract code is immutable after deployment |
| Token metadata | IPFS content is immutable by CID |
| Standard compliance | Full ERC-721 + ERC-721Enumerable + ERC-721Metadata |

---

## Deployment & Minting Flow

### Deploy
```
npm run deploy:testnet
→ Deployer wallet creates the NFT contract
→ Contract address is printed
→ Save address to .env as NFT_CONTRACT_ADDRESS
```

### Mint
```
npm run mint:testnet
→ Reads contract address and metadata URI from .env
→ Calls safeMint(deployer, metadataURI)
→ Verifies ownerOf(tokenId) == deployer
→ Prints tokenURI for verification
```

---

## Deployment Information

| Item | Value |
|------|-------|
| Network | BNB Smart Chain Testnet (Chain ID: 97) |
| Deployer Address | [`0x4A6AC203f3c46B070E9251902E35524572dd1a5b`](https://testnet.bscscan.com/address/0x4A6AC203f3c46B070E9251902E35524572dd1a5b) |
| NFT Contract (IPFS) | [`0x5F51AF1cb11E90Aa4d4C158fd093B77857c8E56a`](https://testnet.bscscan.com/address/0x5F51AF1cb11E90Aa4d4C158fd093B77857c8E56a) |
| NFT Contract (OnChain) | [`0x9726ECFD907cFb37FA1ea7248b5b2134Dcf9F87B`](https://testnet.bscscan.com/address/0x9726ECFD907cFb37FA1ea7248b5b2134Dcf9F87B) |
| Token Tracker | [42 Art by jaehwkim (J42ART)](https://testnet.bscscan.com/token/0x5F51AF1cb11E90Aa4d4C158fd093B77857c8E56a) |
| Verified Source Code | [View on BscScan](https://testnet.bscscan.com/address/0x5F51AF1cb11E90Aa4d4C158fd093B77857c8E56a#code) |
| Mint Transaction | [`0xa28749f7...`](https://testnet.bscscan.com/tx/0xa28749f7c09d4d2b59d265c79eb892321584034b3fae2fe4e35ca5c1f73f8720) |
| NFT Image (IPFS) | [`ipfs://bafybeiboefdgqfcwrzvbtaleugwrggpi5ciwd6c3rhl2e7bggkhavzro3a`](https://gateway.pinata.cloud/ipfs/bafybeiboefdgqfcwrzvbtaleugwrggpi5ciwd6c3rhl2e7bggkhavzro3a) |
| NFT Metadata (IPFS) | [`ipfs://bafkreig23np2uyvcbhzyd4pgrukueipn4gpkyowjorqq5egdl5ir65xqhy`](https://gateway.pinata.cloud/ipfs/bafkreig23np2uyvcbhzyd4pgrukueipn4gpkyowjorqq5egdl5ir65xqhy) |

### Quick Links

- [Read Contract (BscScan)](https://testnet.bscscan.com/address/0x5F51AF1cb11E90Aa4d4C158fd093B77857c8E56a#readContract)
- [Write Contract (BscScan)](https://testnet.bscscan.com/address/0x5F51AF1cb11E90Aa4d4C158fd093B77857c8E56a#writeContract)
- [Token Transfers](https://testnet.bscscan.com/token/0x5F51AF1cb11E90Aa4d4C158fd093B77857c8E56a)
- [NFT Image on IPFS](https://gateway.pinata.cloud/ipfs/bafybeiboefdgqfcwrzvbtaleugwrggpi5ciwd6c3rhl2e7bggkhavzro3a)
- [NFT Metadata on IPFS](https://gateway.pinata.cloud/ipfs/bafkreig23np2uyvcbhzyd4pgrukueipn4gpkyowjorqq5egdl5ir65xqhy)

---

## Frontend (Bonus)

The `frontend/` directory contains a single-page minting DApp:

- **No build tools required** - pure HTML/CSS/JS
- **MetaMask integration** - wallet connection and BSC Testnet auto-switch
- **Minting UI** - input contract address, recipient, and metadata URI
- **Result display** - shows tokenId, owner, tokenURI, and tx hash
- **NFT preview** - loads and displays the NFT image from IPFS or on-chain data

To use: open `frontend/index.html` in a browser with MetaMask installed.
