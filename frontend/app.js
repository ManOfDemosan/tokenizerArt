const BSC_TESTNET_CHAIN_ID = "0x61"; // 97
const BSC_TESTNET_CONFIG = {
  chainId: BSC_TESTNET_CHAIN_ID,
  chainName: "BNB Smart Chain Testnet",
  nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
  rpcUrls: ["https://bsc-testnet.publicnode.com"],
  blockExplorerUrls: ["https://testnet.bscscan.com"]
};

// Jaehwkim42Art ABI (only the functions we need)
const NFT_ABI = [
  "function safeMint(address to, string memory uri) public",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function totalSupply() public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

let provider = null;
let signer = null;

const $ = (id) => document.getElementById(id);

function showStatus(msg, type) {
  const section = $("statusSection");
  const el = $("statusMessage");
  el.textContent = msg;
  el.className = "status-message " + type;
  section.classList.remove("hidden");
}

function hideStatus() {
  $("statusSection").classList.add("hidden");
}

async function switchToBscTestnet() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BSC_TESTNET_CHAIN_ID }]
    });
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [BSC_TESTNET_CONFIG]
      });
    } else {
      throw err;
    }
  }
}

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    showStatus("MetaMask not detected. Please install MetaMask.", "error");
    return;
  }

  try {
    showStatus("Connecting wallet...", "loading");
    await switchToBscTestnet();

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    const address = await signer.getAddress();

    $("walletAddress").textContent = address;
    $("walletInfo").classList.remove("hidden");
    $("connectBtn").textContent = "Connected";
    $("connectBtn").disabled = true;
    $("mintBtn").disabled = false;

    // Default recipient to connected wallet
    if (!$("recipient").value) {
      $("recipient").placeholder = address + " (connected wallet)";
    }

    hideStatus();
  } catch (err) {
    showStatus("Connection failed: " + err.message, "error");
  }
}

async function mintNFT() {
  const contractAddress = $("contractAddress").value.trim();
  const metadataUri = $("metadataUri").value.trim();
  const recipientInput = $("recipient").value.trim();
  const recipient = recipientInput || (await signer.getAddress());

  if (!contractAddress) {
    showStatus("Please enter the contract address.", "error");
    return;
  }
  if (!metadataUri) {
    showStatus("Please enter the metadata URI.", "error");
    return;
  }

  try {
    showStatus("Sending mint transaction...", "loading");
    $("mintBtn").disabled = true;

    const nft = new ethers.Contract(contractAddress, NFT_ABI, signer);

    const tx = await nft.safeMint(recipient, metadataUri);
    showStatus("Transaction sent. Waiting for confirmation...", "loading");

    const receipt = await tx.wait();

    // Extract tokenId from Transfer event
    const transferLog = receipt.logs.find((log) => {
      try {
        const parsed = nft.interface.parseLog(log);
        return parsed && parsed.name === "Transfer";
      } catch {
        return false;
      }
    });

    let tokenId;
    if (transferLog) {
      const parsed = nft.interface.parseLog(transferLog);
      tokenId = parsed.args[2];
    } else {
      tokenId = (await nft.totalSupply()) - 1n;
    }

    // Query on-chain data
    const owner = await nft.ownerOf(tokenId);
    const tokenUri = await nft.tokenURI(tokenId);

    // Display results
    $("resultTokenId").textContent = tokenId.toString();
    $("resultOwner").textContent = owner;
    $("resultTokenUri").textContent = tokenUri;

    const txLink = $("resultTxHash");
    txLink.textContent = receipt.hash;
    txLink.href = `https://testnet.bscscan.com/tx/${receipt.hash}`;

    $("resultSection").classList.remove("hidden");

    // Try to load NFT image preview
    loadNftPreview(tokenUri);

    showStatus("NFT minted successfully!", "success");
  } catch (err) {
    showStatus("Mint failed: " + err.message, "error");
  } finally {
    $("mintBtn").disabled = false;
  }
}

async function loadNftPreview(uri) {
  try {
    let metadataUrl = uri;

    // Handle ipfs:// URIs
    if (uri.startsWith("ipfs://")) {
      metadataUrl = "https://gateway.pinata.cloud/ipfs/" + uri.slice(7);
    }

    // Handle on-chain base64 JSON
    if (uri.startsWith("data:application/json;base64,")) {
      const json = atob(uri.split(",")[1]);
      const metadata = JSON.parse(json);
      displayImage(metadata.image);
      return;
    }

    const res = await fetch(metadataUrl);
    const metadata = await res.json();

    if (metadata.image) {
      displayImage(metadata.image);
    }
  } catch {
    // Preview is optional, silently fail
  }
}

function displayImage(imageUri) {
  let src = imageUri;
  if (imageUri.startsWith("ipfs://")) {
    src = "https://gateway.pinata.cloud/ipfs/" + imageUri.slice(7);
  }
  $("nftImage").src = src;
  $("nftPreview").classList.remove("hidden");
}

// Event listeners
$("connectBtn").addEventListener("click", connectWallet);
$("mintBtn").addEventListener("click", mintNFT);

// Auto-connect if already authorized
if (typeof window.ethereum !== "undefined") {
  window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
    if (accounts.length > 0) {
      connectWallet();
    }
  });
}
