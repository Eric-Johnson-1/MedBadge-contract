const { task } = require("hardhat/config");

task("check-nft", "Checks total supply and ownership of MedBadgeNft tokens")
    .setAction(async (taskArgs, hre) => {
        const ethers = hre.ethers;

        const medBadgeNft = await ethers.getContract("MedBadgeNft");

        let totalSupply;
        try {
            totalSupply = await medBadgeNft.totalSupply();
            console.log(`Total supply is ${totalSupply.toString()}`);
        } catch (error) {
            console.error("Error fetching totalSupply:", error);
            return;
        }

        console.log("Fetching token owners...");

        const tokenIds = Array.from({ length: totalSupply }, (_, i) => i);
        try {
            // 并行获取所有 tokenId 的所有者，提高查询效率
            const owners = await Promise.all(tokenIds.map(tokenId => medBadgeNft.ownerOf(tokenId)));
            owners.forEach((owner, tokenId) => {
                console.log(`tokenId: ${tokenId}, owner: ${owner}`);
            });
        } catch (error) {
            console.error("Error fetching token owners:", error);
        }
    });
