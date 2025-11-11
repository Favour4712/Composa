// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IStrategyExecutor.sol";
import "../interfaces/IStrategyNFT.sol";
import "../interfaces/IStrategyRegistry.sol";

contract StrategyExecutor is IStrategyExecutor, Ownable2Step, ReentrancyGuard {
    mapping(uint256 => bool) private activeExecutions;
    mapping(uint256 => uint256) private lastExecutionTime;
    mapping(address => bool) private authorizedKeepers;

    address public immutable strategyNFT;
    address public immutable strategyRegistry;
    address public strategyRunner;

    uint256 public executionCooldown = 1 hours;

    error NotAuthorized();
    error ExecutionInProgress();
    error CooldownNotElapsed();
    error StrategyNotActive();
    error ZeroAddress();
    error ZeroAmount();

    modifier onlyAuthorized() {
        if (!authorizedKeepers[msg.sender] && msg.sender != owner()) {
            revert NotAuthorized();
        }
        _;
    }

    constructor(
        address _strategyNFT,
        address _strategyRegistry
    ) Ownable(msg.sender) {
        if (_strategyNFT == address(0) || _strategyRegistry == address(0)) {
            revert ZeroAddress();
        }
        strategyNFT = _strategyNFT;
        strategyRegistry = _strategyRegistry;
        authorizedKeepers[msg.sender] = true;
    }

    /**
     * @notice Executes a strategy
     * @param tokenId Strategy NFT token ID
     * @param amount Amount to execute with
     * @param depositor Address of the depositor
     * @return outputAmount Amount received from execution
     */
    function executeStrategy(
        uint256 tokenId,
        uint256 amount,
        address depositor
    ) external nonReentrant onlyAuthorized returns (uint256 outputAmount) {
        if (amount == 0) revert ZeroAmount();
        if (!canExecute(tokenId)) revert CooldownNotElapsed();
        if (activeExecutions[tokenId]) revert ExecutionInProgress();

        // Verify strategy is active
        if (!IStrategyNFT(strategyNFT).isStrategyActive(tokenId)) {
            revert StrategyNotActive();
        }

        // Mark as executing
        activeExecutions[tokenId] = true;

        // Call strategy runner to execute
        if (strategyRunner != address(0)) {
            // In production, this would call the runner contract
            // For now, we just mark execution time
            outputAmount = amount; // Placeholder
        }

        // Update execution time
        lastExecutionTime[tokenId] = block.timestamp;

        // Clear execution flag
        activeExecutions[tokenId] = false;

        emit StrategyExecuted(tokenId, depositor, amount, outputAmount);

        return outputAmount;
    }

    /**
     * @notice Emergency stops a strategy execution
     * @param tokenId Strategy token ID
     */
    function emergencyStop(uint256 tokenId) external onlyOwner {
        activeExecutions[tokenId] = false;
        emit EmergencyStop(tokenId);
    }

    /**
     * @notice Adds a keeper to the authorized list
     * @param keeper Keeper address
     */
    function addKeeper(address keeper) external onlyOwner {
        if (keeper == address(0)) revert ZeroAddress();
        authorizedKeepers[keeper] = true;
        emit KeeperAdded(keeper);
    }

    /**
     * @notice Removes a keeper from the authorized list
     * @param keeper Keeper address
     */
    function removeKeeper(address keeper) external onlyOwner {
        authorizedKeepers[keeper] = false;
        emit KeeperRemoved(keeper);
    }

    /**
     * @notice Sets the execution cooldown period
     * @param cooldown New cooldown in seconds
     */
    function setExecutionCooldown(uint256 cooldown) external onlyOwner {
        executionCooldown = cooldown;
        emit CooldownUpdated(cooldown);
    }

    /**
     * @notice Sets the strategy runner contract
     * @param _strategyRunner Strategy runner address
     */
    function setStrategyRunner(address _strategyRunner) external onlyOwner {
        if (_strategyRunner == address(0)) revert ZeroAddress();
        strategyRunner = _strategyRunner;
    }

    // View functions

    function canExecute(uint256 tokenId) public view returns (bool) {
        if (activeExecutions[tokenId]) return false;
        if (lastExecutionTime[tokenId] == 0) return true;
        return
            block.timestamp >= lastExecutionTime[tokenId] + executionCooldown;
    }

    function isKeeper(address addr) external view returns (bool) {
        return authorizedKeepers[addr];
    }

    function getLastExecutionTime(
        uint256 tokenId
    ) external view returns (uint256) {
        return lastExecutionTime[tokenId];
    }

    function getExecutionCooldown() external view returns (uint256) {
        return executionCooldown;
    }

    function isExecuting(uint256 tokenId) external view returns (bool) {
        return activeExecutions[tokenId];
    }
}
