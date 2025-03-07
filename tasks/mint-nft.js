const { task } = require("hardhat/config");
const ora = require("ora");

task("mint-nft").setAction(async (taskArgs, hre) => {
    const ethers = hre.ethers;
    const { firstAccount } = await hre.getNamedAccounts();
    const medBadgeNft = await ethers.getContract("MedBadgeNft");

    const spinner = ora("Minting NFT...").start();
    try {
        const safeMintTx = await medBadgeNft.safeMint(firstAccount);
        await safeMintTx.wait();
        const totalSupply = await medBadgeNft.totalSupply();
        const tokenId = totalSupply - 1n;
        spinner.succeed(`NFT minted, tokenId is ${tokenId}`);
    } catch (error) {
        spinner.fail(`Minting failed: ${error.message}`);
    }
});
