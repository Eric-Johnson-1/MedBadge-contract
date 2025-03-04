// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MedBadgeNFT1 is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable
{
    // string constant public METADATA_URI = "ipfs://QmXw7TEAJWKjKifvLE25Z9yjvowWk2NWY3WgnZPUto9XoA";
    uint256 private _nextTokenId;

    constructor(
        string memory tokenName,
        string memory tokenSymbol
    ) ERC721(tokenName, tokenSymbol) Ownable(msg.sender) {}

    function issue(address to, string memory metadata_URI) public {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadata_URI);
    }

    /**
     * @notice Returns an array of token IDs and their corresponding URIs owned by the caller
     * @return tokenIds Array of token IDs owned by the caller
     * @return tokenUris Array of metadata URIs for the tokens
     */
    function getMyNFTs()
        external
        view
        returns (uint256[] memory tokenIds, string[] memory tokenUris)
    {
        uint256 balance = balanceOf(msg.sender);
        tokenIds = new uint256[](balance);
        tokenUris = new string[](balance);

        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(msg.sender, i);
            tokenIds[i] = tokenId;
            tokenUris[i] = tokenURI(tokenId);
        }

        return (tokenIds, tokenUris);
    }

    // The following functions are overrides required by Solidity.

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
