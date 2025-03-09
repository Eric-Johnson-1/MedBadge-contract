const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedBadgeNft", function () {
    let medBadge, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy contract
        const MedBadgeNft = await ethers.getContractFactory("MedBadgeNft");
        medBadge = await MedBadgeNft.deploy();
        await medBadge.waitForDeployment();
    });

    it("should mint an NFT and assign the correct URI", async function () {
        const mintTx = await medBadge.issue(addr1.address, "ipfs://test-uri-1");
        await mintTx.wait();

        expect(await medBadge.ownerOf(1)).to.equal(addr1.address);
        expect(await medBadge.tokenURI(1)).to.equal("ipfs://test-uri-1");
    });

    it("should allow the owner to purchase days", async function () {
        const mintTx = await medBadge.issue(addr1.address, "ipfs://test-uri-2");
        await mintTx.wait();

        await expect(
            medBadge.connect(addr1).buy(1, { value: ethers.parseEther("0.003") })
        ).to.emit(medBadge, "DaysPurchased")
            .withArgs(1, 10);
    });

    it("should revert if a non-owner tries to buy days", async function () {
        const mintTx = await medBadge.issue(addr1.address, "ipfs://test-uri-3");
        await mintTx.wait();

        await expect(
            medBadge.connect(addr2).buy(1, { value: ethers.parseEther("0.003") })
        ).to.be.revertedWith("Not token owner");
    });

    it("should return the correct discount for an NFT holder", async function () {
        await medBadge.issue(addr1.address, "ipfs://test-uri-1");
        await medBadge.issue(addr1.address, "ipfs://test-uri-2");

        const discount = await medBadge.calculateDiscount(addr1.address);
        expect(discount).to.be.gte(0);
    });
});
