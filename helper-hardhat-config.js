module.exports = {
    localChains: ['hardhat', 'local'], // 本地网络
    testnetChainsConfig: { // 测试网
        11155111: { // sepolia
            name: "sepolia",
            routerAddr: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
            linkTokenAddr: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
            destChainSelector: "16281711391670634445",
        },
        // 17000: { // holesky // ccip还没在这上面部署
        //     name: "holesky",
        //     routerAddr: "",
        //     linkTokenAddr: "",
        // },
        80002: { // amoy
            name: "amoy",
            routerAddr: "0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2",
            linkTokenAddr: "0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904",
            destChainSelector: "16015286601757825753",
        },
    },
    testnetWaitConfirmations: 2, // 等待几个块，防止etherscan还没收录
}
