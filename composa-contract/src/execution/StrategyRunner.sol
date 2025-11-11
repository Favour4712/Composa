// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IProtocolAdapter.sol";
import "../interfaces/IStrategyRegistry.sol";

contract StrategyRunner is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    mapping(address => IProtocolAdapter) public adapters;

    address public immutable strategyExecutor;
    address public immutable strategyRegistry;

    uint256 public slippageTolerance = 100; // 1% in basis points
    uint256 public gasSafetyMargin = 50000; // Extra gas buffer

    error OnlyExecutor();
    error AdapterNotFound();
    error InsufficientOutput();
    error InvalidStep();
    error ZeroAddress();
    error ZeroAmount();

    modifier onlyExecutor() {
        if (msg.sender != strategyExecutor) revert OnlyExecutor();
        _;
    }

    constructor(
        address _strategyExecutor,
        address _strategyRegistry
    ) Ownable(msg.sender) {
        if (
            _strategyExecutor == address(0) || _strategyRegistry == address(0)
        ) {
            revert ZeroAddress();
        }
        strategyExecutor = _strategyExecutor;
        strategyRegistry = _strategyRegistry;
    }

    /**
     * @notice Runs a complete strategy
     * @param tokenId Strategy token ID
     * @param amount Initial amount
     * @return outputAmount Final output amount
     */
    function runStrategy(
        uint256 tokenId,
        uint256 amount
    ) external nonReentrant onlyExecutor returns (uint256 outputAmount) {
        if (amount == 0) revert ZeroAmount();

        IStrategyRegistry.Step[] memory steps = IStrategyRegistry(
            strategyRegistry
        ).getStrategySteps(tokenId);

        if (steps.length == 0) revert InvalidStep();

        uint256 currentAmount = amount;

        for (uint256 i = 0; i < steps.length; i++) {
            currentAmount = runStep(steps[i], currentAmount);
            if (currentAmount == 0) revert InsufficientOutput();
        }

        return currentAmount;
    }

    /**
     * @notice Executes a single step
     * @param step Step to execute
     * @param amountIn Input amount
     * @return amountOut Output amount
     */
    function runStep(
        IStrategyRegistry.Step memory step,
        uint256 amountIn
    ) public onlyExecutor returns (uint256 amountOut) {
        IProtocolAdapter adapter = adapters[step.protocol];
        if (address(adapter) == address(0)) revert AdapterNotFound();

        // Approve token for adapter
        if (step.tokenIn != address(0)) {
            IERC20(step.tokenIn).safeIncreaseAllowance(
                address(adapter),
                amountIn
            );
        }

        // Execute based on action type
        if (step.actionType == 0) {
            // Swap
            amountOut = adapter.swap(
                step.tokenIn,
                step.tokenOut,
                amountIn,
                step.params
            );
        } else if (step.actionType == 1) {
            // Stake
            amountOut = adapter.stake(step.tokenIn, amountIn, step.params);
        } else if (step.actionType == 2) {
            // Farm (use stake for now)
            amountOut = adapter.stake(step.tokenIn, amountIn, step.params);
        } else if (step.actionType == 3) {
            // Lend/Deposit
            amountOut = adapter.deposit(step.tokenIn, amountIn, step.params);
        } else {
            revert InvalidStep();
        }

        // Verify minimum output with slippage
        uint256 expectedOutput = adapter.getOutputAmount(
            step.tokenIn,
            step.tokenOut,
            amountIn
        );
        uint256 minOutput = (expectedOutput * (10000 - slippageTolerance)) /
            10000;

        if (amountOut < minOutput) revert InsufficientOutput();

        return amountOut;
    }

    /**
     * @notice Estimates output for a strategy
     * @param tokenId Strategy token ID
     * @param amountIn Input amount
     * @return estimatedOutput Estimated final output
     */
    function estimateOutput(
        uint256 tokenId,
        uint256 amountIn
    ) external view returns (uint256 estimatedOutput) {
        IStrategyRegistry.Step[] memory steps = IStrategyRegistry(
            strategyRegistry
        ).getStrategySteps(tokenId);

        uint256 currentAmount = amountIn;

        for (uint256 i = 0; i < steps.length; i++) {
            IProtocolAdapter adapter = adapters[steps[i].protocol];
            if (address(adapter) == address(0)) return 0;

            currentAmount = adapter.getOutputAmount(
                steps[i].tokenIn,
                steps[i].tokenOut,
                currentAmount
            );
        }

        return currentAmount;
    }

    /**
     * @notice Simulates strategy execution
     * @param tokenId Strategy token ID
     * @param amount Input amount
     * @return success Whether simulation succeeded
     * @return outputAmount Simulated output
     */
    function simulateStrategy(
        uint256 tokenId,
        uint256 amount
    ) external view returns (bool success, uint256 outputAmount) {
        try this.estimateOutput(tokenId, amount) returns (uint256 output) {
            return (true, output);
        } catch {
            return (false, 0);
        }
    }

    /**
     * @notice Registers a protocol adapter
     * @param protocol Protocol address
     * @param adapter Adapter contract address
     */
    function registerAdapter(
        address protocol,
        address adapter
    ) external onlyOwner {
        if (protocol == address(0) || adapter == address(0))
            revert ZeroAddress();
        adapters[protocol] = IProtocolAdapter(adapter);
    }

    /**
     * @notice Sets slippage tolerance
     * @param tolerance New tolerance in basis points
     */
    function setSlippageTolerance(uint256 tolerance) external onlyOwner {
        require(tolerance <= 1000, "Max 10% slippage"); // Max 10%
        slippageTolerance = tolerance;
    }

    /**
     * @notice Sets gas safety margin
     * @param margin New gas margin
     */
    function setGasSafetyMargin(uint256 margin) external onlyOwner {
        gasSafetyMargin = margin;
    }

    // View functions

    function getAdapter(address protocol) external view returns (address) {
        return address(adapters[protocol]);
    }

    function getSlippageTolerance() external view returns (uint256) {
        return slippageTolerance;
    }

    function estimateGas(
        uint256 tokenId,
        uint256 amount
    ) external view returns (uint256) {
        IStrategyRegistry.Step[] memory steps = IStrategyRegistry(
            strategyRegistry
        ).getStrategySteps(tokenId);

        // Rough estimate: 100k gas per step + safety margin
        return (steps.length * 100000) + gasSafetyMargin;
    }

    /**
     * @notice Emergency withdraw tokens
     * @param token Token address
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
