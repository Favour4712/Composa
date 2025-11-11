// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IStrategyRegistry.sol";

library StrategyValidator {
    uint8 constant MAX_STEPS = 20;
    uint8 constant MAX_RISK_SCORE = 100;
    
    error TooManySteps();
    error InvalidTokenFlow();
    error ProtocolNotWhitelisted();
    error InvalidActionType();
    error ZeroAddress();

    /**
     * @notice Validates a complete strategy
     * @param steps Array of strategy steps
     * @param allowedProtocols Mapping of whitelisted protocols
     * @return valid True if strategy is valid
     * @return reason Error message if invalid
     */
    function validateStrategy(
        IStrategyRegistry.Step[] memory steps,
        mapping(address => bool) storage allowedProtocols
    ) internal view returns (bool valid, string memory reason) {
        // Check step count
        if (steps.length == 0) {
            return (false, "No steps provided");
        }
        if (steps.length > MAX_STEPS) {
            return (false, "Too many steps");
        }

        // Validate each step
        for (uint256 i = 0; i < steps.length; i++) {
            IStrategyRegistry.Step memory step = steps[i];
            
            // Check action type
            if (step.actionType > 3) {
                return (false, "Invalid action type");
            }
            
            // Check protocol whitelist
            if (!allowedProtocols[step.protocol]) {
                return (false, "Protocol not whitelisted");
            }
            
            // Check addresses
            if (step.protocol == address(0)) {
                return (false, "Zero protocol address");
            }
            if (step.tokenIn == address(0)) {
                return (false, "Zero tokenIn address");
            }
            // tokenOut can be zero for some actions like staking
        }

        // Validate token flow
        if (!checkTokenFlow(steps)) {
            return (false, "Invalid token flow");
        }

        return (true, "");
    }

    /**
     * @notice Checks that token outputs connect to next step's inputs
     * @param steps Array of strategy steps
     * @return True if token flow is valid
     */
    function checkTokenFlow(IStrategyRegistry.Step[] memory steps) internal pure returns (bool) {
        if (steps.length == 0) return false;
        if (steps.length == 1) return true;

        for (uint256 i = 0; i < steps.length - 1; i++) {
            // For swap/withdraw actions, output should match next input
            if (steps[i].actionType == 0 || steps[i].actionType == 3) {
                if (steps[i].tokenOut != steps[i + 1].tokenIn) {
                    // Allow if next step accepts the same token
                    if (steps[i].tokenOut != address(0) && steps[i + 1].tokenIn != address(0)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * @notice Checks all protocols are whitelisted
     * @param steps Array of strategy steps
     * @param allowedProtocols Mapping of whitelisted protocols
     * @return True if all protocols are allowed
     */
    function checkProtocolWhitelist(
        IStrategyRegistry.Step[] memory steps,
        mapping(address => bool) storage allowedProtocols
    ) internal view returns (bool) {
        for (uint256 i = 0; i < steps.length; i++) {
            if (!allowedProtocols[steps[i].protocol]) {
                return false;
            }
        }
        return true;
    }

    /**
     * @notice Estimates risk score for a strategy (0-100)
     * @param steps Array of strategy steps
     * @return risk Risk score
     */
    function estimateRisk(IStrategyRegistry.Step[] memory steps) internal pure returns (uint8 risk) {
        if (steps.length == 0) return MAX_RISK_SCORE;

        uint256 totalRisk = 0;
        
        // Base risk per step (more steps = higher risk)
        totalRisk += steps.length * 5;

        // Risk per action type
        for (uint256 i = 0; i < steps.length; i++) {
            if (steps[i].actionType == 0) {
                // Swap: medium risk
                totalRisk += 10;
            } else if (steps[i].actionType == 1) {
                // Stake: low risk
                totalRisk += 5;
            } else if (steps[i].actionType == 2) {
                // Farm: high risk
                totalRisk += 20;
            } else if (steps[i].actionType == 3) {
                // Lend: low risk
                totalRisk += 5;
            }
        }

        // Cap at MAX_RISK_SCORE
        if (totalRisk > MAX_RISK_SCORE) {
            return MAX_RISK_SCORE;
        }

        return uint8(totalRisk);
    }

    /**
     * @notice Validates deposit amounts are within bounds
     * @param amount Amount to validate
     * @param minDeposit Minimum allowed deposit
     * @param maxDeposit Maximum allowed deposit
     * @return True if amount is valid
     */
    function validateDepositAmount(
        uint256 amount,
        uint256 minDeposit,
        uint256 maxDeposit
    ) internal pure returns (bool) {
        if (amount == 0) return false;
        if (minDeposit > 0 && amount < minDeposit) return false;
        if (maxDeposit > 0 && amount > maxDeposit) return false;
        return true;
    }
}

