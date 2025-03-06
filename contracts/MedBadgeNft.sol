// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract MedBadgeNft is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable,
    AutomationCompatible
{
    struct VaccinationRecord {
        uint256 level;
        uint256 nextUpdate;
        string img;
    }

    mapping(uint256 => VaccinationRecord) private _records;
    uint256 private _tokenIdCounter;
    uint256 private constant DAILY_COST = 0.0003 ether;

    event VaccinationRecorded(
        uint256 indexed tokenId,
        address indexed recipient
    );
    event DaysPurchased(uint256 indexed tokenId, uint256 numDays);
    event LevelUpdated(uint256 indexed tokenId, uint256 newLevel);

    constructor() ERC721("MedBadge", "MBG") Ownable() {
        _tokenIdCounter = 1;
    }

    function issue(
        address recipient,
        string memory metadata_uri
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, metadata_uri);
        _tokenIdCounter++;
        _requireOwned(tokenId);
        emit VaccinationRecorded(tokenId, recipient);
        return tokenId;
    }

    function buy(uint256 tokenId) external payable {
        _requireOwned(tokenId);
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        VaccinationRecord storage record = _records[tokenId];
        uint256 numDays = msg.value / DAILY_COST;
        require(
            numDays > 0 && numDays <= record.nextUpdate,
            "Invalid numDays amount"
        );
        record.nextUpdate -= numDays;
        emit DaysPurchased(tokenId, numDays);
    }

    function checkUpkeep(
        bytes calldata
    ) external pure override returns (bool upkeepNeeded, bytes memory) {
        return (true, "");
    }

    function performUpkeep(bytes calldata) external override {
        for (uint256 i = 1; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) != address(0)) {
                VaccinationRecord storage record = _records[i];
                if (record.nextUpdate > 0) {
                    record.nextUpdate--;
                    if (record.nextUpdate == 0) {
                        record.level++;
                        record.nextUpdate = 30;
                        record.img = string(
                            abi.encodePacked(
                                "ipfs://QmHash/",
                                toString(record.level),
                                ".json"
                            )
                        );
                        emit LevelUpdated(i, record.level);
                    }
                }
            }
        }
    }

    function getVaccinationRecord(
        uint256 tokenId
    ) external view returns (VaccinationRecord memory) {
        _requireOwned(tokenId);
        return _records[tokenId];
    }

    function calculateDiscount(address user) external view returns (uint256) {
        uint256 totalLevel = 0;
        uint256 nftCount = 0;
        for (uint256 i = 1; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) != address(0) && ownerOf(i) == user) {
                totalLevel += _records[i].level;
                nftCount++;
            }
        }
        if (nftCount == 0) return 0;
        uint256 discount = (totalLevel * 5 + nftCount * 2);
        return discount > 50 ? 50 : discount;
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function safeMint(
        address to,
        string memory metadata_uri
    ) external onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadata_uri);
        _tokenIdCounter++;
    }

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
