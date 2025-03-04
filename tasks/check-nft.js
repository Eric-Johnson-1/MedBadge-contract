const { task } = require("hardhat/config");

task("check-nft").setAction(async (taskArgs, hre) => {
    const ethers = hre.ethers
    const myNft = await ethers.getContract("MyNft")

    const totalSupply = await myNft.totalSupply()
    console.log(`totalSupply is ${totalSupply}`)
    for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
        const owner = await myNft.ownerOf(tokenId)
        console.log(`tokenId is ${tokenId}, owner is ${owner}`)
    }
})
