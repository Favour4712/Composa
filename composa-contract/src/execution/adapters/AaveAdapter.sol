// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../ProtocolAdapter.sol";

// Aave V3 Pool Interface (simplified)
interface IPool {
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);

    function getReserveData(address asset) external view returns (ReserveData memory);
}

struct ReserveData {
    uint256 configuration;
    uint128 liquidityIndex;
    uint128 currentLiquidityRate;
    uint128 variableBorrowIndex;
    uint128 currentVariableBorrowRate;
    uint128 currentStableBorrowRate;
    uint40 lastUpdateTimestamp;
    uint16 id;
    address aTokenAddress;
    address stableDebtTokenAddress;
    address variableDebtTokenAddress;
    address interestRateStrategyAddress;
    uint128 accruedToTreasury;
    uint128 unbacked;
    uint128 isolationModeTotalDebt;
}

/**
 * @title AaveAdapter
 * @notice Adapter for Aave V3 lending protocol on Base Sepolia
 */
contract AaveAdapter is ProtocolAdapter {
    using SafeERC20 for IERC20;

    address public aavePool;

    error DepositFailed();
    error WithdrawFailed();

    constructor(
        address _strategyRunner,
        address _aavePool
    ) ProtocolAdapter(_strategyRunner) {
        if (_aavePool == address(0)) revert ZeroAddress();
        aavePool = _aavePool;
    }

    /**
     * @notice Not implemented for Aave
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
     * @notice Not implemented for Aave
     */
    function stake(
        address token,
        uint256 amount,
        bytes calldata params
    ) external pure override returns (uint256) {
        revert NotImplemented();
    }

    /**
     * @notice Not implemented for Aave
     */
    function unstake(
        address token,
        uint256 amount,
        bytes calldata params
    ) external pure override returns (uint256) {
        revert NotImplemented();
    }

    /**
     * @notice Deposits (supplies) tokens to Aave
     * @param token Token to deposit
     * @param amount Amount to deposit
     * @param params Optional parameters (referral code)
     * @return Amount deposited
     */
    function deposit(
        address token,
        uint256 amount,
        bytes calldata params
    ) external override onlyRunner returns (uint256) {
        _validateAmount(amount);
        if (token == address(0)) revert InvalidToken();

        uint16 referralCode = params.length > 0 ? abi.decode(params, (uint16)) : 0;

        // Transfer tokens from runner
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Approve pool
        IERC20(token).safeIncreaseAllowance(aavePool, amount);

        // Supply to Aave
        IPool(aavePool).supply(token, amount, msg.sender, referralCode);

        return amount;
    }

    /**
     * @notice Withdraws tokens from Aave
     * @param token Token to withdraw
     * @param amount Amount to withdraw (use type(uint256).max for all)
     * @param params Optional parameters
     * @return actualAmount Amount withdrawn
     */
    function withdraw(
        address token,
        uint256 amount,
        bytes calldata params
    ) external override onlyRunner returns (uint256 actualAmount) {
        if (token == address(0)) revert InvalidToken();

        // Withdraw from Aave to runner
        actualAmount = IPool(aavePool).withdraw(token, amount, msg.sender);

        if (actualAmount == 0) revert WithdrawFailed();

        return actualAmount;
    }

    /**
     * @notice Harvests rewards (placeholder for incentives)
     * @param token Token address
     * @param params Harvest parameters
     * @return Amount harvested
     */
    function harvest(
        address token,
        bytes calldata params
    ) external pure override returns (uint256) {
        // Aave incentives would be claimed here
        // For now, not implemented
        revert NotImplemented();
    }

    /**
     * @notice Gets estimated output amount (1:1 for deposits/withdrawals)
     * @param tokenIn Input token
     * @param tokenOut Output token (aToken)
     * @param amountIn Input amount
     * @return Expected output amount
     */
    function getOutputAmount(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external pure override returns (uint256) {
        // For deposits/withdrawals, it's roughly 1:1
        return amountIn;
    }

    /**
     * @notice Gets aToken address for an asset
     * @param asset Underlying asset
     * @return aToken address
     */
    function getAToken(address asset) external view returns (address) {
        ReserveData memory data = IPool(aavePool).getReserveData(asset);
        return data.aTokenAddress;
    }

    /**
     * @notice Updates Aave pool address
     * @param _aavePool New pool address
     */
    function setAavePool(address _aavePool) external onlyOwner {
        if (_aavePool == address(0)) revert ZeroAddress();
        aavePool = _aavePool;
    }
}

