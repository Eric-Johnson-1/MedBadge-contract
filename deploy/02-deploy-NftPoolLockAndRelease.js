const { network } = require('hardhat');
const { localChains, testnetChainsConfig } = require('../helper-hardhat-config');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { firstAccount } = await getNamedAccounts()
    const { deploy, log } = deployments

    let sourceRouterAddr
    let linkTokenAddr
    if (localChains.includes(network.name)) {
        const ccipLocalSimulator = await ethers.getContract("CCIPLocalSimulator")
        const ccipConfig = await ccipLocalSimulator.configuration()
        sourceRouterAddr = ccipConfig.sourceRouter_
        linkTokenAddr = ccipConfig.linkToken_
    } else {
        sourceRouterAddr = testnetChainsConfig[network.config.chainId].routerAddr
        linkTokenAddr = testnetChainsConfig[network.config.chainId].linkTokenAddr
    }
    const myNftDeployment = await deployments.get("MyNft")

    log("NftPoolLockAndRelease deploying")
    const nftPoolLockAndRelease = await deploy("NftPoolLockAndRelease", {
        from: firstAccount,
        args: [sourceRouterAddr, linkTokenAddr, myNftDeployment.address],
        log: true
    })
    log("NftPoolLockAndRelease deployed successfully")

    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        await hre.run("verify:verify", {
            address: nftPoolLockAndRelease.address,
            constructorArguments: [sourceRouterAddr, linkTokenAddr, myNftDeployment.address],
        });
    } else {
        console.log("Network is not sepolia, verification skipped...")
    }
}

module.exports.tags = ["sourceChain", "all"]
