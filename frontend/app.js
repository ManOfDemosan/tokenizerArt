// 42 Art NFT DApp on BSC Testnet.
//  - View & Verify: read-only, reads ownerOf / tokenURI from a public RPC (no wallet).
//  - Mint: requires MetaMask; only the contract owner can mint.

const READ_RPC = "https://bsc-testnet.publicnode.com";
const readProvider = new ethers.JsonRpcProvider(READ_RPC);

// The contract owner: only this account can mint (Ownable / onlyOwner).
const OWNER_ADDRESS = "0x4A6AC203f3c46B070E9251902E35524572dd1a5b";
const shortAddr = (a) => a.slice(0, 6) + "..." + a.slice(-4);

// The two collections. They have DIFFERENT safeMint signatures.
const IPFS_CONTRACT = "0x5F51AF1cb11E90Aa4d4C158fd093B77857c8E56a";       // safeMint(to, uri)
const ONCHAIN_CONTRACT = "0x9726ECFD907cFb37FA1ea7248b5b2134Dcf9F87B";   // safeMint(to)
let mintMode = "ipfs"; // "ipfs" | "onchain"

const BSC_TESTNET_CHAIN_ID = "0x61"; // 97
const BSC_TESTNET_CONFIG = {
  chainId: BSC_TESTNET_CHAIN_ID,
  chainName: "BNB Smart Chain Testnet",
  nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
  rpcUrls: [READ_RPC],
  blockExplorerUrls: ["https://testnet.bscscan.com"]
};

const READ_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)"
];
const MINT_ABI = [
  "function safeMint(address to, string memory uri) public",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function totalSupply() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];
const ONCHAIN_MINT_ABI = [
  "function safeMint(address to) public",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function totalSupply() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

// IPFS gateways tried in order (fallback if one is slow/unavailable).
const GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://dweb.link/ipfs/"
];

const $ = (id) => document.getElementById(id);

function setStatus(el, msg, type) {
  el.textContent = msg;
  el.className = "status-message " + type;
  el.classList.remove("hidden");
}
function clearStatus(el) {
  el.classList.add("hidden");
}

function gatewayUrl(uri, index = 0) {
  if (uri && uri.startsWith("ipfs://")) return GATEWAYS[index] + uri.slice(7);
  return uri; // already http(s) or a data: URI
}

// ============ VIEW / VERIFY ============

async function fetchMetadata(tokenUri) {
  if (tokenUri.startsWith("data:application/json;base64,")) {
    return JSON.parse(atob(tokenUri.split(",")[1]));
  }
  if (tokenUri.startsWith("data:application/json,")) {
    return JSON.parse(decodeURIComponent(tokenUri.slice("data:application/json,".length)));
  }
  const attempts = tokenUri.startsWith("ipfs://") ? GATEWAYS.length : 1;
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(gatewayUrl(tokenUri, i));
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error("metadata fetch failed");
}

function imageSrc(image) {
  if (!image) return "";
  if (image.startsWith("data:")) return image;     // on-chain SVG
  if (image.startsWith("ipfs://")) return gatewayUrl(image, 0);
  return image;
}

async function loadNft(contract, tokenId) {
  if (!contract || tokenId === "") {
    setStatus($("viewStatus"), "Enter a contract address and a token ID.", "error");
    return;
  }
  try {
    setStatus($("viewStatus"), "Reading from the blockchain...", "loading");
    $("nftCard").classList.add("hidden");

    const nft = new ethers.Contract(contract, READ_ABI, readProvider);
    const [owner, tokenUri] = await Promise.all([
      nft.ownerOf(tokenId),
      nft.tokenURI(tokenId)
    ]);

    const ownerEl = $("nftOwner");
    ownerEl.textContent = owner;
    ownerEl.href = "https://testnet.bscscan.com/address/" + owner;

    $("nftTokenId").textContent = "#" + tokenId;

    const isData = tokenUri.startsWith("data:");
    $("nftStorage").textContent = isData
      ? "100% on-chain (SVG + metadata in the contract)"
      : "IPFS (decentralized storage)";

    const uriEl = $("nftUri");
    uriEl.textContent = isData ? tokenUri.slice(0, 40) + "... (on-chain data URI)" : tokenUri;
    uriEl.href = isData ? tokenUri : gatewayUrl(tokenUri, 0);

    let meta = {};
    try {
      meta = await fetchMetadata(tokenUri);
      clearStatus($("viewStatus"));
    } catch {
      setStatus($("viewStatus"), "On-chain data loaded, but the metadata/image could not be fetched.", "error");
    }

    $("nftName").textContent = meta.name || ("Token #" + tokenId);
    $("nftDesc").textContent = meta.description || "";

    const img = $("nftImage");
    const src = imageSrc(meta.image);
    if (src) {
      img.src = src;
      img.style.display = "";
    } else {
      img.removeAttribute("src");
      img.style.display = "none";
    }

    const attrBox = $("nftAttributes");
    attrBox.innerHTML = "";
    (meta.attributes || []).forEach((a) => {
      const chip = document.createElement("span");
      chip.className = "attr-chip";
      const k = document.createElement("span");
      k.className = "attr-k";
      k.textContent = a.trait_type;
      const v = document.createElement("span");
      v.className = "attr-v";
      v.textContent = a.value;
      chip.append(k, v);
      attrBox.appendChild(chip);
    });

    $("nftCard").classList.remove("hidden");
  } catch (err) {
    setStatus($("viewStatus"), "Lookup failed: " + (err.shortMessage || err.message), "error");
  }
}

