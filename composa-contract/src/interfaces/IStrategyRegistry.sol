// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStrategyRegistry {
    struct StrategyConfig {
        uint256 tokenId;
        address[] protocols;
        uint8 stepCount;
        uint256 minDeposit;
        uint256 maxDeposit;
        bool isPublic;
    }

    struct Step {
        uint8 actionType; // 0=swap, 1=stake, 2=farm, 3=lend
        address protocol;
        address tokenIn;
        address tokenOut;
        bytes params;
    }

    event StrategyRegistered(uint256 indexed tokenId, address[] protocols);
    event ProtocolAllowed(address indexed protocol);
    event ProtocolRemoved(address indexed protocol);

    function registerStrategy(uint256 tokenId, bytes calldata strategyData) external;
    function validateStrategy(bytes calldata strategyData) external view returns (bool, string memory);
    function addAllowedProtocol(address protocol) external;
    function removeAllowedProtocol(address protocol) external;
    function encodeStrategy(Step[] calldata steps) external pure returns (bytes memory);
    
    function getStrategyConfig(uint256 tokenId) external view returns (StrategyConfig memory);
    function getStrategySteps(uint256 tokenId) external view returns (Step[] memory);
    function getStep(uint256 tokenId, uint8 stepIndex) external view returns (Step memory);
    function isProtocolAllowed(address protocol) external view returns (bool);
    function getStepCount(uint256 tokenId) external view returns (uint8);
    function getStrategyProtocols(uint256 tokenId) external view returns (address[] memory);
}

