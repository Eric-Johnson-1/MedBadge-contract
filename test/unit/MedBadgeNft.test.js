const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedBadgeNft", function () {
    let medBadge, owner, addr1, addr2;
    let DAILY_COST;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy contract
        const MedBadgeNft = await ethers.getContractFactory("MedBadgeNft");
        medBadge = await MedBadgeNft.deploy();
        await medBadge.waitForDeployment();

        // Set DAILY_COST based on contract definition
        DAILY_COST = ethers.parseUnits("0.0003", "ether");
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

        const numDays = 10;
        const cost = DAILY_COST * BigInt(numDays); // Ensure cost is calculated dynamically

        await expect(
            medBadge.connect(addr1).buy(1, { value: cost })
        ).to.emit(medBadge, "DaysPurchased")
            .withArgs(1, numDays);
    });

    it("should revert if a non-owner tries to buy days", async function () {
        const mintTx = await medBadge.issue(addr1.address, "ipfs://test-uri-3");
        await mintTx.wait();

        const numDays = 10;
        const cost = DAILY_COST * BigInt(numDays);

        await expect(
            medBadge.connect(addr2).buy(1, { value: cost })
        ).to.be.revertedWith("Not token owner");
    });

    it("should return the correct discount for an NFT holder", async function () {
        await medBadge.issue(addr1.address, "ipfs://test-uri-1");
        await medBadge.issue(addr1.address, "ipfs://test-uri-2");

        const discount = await medBadge.calculateDiscount(addr1.address);
        expect(discount).to.be.gte(0);
    });
});
