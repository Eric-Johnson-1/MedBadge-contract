module.exports = async ({ getNamedAccounts, deployments }) => {
    const { firstAccount } = await getNamedAccounts()
    const { deploy, log } = deployments

    log("WrappedNft deploying")
    const wrappedNft = await deploy("WrappedNft", {
        from: firstAccount,
        args: ["WrappedNft", "WNT"],
        log: true
    })
    log("WrappedNft deployed successfully")

    if (network.config.chainId === 80002 && process.env.POLYGON_SCAN_API_KEY) {
        await hre.run("verify:verify", {
            address: wrappedNft.address,
            constructorArguments: ["WrappedNft", "WNT"],
        });
    } else {
        console.log("Network is not amoy, verification skipped...")
    }
}

module.exports.tags = ["destChain", "all"]
