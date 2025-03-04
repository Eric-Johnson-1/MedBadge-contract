const { task } = require("hardhat/config");
const { testnetChainsConfig } = require("../helper-hardhat-config");

task("lock-and-cross")
    .addParam("tokenId", "tokenId to be locked and crossed")
    .addOptionalParam("destChainSelector", "chain selector of destination chain")
    .addOptionalParam("destReceiver", "receiver in the destination chain")
    .setAction(async (taskArgs, hre) => {
        const tokenId = taskArgs.tokenId
        const thisChainConfig = testnetChainsConfig[network.config.chainId]
        const ethers = hre.ethers
        const { firstAccount } = await hre.getNamedAccounts()
        const myNft = await ethers.getContract("MyNft")
        const nftPoolLockAndRelease = await ethers.getContract("NftPoolLockAndRelease")
        const minTokenBalance = ethers.parseEther("0.1") // 费用数值可以去CCIP浏览器看看最近的几笔交易
        const nftPoolLockAndReleaseAddr = nftPoolLockAndRelease.target

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
            const nftPoolBurnAndMint = await hre.companionNetworks.destChain.deployments.get("NftPoolBurnAndMint") // hre.companionNetworks.xxx可以获取其它网络
            destReceiver = nftPoolBurnAndMint.address
        }

        const linkTokenAddr = thisChainConfig.linkTokenAddr
        const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddr)
        const balance = await linkToken.balanceOf(nftPoolLockAndReleaseAddr)
        if (balance < minTokenBalance) {
            console.log("linkToken is not enough, transfering ...")
            const linkTokenTransferTx = await linkToken.transfer(nftPoolLockAndReleaseAddr, minTokenBalance)
            await linkTokenTransferTx.wait()
            console.log("linkToken transfer success")
        } else {
            console.log("linkToken is enough")
        }

        console.log("nft approving...")
        const nftApproveTx = await myNft.approve(nftPoolLockAndReleaseAddr, tokenId)
        await nftApproveTx.wait()
        console.log("nft approve successs")

        const lockAndSendNftTx = await nftPoolLockAndRelease.lockAndSendNft(
            tokenId,
            firstAccount,
            destChainSelector,
            destReceiver
        )
        console.log(`NFT locked and crossed, transaction hash is ${lockAndSendNftTx.hash}`)
    })
