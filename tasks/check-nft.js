const { task } = require("hardhat/config");

task("check-nft").setAction(async (taskArgs, hre) => {
    const ethers = hre.ethers
    const medBadgeNft = await ethers.getContract("MedBadgeNft")

    const totalSupply = await medBadgeNft.totalSupply()
    console.log(`totalSupply is ${totalSupply}`)
    for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
        const owner = await medBadgeNft.ownerOf(tokenId)
        console.log(`tokenId is ${tokenId}, owner is ${owner}`)
    }
})
