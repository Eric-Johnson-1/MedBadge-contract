const { task } = require("hardhat/config");
const { testnetChainsConfig } = require("../helper-hardhat-config");

task("burn-and-cross")
    .addParam("tokenId", "tokenId to be locked and crossed")
    .addOptionalParam("destChainSelector", "chain selector of destination chain")
    .addOptionalParam("destReceiver", "receiver in the destination chain")
    .setAction(async (taskArgs, hre) => {
        const tokenId = taskArgs.tokenId
        const thisChainConfig = testnetChainsConfig[network.config.chainId]
        const ethers = hre.ethers
        const { firstAccount } = await hre.getNamedAccounts()
        const wrappedNft = await ethers.getContract("WrappedNft")
        const nftPoolBurnAndMint = await ethers.getContract("NftPoolBurnAndMint")
        const minTokenBalance = ethers.parseEther("0.3") // 费用数值可以去CCIP浏览器看看最近的几笔交易
        const nftPoolBurnAndMintAddr = nftPoolBurnAndMint.target

        let destChainSelector
        if (taskArgs.destChainSelector) {
            destChainSelector = taskArgs.destChainSelector
        } else {
            destChainSelector = thisChainConfig.destChainSelector
        }

        let destReceiver
        if (taskArgs.destReceiver) {
            destReceiver = taskArgs.destReceiver
        } else {
            const nftPoolLockAndRelease = await hre.companionNetworks.destChain.deployments.get("NftPoolLockAndRelease") // hre.companionNetworks.xxx可以获取其它网络
            destReceiver = nftPoolLockAndRelease.address
        }

        const linkTokenAddr = thisChainConfig.linkTokenAddr
        const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddr)
        const balance = await linkToken.balanceOf(nftPoolBurnAndMintAddr)
        if (balance < minTokenBalance) {
            console.log("linkToken is not enough, transfering ...")
            const linkTokenTransferTx = await linkToken.transfer(nftPoolBurnAndMintAddr, minTokenBalance)
            await linkTokenTransferTx.wait()
            console.log("linkToken transfer success")
        } else {
            console.log("linkToken is enough")
        }

        console.log("wnft approving...")
        const wnftApproveTx = await wrappedNft.approve(nftPoolBurnAndMintAddr, tokenId)
        await wnftApproveTx.wait()
        console.log("wnft approve successs")

        const burnAndSendNftTx = await nftPoolBurnAndMint.burnAndSendNft(
            tokenId,
            firstAccount,
            destChainSelector,
            destReceiver
        )
        console.log(`WNFT burned and crossed, transaction hash is ${burnAndSendNftTx.hash}`)
    })
