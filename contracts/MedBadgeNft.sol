// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
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
    // uint256 private _nextTokenId;
    // string public constant METADATA_URI =
    //     "ipfs://QmXw7TEAJWKjKifvLE25Z9yjvowWk2NWY3WgnZPUto9XoA";

    // Structs
    struct VaccinationRecord {
        string img;
        string documentType;
        bytes32 documentIdHash;
        string vaccineType;
        string vaccinationDose;
        uint256 timestamp;
        uint256 level;
        uint256 nextUpdate;
    }

    // State variables
    mapping(uint256 => VaccinationRecord) private _records;
    uint256 private _tokenIdCounter;
    // address private _registrarAddress;
    uint256 private constant DAILY_COST = 0.0003 ether;
    
    // Events
    event VaccinationRecorded(uint256 indexed tokenId, address indexed recipient);
    event DaysPurchased(uint256 indexed tokenId, uint256 days);
    event LevelUpdated(uint256 indexed tokenId, uint256 newLevel);

    // constructor(
    //     // address initialOwner,
    //     string memory tokenName,
    //     string memory tokenSymbol
    // ) ERC721(tokenName, tokenSymbol) Ownable(msg.sender) {}

    constructor() ERC721("MedBadge", "MBG") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }

    // // Modifiers
    // modifier onlyRegistrar() {
    //     require(msg.sender == _registrarAddress, "Caller is not the registrar");
    //     _;
    // }

    // // Administrative functions
    // function setRegistrar(address registrar) external onlyOwner {
    //     _registrarAddress = registrar;
    // }

    // Main functions
    function issue(
        address recipient,
        string memory img,
        string memory documentType,
        bytes32 documentIdHash,
        string memory vaccineType,
        string memory vaccinationDose
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(recipient, tokenId);

        _records[tokenId] = VaccinationRecord({
            img: img,
            documentType: documentType,
            documentIdHash: documentIdHash,
            vaccineType: vaccineType,
            vaccinationDose: vaccinationDose,
            timestamp: block.timestamp,
            level: 0,
            nextUpdate: 30
        });

        emit VaccinationRecorded(tokenId, recipient);
        return tokenId;
    }

    function buy(uint256 tokenId) external payable {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        
        VaccinationRecord storage record = _records[tokenId];
        uint256 days = msg.value / DAILY_COST;
        require(days > 0 && days <= record.nextUpdate, "Invalid days amount");

        record.nextUpdate -= days;
        emit DaysPurchased(tokenId, days);
    }

    // Chainlink Automation functions
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory) {
        return (true, "");
    }

    function performUpkeep(bytes calldata) external override {
        for (uint256 i = 1; i < _tokenIdCounter; i++) {
            if (_exists(i)) {
                VaccinationRecord storage record = _records[i];
                if (record.nextUpdate > 0) {
                    record.nextUpdate--;
                    if (record.nextUpdate == 0) {
                        record.level++;
                        record.nextUpdate = 30;
                        // Update image URL based on new level
                        record.img = string(abi.encodePacked("ipfs://QmHash/", toString(record.level), ".json"));
                        emit LevelUpdated(i, record.level);
                    }
                }
            }
        }
    }

    // View functions
    function getVaccinationRecord(uint256 tokenId) external view returns (VaccinationRecord memory) {
        require(_exists(tokenId), "Token does not exist");
        return _records[tokenId];
    }

    function calculateDiscount(address user) external view returns (uint256) {
        uint256 totalLevel = 0;
        uint256 nftCount = 0;

        for (uint256 i = 1; i < _tokenIdCounter; i++) {
            if (_exists(i) && ownerOf(i) == user) {
                totalLevel += _records[i].level;
                nftCount++;
            }
        }

        if (nftCount == 0) return 0;
        uint256 averageLevel = totalLevel / nftCount;
        // Calculate discount based on average level and NFT count
        return (averageLevel * 5 + nftCount * 2) min 50; // Maximum 50% discount
    }

    // Override transfer functions to implement SoulBound property
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(from == address(0) || to == address(0), "Token is SoulBound");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // Helper functions
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

    function safeMint(address to) public {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, METADATA_URI);
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
