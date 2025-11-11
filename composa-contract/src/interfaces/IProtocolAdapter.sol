// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IProtocolAdapter {
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        bytes calldata params
    ) external returns (uint256 amountOut);

    function stake(
        address token,
        uint256 amount,
        bytes calldata params
    ) external returns (uint256);

    function unstake(
        address token,
        uint256 amount,
        bytes calldata params
    ) external returns (uint256);

    function deposit(
        address token,
        uint256 amount,
        bytes calldata params
    ) external returns (uint256);

    function withdraw(
        address token,
        uint256 amount,
        bytes calldata params
    ) external returns (uint256);

    function harvest(
        address token,
        bytes calldata params
    ) external returns (uint256);

    function getOutputAmount(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256);
}

