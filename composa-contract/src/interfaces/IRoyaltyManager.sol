// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRoyaltyManager {
    struct RoyaltyInfo {
        address recipient;
        uint256 royaltyBps;
    }

    event RoyaltySet(uint256 indexed tokenId, address indexed recipient, uint256 royaltyBps);
    event RoyaltyDistributed(uint256 indexed tokenId, address indexed recipient, uint256 amount);

    function setRoyalty(uint256 tokenId, address recipient, uint256 bps) external;
    function calculateRoyalty(uint256 tokenId, uint256 salePrice) external view returns (uint256);
    function distributeRoyalty(uint256 tokenId, uint256 salePrice) external payable returns (uint256);
    
    function getRoyaltyInfo(uint256 tokenId) external view returns (RoyaltyInfo memory);
    function getRoyaltyAmount(uint256 tokenId, uint256 price) external view returns (uint256);
    function getDefaultRoyalty() external view returns (uint256);
    function getMaxRoyalty() external view returns (uint256);
}

