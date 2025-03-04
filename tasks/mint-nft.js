const { task } = require("hardhat/config");

task("mint-nft").setAction(async (taskArgs, hre) => {
    const ethers = hre.ethers
    const { firstAccount } = await hre.getNamedAccounts()
    const medBadgeNft = await ethers.getContract("MedBadgeNft")

    console.log("minting nft...")
    const safeMintTx = await medBadgeNft.safeMint(firstAccount)
    await safeMintTx.wait()
    const totalSupply = await medBadgeNft.totalSupply()
    const tokenId = totalSupply - 1n
    console.log(`nft minted, tokenId is ${tokenId}`)
})
