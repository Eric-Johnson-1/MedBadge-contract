const { task } = require("hardhat/config");

task("check-wrapped-nft").setAction(async (taskArgs, hre) => {
    const ethers = hre.ethers
    const wrappedNft = await ethers.getContract("WrappedNft")

    const totalSupply = await wrappedNft.totalSupply()
    console.log(`totalSupply is ${totalSupply}`)
    for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
        const owner = await wrappedNft.ownerOf(tokenId)
        console.log(`tokenId is ${tokenId}, owner is ${owner}`)
    }
})