// ============ MINT ============

let signer = null;

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

async function connectWallet(promptPicker = false) {
  if (typeof window.ethereum === "undefined") {
    setStatus($("mintStatus"), "MetaMask not detected. Please install MetaMask.", "error");
    return;
  }
  try {
    setStatus($("mintStatus"), "Connecting wallet...", "loading");
    await switchToBscTestnet();

    // When the button is clicked, open MetaMask's account picker so the
    // user can choose / switch which account is connected.
    if (promptPicker) {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }]
      });
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    const address = await signer.getAddress();

    const isOwner = address.toLowerCase() === OWNER_ADDRESS.toLowerCase();

    $("walletAddress").textContent = address + (isOwner ? "  (owner)" : "");
    $("walletInfo").classList.remove("hidden");
    $("connectBtn").textContent = "Switch account";
    $("connectBtn").disabled = false;
    $("mintBtn").disabled = !isOwner;

    if (isOwner) {
      setStatus($("mintStatus"), "Owner account connected - ready to mint.", "success");
    } else {
      setStatus(
        $("mintStatus"),
        "Connected as a non-owner. Only the owner (" + shortAddr(OWNER_ADDRESS) +
          ") can mint. Click \"Switch account\" and pick the owner account in MetaMask.",
        "error"
      );
    }
  } catch (err) {
    setStatus($("mintStatus"), "Connection failed: " + (err.shortMessage || err.message), "error");
  }
}

async function mintNFT() {
  const contractAddress = $("mintContract").value.trim();
  const recipient = $("mintRecipient").value.trim() || (await signer.getAddress());

  if (!contractAddress) { setStatus($("mintStatus"), "Enter the contract address.", "error"); return; }

  try {
    setStatus($("mintStatus"), "Sending mint transaction...", "loading");
    $("mintBtn").disabled = true;
    $("mintResult").classList.add("hidden");

    let nft, tx;
    if (mintMode === "onchain") {
      // On-chain NFT: contract builds the SVG + metadata, no URI needed.
      nft = new ethers.Contract(contractAddress, ONCHAIN_MINT_ABI, signer);
      tx = await nft.safeMint(recipient);
    } else {
      // IPFS NFT: pass the metadata URI (the tokenURI).
      const metadataUri = $("mintUri").value.trim();
      if (!metadataUri) { setStatus($("mintStatus"), "Enter the metadata URI.", "error"); $("mintBtn").disabled = false; return; }
      nft = new ethers.Contract(contractAddress, MINT_ABI, signer);
      tx = await nft.safeMint(recipient, metadataUri);
    }
    setStatus($("mintStatus"), "Transaction sent. Waiting for confirmation...", "loading");
    const receipt = await tx.wait();

    let tokenId;
    const transferLog = receipt.logs.find((log) => {
      try { return nft.interface.parseLog(log)?.name === "Transfer"; }
      catch { return false; }
    });
    if (transferLog) {
      tokenId = nft.interface.parseLog(transferLog).args[2];
    } else {
      tokenId = (await nft.totalSupply()) - 1n;
    }

    const owner = await nft.ownerOf(tokenId);

    $("resultTokenId").textContent = tokenId.toString();
    $("resultOwner").textContent = owner;
    const txLink = $("resultTxHash");
    txLink.textContent = receipt.hash;
    txLink.href = "https://testnet.bscscan.com/tx/" + receipt.hash;

    $("mintResult").classList.remove("hidden");
    setStatus($("mintStatus"), "NFT minted successfully!", "success");
  } catch (err) {
    setStatus($("mintStatus"), "Mint failed: " + (err.shortMessage || err.message), "error");
  } finally {
    $("mintBtn").disabled = false;
  }
}

// ============ Wiring ============

function setMintMode(mode) {
  mintMode = mode;
  const onchain = mode === "onchain";
  $("mintContract").value = onchain ? ONCHAIN_CONTRACT : IPFS_CONTRACT;
  $("uriGroup").classList.toggle("hidden", onchain);
  $("onchainHint").classList.toggle("hidden", !onchain);
  $("mintBtn").textContent = onchain ? "Mint On-chain NFT" : "Mint IPFS NFT";
  document.querySelectorAll(".mode-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.mode === mode);
  });
}

document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => setMintMode(btn.dataset.mode));
});

document.querySelectorAll(".preset").forEach((btn) => {
  btn.addEventListener("click", () => {
    $("lookupContract").value = btn.dataset.contract;
    $("lookupTokenId").value = btn.dataset.token;
    loadNft(btn.dataset.contract, btn.dataset.token);
  });
});

$("lookupBtn").addEventListener("click", () => {
  loadNft($("lookupContract").value.trim(), $("lookupTokenId").value.trim());
});

$("connectBtn").addEventListener("click", () => connectWallet(true));
$("mintBtn").addEventListener("click", mintNFT);

// Auto-load the first NFT on page load
loadNft("0x5F51AF1cb11E90Aa4d4C158fd093B77857c8E56a", "0");

// Auto-connect (silently) if already authorized, and react to account switches.
if (typeof window.ethereum !== "undefined") {
  window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
    if (accounts.length > 0) connectWallet(false);
  });
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      signer = null;
      $("walletInfo").classList.add("hidden");
      $("connectBtn").textContent = "Connect MetaMask";
      $("mintBtn").disabled = true;
      clearStatus($("mintStatus"));
    } else {
      connectWallet(false); // re-check whether the new account is the owner
    }
  });
}
