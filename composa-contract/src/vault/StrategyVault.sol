// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../interfaces/IStrategyVault.sol";
import "../interfaces/IStrategyExecutor.sol";
import "../interfaces/IStrategyNFT.sol";
import "../libraries/PerformanceCalculator.sol";

contract StrategyVault is
    IStrategyVault,
    Ownable2Step,
    ReentrancyGuard,
    Pausable
{
    using SafeERC20 for IERC20;
    using PerformanceCalculator for uint256;

    uint256 public immutable strategyTokenId;
    address public immutable depositToken;
    address public immutable strategyExecutor;
    address public immutable strategyNFT;

    mapping(address => uint256) private userDeposits;
    mapping(address => uint256) private shares;

    uint256 private totalShares;
    uint256 private totalAssets;

    uint256 public lastExecutionTime;
    uint256 public totalReturns;

    error InsufficientBalance();
    error InsufficientShares();
    error ZeroAmount();
    error ZeroAddress();
    error ExecutionFailed();

    modifier onlyStrategyOwner() {
        require(
            IStrategyNFT(strategyNFT).ownerOf(strategyTokenId) == msg.sender,
            "Not strategy owner"
        );
        _;
    }

    constructor(
        uint256 _strategyTokenId,
        address _depositToken,
        address _strategyExecutor,
        address _strategyNFT,
        address _owner
    ) Ownable(_owner) {
        if (
            _depositToken == address(0) ||
            _strategyExecutor == address(0) ||
            _strategyNFT == address(0)
        ) {
            revert ZeroAddress();
        }

        strategyTokenId = _strategyTokenId;
        depositToken = _depositToken;
        strategyExecutor = _strategyExecutor;
        strategyNFT = _strategyNFT;
    }

    /**
     * @notice Deposits tokens into the vault
     * @param amount Amount to deposit
     * @return sharesIssued Number of shares issued
     */
    function deposit(
        uint256 amount
    ) external nonReentrant whenNotPaused returns (uint256 sharesIssued) {
        if (amount == 0) revert ZeroAmount();

        // Transfer tokens from user
        IERC20(depositToken).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );

        // Calculate shares to issue
        sharesIssued = PerformanceCalculator.calculateShares(
            amount,
            totalAssets,
            totalShares
        );

        // Update state
        userDeposits[msg.sender] += amount;
        shares[msg.sender] += sharesIssued;
        totalShares += sharesIssued;
        totalAssets += amount;

        emit Deposit(msg.sender, amount, sharesIssued);

        return sharesIssued;
    }

    /**
     * @notice Withdraws tokens from the vault
     * @param sharesToRedeem Number of shares to redeem
     * @return amount Amount of tokens withdrawn
     */
    function withdraw(
        uint256 sharesToRedeem
    ) external nonReentrant returns (uint256 amount) {
        if (sharesToRedeem == 0) revert ZeroAmount();
        if (shares[msg.sender] < sharesToRedeem) revert InsufficientShares();

        // Calculate amount to withdraw
        amount = PerformanceCalculator.calculateAssets(
            sharesToRedeem,
            totalAssets,
            totalShares
        );

        if (IERC20(depositToken).balanceOf(address(this)) < amount) {
            revert InsufficientBalance();
        }

        // Update state
        shares[msg.sender] -= sharesToRedeem;
        totalShares -= sharesToRedeem;
        totalAssets -= amount;

        // Transfer tokens to user
        IERC20(depositToken).safeTransfer(msg.sender, amount);

        emit Withdraw(msg.sender, sharesToRedeem, amount);

        return amount;
    }

    /**
     * @notice Executes the strategy
     * @return outputAmount Amount received from execution
     */
    function executeStrategy()
        external
        nonReentrant
        whenNotPaused
        onlyStrategyOwner
        returns (uint256 outputAmount)
    {
        uint256 balance = IERC20(depositToken).balanceOf(address(this));
        if (balance == 0) revert ZeroAmount();

        // Approve executor
        IERC20(depositToken).safeIncreaseAllowance(strategyExecutor, balance);

        // Execute strategy
        try
            IStrategyExecutor(strategyExecutor).executeStrategy(
                strategyTokenId,
                balance,
                address(this)
            )
        returns (uint256 output) {
            outputAmount = output;

            // Update returns
            if (output > balance) {
                totalReturns += (output - balance);
            }

            // Update total assets
            totalAssets = IERC20(depositToken).balanceOf(address(this));
            lastExecutionTime = block.timestamp;

            emit StrategyExecuted(block.timestamp, outputAmount);
        } catch {
            revert ExecutionFailed();
        }

        return outputAmount;
    }

    /**
     * @notice Compounds profits back into the vault
     */
    function compound() external nonReentrant whenNotPaused onlyStrategyOwner {
        uint256 currentBalance = IERC20(depositToken).balanceOf(address(this));

        if (currentBalance > totalAssets) {
            uint256 profit = currentBalance - totalAssets;
            totalAssets = currentBalance;

            emit Compounded(profit);
        }
    }

    /**
     * @notice Pauses the vault
     */
    function pause() external onlyOwner {
        _pause();
        emit VaultPaused(msg.sender);
    }

    /**
     * @notice Unpauses the vault
     */
    function unpause() external onlyOwner {
        _unpause();
        emit VaultUnpaused(msg.sender);
    }

    // View functions

    function balanceOf(address user) external view returns (uint256) {
        return userDeposits[user];
    }

    function sharesOf(address user) external view returns (uint256) {
        return shares[user];
    }

    function totalValue() external view returns (uint256) {
        return totalAssets;
    }

    function sharePrice() external view returns (uint256) {
        return
            PerformanceCalculator.calculateSharePrice(totalAssets, totalShares);
    }

    function getUserValue(address user) external view returns (uint256) {
        if (totalShares == 0) return 0;
        return
            PerformanceCalculator.calculateAssets(
                shares[user],
                totalAssets,
                totalShares
            );
    }

    function isPaused() external view returns (bool) {
        return paused();
    }

    function getDepositToken() external view returns (address) {
        return depositToken;
    }

    function getStrategyTokenId() external view returns (uint256) {
        return strategyTokenId;
    }

    /**
     * @notice Gets vault performance metrics
     * @return apy Annual percentage yield
     * @return vaultTotalValue Total assets under management
     * @return totalSharesIssued Total shares issued
     */
    function getPerformanceMetrics()
        external
        view
        returns (
            uint256 apy,
            uint256 vaultTotalValue,
            uint256 totalSharesIssued
        )
    {
        if (lastExecutionTime > 0 && totalAssets > 0) {
            uint256 duration = block.timestamp - lastExecutionTime;
            if (duration > 0) {
                apy = PerformanceCalculator.calculateAPY(
                    totalAssets,
                    totalReturns,
                    duration
                );
            }
        }

        return (apy, totalAssets, totalShares);
    }

    /**
     * @notice Emergency withdraw function (only owner)
     * @param token Token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }

    receive() external payable {}
}
