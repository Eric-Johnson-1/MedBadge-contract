module.exports = async ({ getNamedAccounts, deployments }) => {
    const { firstAccount } = await getNamedAccounts()
    const { deploy, log } = deployments

    log("MedBadgeNft deploying")
    const medBadgeNft = await deploy("MedBadgeNft", {
        from: firstAccount,
        args: ["MedBadgeNft", "MBG"],
        log: true
    })
    log("MedBadgeNft deployed successfully")

    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        await hre.run("verify:verify", {
            address: medBadgeNft.address,
            constructorArguments: ["MedBadgeNft", "MBG"],
        });
    } else {
        console.log("Network is not sepolia, verification skipped...")
    }
}

module.exports.tags = ["medBadgeNft", "all"]
