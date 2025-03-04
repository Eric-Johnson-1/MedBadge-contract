const { getNamedAccounts, deployments, ethers } = require("hardhat")
const { expect } = require("chai")

let firstAccount
let chainSelector
// let linkToken_
let ccipLocalSimulator
let myNft
let wrappedNft
let nftPoolLockAndRelease
let nftPoolBurnAndMint
before(async () => {
    await deployments.fixture("all")
    firstAccount = (await getNamedAccounts()).firstAccount
    myNft = await ethers.getContract("MyNft")
    ccipLocalSimulator = await ethers.getContract("CCIPLocalSimulator")
    wrappedNft = await ethers.getContract("WrappedNft")
    nftPoolLockAndRelease = await ethers.getContract("NftPoolLockAndRelease")
    nftPoolBurnAndMint = await ethers.getContract("NftPoolBurnAndMint")
    const ccipConfig = await ccipLocalSimulator.configuration()
    chainSelector = ccipConfig.chainSelector_
    // linkToken_ = ccipConfig.linkToken_
})

describe("test if the nft can be minted successfully", async () => {
    it("test if the owner of nft is minter", async () => {
        await myNft.safeMint(firstAccount)
        // const ownerOfFirstNft = await myNft.ownerOf(0)
        expect(await myNft.ownerOf(0)).to.equal(firstAccount)
    })
})

describe("test if the nft can be locked and transferred to destchain", async () => {
    it("transfer NFT from source chain to dest chain, check if the nft is locked", async () => {
        // const faucetTx = await ccipLocalSimulator.requestLinkFromFaucet(nftPoolLockAndRelease.target, ethers.parseEther("100"));
        // await faucetTx.wait();
        // const linkToken = await ethers.getContractAt("IERC20", linkToken_);
        // const balance = await linkToken.balanceOf(nftPoolLockAndRelease.target);
        // console.log("NFT Pool Lock and Release LINK Balance:", balance.toString());

        await ccipLocalSimulator.requestLinkFromFaucet(nftPoolLockAndRelease.target, ethers.parseEther("10"))
        await myNft.approve(nftPoolLockAndRelease.target, 0)

        await nftPoolLockAndRelease.lockAndSendNft(0, firstAccount, chainSelector, nftPoolBurnAndMint.target)
        expect(await myNft.ownerOf(0)).to.equal(nftPoolLockAndRelease.target)
    })

    it("check if wnft's account is owner", async () => {
        expect(await wrappedNft.ownerOf(0)).to.equal(firstAccount)
    })
})

describe("test if the nft can be burned and transferred back to sourcechain", async () => {
    it("wnft can be burned", async () => {
        await ccipLocalSimulator.requestLinkFromFaucet(nftPoolBurnAndMint.target, ethers.parseEther("10"))
        await wrappedNft.approve(nftPoolBurnAndMint.target, 0)

        await nftPoolBurnAndMint.burnAndSendNft(0, firstAccount, chainSelector, nftPoolLockAndRelease.target)
        expect(await wrappedNft.totalSupply()).to.equal(0)
    })

    it("owner of the NFT is transferred to firstAccount", async () => {
        expect(await myNft.ownerOf(0)).to.equal(firstAccount)
    })
})
