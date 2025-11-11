// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../ProtocolAdapter.sol";

// Compound V3 Comet Interface (simplified)
interface IComet {
    function supply(address asset, uint256 amount) external;
    function withdraw(address asset, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function allow(address manager, bool isAllowed) external;
}

/**
 * @title CompoundAdapter
 * @notice Adapter for Compound V3 on Base Sepolia
 */
contract CompoundAdapter is ProtocolAdapter {
    using SafeERC20 for IERC20;

    address public compoundComet;

    error SupplyFailed();
    error WithdrawFailed();

    constructor(
        address _strategyRunner,
        address _compoundComet
    ) ProtocolAdapter(_strategyRunner) {
        if (_compoundComet == address(0)) revert ZeroAddress();
        compoundComet = _compoundComet;
    }

    /**
     * @notice Not implemented for Compound
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        bytes calldata params
    ) external pure override returns (uint256 amountOut) {
        revert NotImplemented();
    }

    /**
     * @notice Not implemented for Compound
     */
    function stake(
        address token,
        uint256 amount,
        bytes calldata params
    ) external pure override returns (uint256) {
        revert NotImplemented();
    }

    /**
     * @notice Not implemented for Compound
     */
    function unstake(
        address token,
        uint256 amount,
        bytes calldata params
    ) external pure override returns (uint256) {
        revert NotImplemented();
    }

    /**
     * @notice Supplies tokens to Compound
     * @param token Token to supply
     * @param amount Amount to supply
     * @param params Optional parameters
     * @return Amount supplied
     */
    function deposit(
        address token,
        uint256 amount,
        bytes calldata params
    ) external override onlyRunner returns (uint256) {
        _validateAmount(amount);
        if (token == address(0)) revert InvalidToken();

        // Transfer tokens from runner
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Approve Comet
        IERC20(token).safeIncreaseAllowance(compoundComet, amount);

        // Get balance before
        uint256 balanceBefore = IComet(compoundComet).balanceOf(address(this));

        // Supply to Compound
        IComet(compoundComet).supply(token, amount);

        // Get balance after
        uint256 balanceAfter = IComet(compoundComet).balanceOf(address(this));

        uint256 supplied = balanceAfter - balanceBefore;
        if (supplied == 0) revert SupplyFailed();

        return supplied;
    }

    /**
     * @notice Withdraws tokens from Compound
     * @param token Token to withdraw
     * @param amount Amount to withdraw
     * @param params Optional parameters
     * @return actualAmount Amount withdrawn
     */
    function withdraw(
        address token,
        uint256 amount,
        bytes calldata params
    ) external override onlyRunner returns (uint256 actualAmount) {
        if (token == address(0)) revert InvalidToken();

        uint256 balanceBefore = IERC20(token).balanceOf(address(this));

        // Withdraw from Compound
        IComet(compoundComet).withdraw(token, amount);

        uint256 balanceAfter = IERC20(token).balanceOf(address(this));
        actualAmount = balanceAfter - balanceBefore;

        if (actualAmount == 0) revert WithdrawFailed();

        // Transfer to runner
        IERC20(token).safeTransfer(msg.sender, actualAmount);

        return actualAmount;
    }

    /**
     * @notice Harvests COMP rewards (if available)
     * @param token Token address
     * @param params Harvest parameters
     * @return Amount harvested
     */
    function harvest(
        address token,
        bytes calldata params
    ) external pure override returns (uint256) {
        // COMP rewards claiming would go here
        // For now, not implemented
        revert NotImplemented();
    }

    /**
     * @notice Gets estimated output amount
     * @param tokenIn Input token
     * @param tokenOut Output token
     * @param amountIn Input amount
     * @return Expected output amount
     */
    function getOutputAmount(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external pure override returns (uint256) {
        // For deposits/withdrawals, roughly 1:1
        return amountIn;
    }

    /**
     * @notice Gets user's balance in Compound
     * @param user User address
     * @return Balance
     */
    function getUserBalance(address user) external view returns (uint256) {
        return IComet(compoundComet).balanceOf(user);
    }

    /**
     * @notice Updates Compound Comet address
     * @param _comet New comet address
     */
    function setComet(address _comet) external onlyOwner {
        if (_comet == address(0)) revert ZeroAddress();
        compoundComet = _comet;
    }
}

