// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IStrategyNFT is IERC721 {
    struct Strategy {
        bytes32 strategyHash;
        address creator;
        uint256 createdAt;
        uint256 forkCount;
        uint256 parentTokenId;
        bool isActive;
        uint256 totalValueLocked;
        uint256 performanceScore;
    }

    event StrategyMinted(uint256 indexed tokenId, address indexed creator, bytes32 strategyHash);
    event StrategyForked(uint256 indexed newTokenId, uint256 indexed parentTokenId, address indexed creator);
    event StrategyDeactivated(uint256 indexed tokenId);
    event StrategyMetadataUpdated(uint256 indexed tokenId, uint256 tvl, uint256 performanceScore);

    function mintStrategy(bytes32 hash, bytes calldata strategyData) external returns (uint256);
    function forkStrategy(uint256 parentId, bytes calldata newData) external returns (uint256);
    function deactivateStrategy(uint256 tokenId) external;
    function updateMetadata(uint256 tokenId, uint256 tvl, uint256 score) external;
    
    function getStrategy(uint256 tokenId) external view returns (Strategy memory);
    function getStrategyCreator(uint256 tokenId) external view returns (address);
    function isStrategyActive(uint256 tokenId) external view returns (bool);
    function getStrategyForkCount(uint256 tokenId) external view returns (uint256);
    function getParentStrategy(uint256 tokenId) external view returns (uint256);
    function totalStrategies() external view returns (uint256);
}

