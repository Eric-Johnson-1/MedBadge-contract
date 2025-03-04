// require('dotenv').config() // dotenv不安全，用env-enc
require('@chainlink/env-enc').config() // 在这个配置文件中有了这句，因此env-enc中的环境变量可以在整个项目的上下文中被访问，其它文件中就不需要写这句了

// 这一堆是hardhat-deploy相关的：
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require('@nomicfoundation/hardhat-chai-matchers');
require('@typechain/hardhat');
require('hardhat-gas-reporter');
require('solidity-coverage');

require("@nomicfoundation/hardhat-toolbox");
require('./tasks'); // 运行 npx hardhat help 能看到tasks
const { testnetWaitConfirmations } = require('./helper-hardhat-config');


const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const POLYGON_SCAN_API_KEY = process.env.POLYGON_SCAN_API_KEY
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const AMOY_RPC_URL = process.env.AMOY_RPC_URL
const HOLESKY_RPC_URL = process.env.HOLESKY_RPC_URL
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2

const accounts = [PRIVATE_KEY_1, PRIVATE_KEY_2]

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: accounts,
      chainId: 11155111,
      blockConfirmations: testnetWaitConfirmations,
      companionNetworks: {
        destChain: "amoy"
      }
    },
    amoy: {
      url: AMOY_RPC_URL,
      accounts: accounts,
      chainId: 80002,
      blockConfirmations: testnetWaitConfirmations,
      companionNetworks: {
        destChain: "sepolia"
      }
    },
    holesky: {
      url: HOLESKY_RPC_URL,
      accounts: accounts,
      chainId: 17000,
      blockConfirmations: testnetWaitConfirmations,
    },
  },
  etherscan: {
    // apiKey里的键是规定好的不能写成不一样的，比如polygonAmoy不能写成amoy
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      polygonAmoy: POLYGON_SCAN_API_KEY,
    }
    // apiKey: ETHERSCAN_API_KEY
  },
  namedAccounts: {
    firstAccount: {
      default: 0
    },
    secondAccount: {
      default: 1
    },
  },
  mocha: {
    timeout: 1000 * 1000 // 乘以1000是因为是毫秒
  },
  gasReporter: {
    enabled: false
  }
};
