// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "./MyNft.sol";

contract WrappedNft is MyNft {
    constructor(
        // address initialOwner,
        string memory tokenName,
        string memory tokenSymbol
    ) MyNft(tokenName, tokenSymbol) {}

    function mintWithSpecificTokenId(
        address to,
        uint256 tokenId
    ) public {
        _safeMint(to, tokenId);
    }
}
