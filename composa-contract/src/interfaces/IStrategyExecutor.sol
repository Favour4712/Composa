// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStrategyExecutor {
    event StrategyExecuted(uint256 indexed tokenId, address indexed depositor, uint256 amount, uint256 outputAmount);
    event EmergencyStop(uint256 indexed tokenId);
    event KeeperAdded(address indexed keeper);
    event KeeperRemoved(address indexed keeper);
    event CooldownUpdated(uint256 newCooldown);

    function executeStrategy(uint256 tokenId, uint256 amount, address depositor) external returns (uint256);
    function emergencyStop(uint256 tokenId) external;
    function addKeeper(address keeper) external;
    function removeKeeper(address keeper) external;
    function setExecutionCooldown(uint256 cooldown) external;
    
    function canExecute(uint256 tokenId) external view returns (bool);
    function isKeeper(address addr) external view returns (bool);
    function getLastExecutionTime(uint256 tokenId) external view returns (uint256);
    function getExecutionCooldown() external view returns (uint256);
    function isExecuting(uint256 tokenId) external view returns (bool);
}

