const { network } = require('hardhat');
const { localChains, testnetChainsConfig } = require('../helper-hardhat-config');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { firstAccount } = await getNamedAccounts()
    const { deploy, log } = deployments

    let destRouterAddr
    let linkTokenAddr
    if (localChains.includes(network.name)) {
        const ccipLocalSimulator = await ethers.getContract("CCIPLocalSimulator")
        const ccipConfig = await ccipLocalSimulator.configuration()
        destRouterAddr = ccipConfig.sourceRouter_
        linkTokenAddr = ccipConfig.linkToken_
    } else {
        destRouterAddr = testnetChainsConfig[network.config.chainId].routerAddr
        linkTokenAddr = testnetChainsConfig[network.config.chainId].linkTokenAddr
    }
    const wrappedNftDeployment = await deployments.get("WrappedNft")

    log("NftPoolBurnAndMint deploying")
    const nftPoolBurnAndMint = await deploy("NftPoolBurnAndMint", {
        from: firstAccount,
        args: [destRouterAddr, linkTokenAddr, wrappedNftDeployment.address],
        log: true
    })
    log("NftPoolBurnAndMint deployed successfully")

    if (network.config.chainId === 80002 && process.env.POLYGON_SCAN_API_KEY) {
        await hre.run("verify:verify", {
            address: nftPoolBurnAndMint.address,
            constructorArguments: [destRouterAddr, linkTokenAddr, wrappedNftDeployment.address],
        });
    } else {
        console.log("Network is not amoy, verification skipped...")
    }
}

module.exports.tags = ["destChain", "all"]
