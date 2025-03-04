const { network } = require('hardhat');
const { localChains } = require('../helper-hardhat-config');

module.exports = async ({ getNamedAccounts, deployments }) => {
    if (localChains.includes(network.name)) {
        const { firstAccount } = await getNamedAccounts()
        const { deploy, log } = deployments

        log("CCIPLocalSimulator deploying")
        await deploy("CCIPLocalSimulator", {
            from: firstAccount,
            args: [],
            log: true
        })
        log("CCIPLocalSimulator deployed successfully")
    } else {
        console.log("Environment is not local, mock contract deployment skipped...")
    }
}

module.exports.tags = ["test", "all"]
