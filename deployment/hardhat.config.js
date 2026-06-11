require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CONTRACTS_DIR = path.join(ROOT, "code");
const {
  BSC_TESTNET_RPC = "https://bsc-testnet.publicnode.com",
  PRIVATE_KEY = "",
  BSCSCAN_API_KEY = ""
} = process.env;
const OZ_CONTRACTS = path.join(ROOT, "node_modules", "@openzeppelin", "contracts").replace(/\\/g, "/");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun"
    },
    remappings: [`@openzeppelin/contracts=${OZ_CONTRACTS}`]
  },
  paths: {
    root: ROOT,
    sources: CONTRACTS_DIR,
    tests: path.join(__dirname, "test"),
    cache: path.join(__dirname, "cache"),
    artifacts: path.join(__dirname, "artifacts")
  },
  networks: {
    hardhat: {},
    bsctest: {
      url: BSC_TESTNET_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: BSCSCAN_API_KEY,
    customChains: [
      {
        network: "bsctest",
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com"
        }
      }
    ]
  }
};
