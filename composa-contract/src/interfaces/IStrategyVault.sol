// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStrategyVault {
    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, uint256 shares, uint256 amount);
    event StrategyExecuted(uint256 timestamp, uint256 outputAmount);
    event Compounded(uint256 amount);
    event VaultPaused(address account);
    event VaultUnpaused(address account);

    function deposit(uint256 amount) external returns (uint256 shares);

    function withdraw(uint256 shares) external returns (uint256 amount);

    function executeStrategy() external returns (uint256);

    function compound() external;

    function pause() external;

    function unpause() external;

    function balanceOf(address user) external view returns (uint256);

    function sharesOf(address user) external view returns (uint256);

    function totalValue() external view returns (uint256);

    function sharePrice() external view returns (uint256);

    function getUserValue(address user) external view returns (uint256);

    function isPaused() external view returns (bool);

    function getDepositToken() external view returns (address);

    function getStrategyTokenId() external view returns (uint256);
}
