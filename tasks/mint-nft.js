const { task } = require("hardhat/config");

task("mint-nft").setAction(async (taskArgs, hre) => {
    const ethers = hre.ethers
    const { firstAccount } = await hre.getNamedAccounts()
    const myNft = await ethers.getContract("MyNft")

    console.log("minting nft...")
    const safeMintTx = await myNft.safeMint(firstAccount)
    await safeMintTx.wait()
    const totalSupply = await myNft.totalSupply()
    const tokenId = totalSupply - 1n
    console.log(`nft minted, tokenId is ${tokenId}`)
})
