// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IStrategyRegistry.sol";

library StrategyEncoder {
    error InvalidEncoding();
    error InvalidStepData();

    /**
     * @notice Encodes an array of strategy steps into bytes
     * @param steps Array of Step structs to encode
     * @return Encoded bytes representation of the strategy
     */
    function encodeSteps(
        IStrategyRegistry.Step[] memory steps
    ) internal pure returns (bytes memory) {
        if (steps.length == 0) revert InvalidStepData();
        return abi.encode(steps);
    }

    /**
     * @notice Decodes bytes into an array of strategy steps
     * @param data Encoded strategy data
     * @return steps Array of decoded Step structs
     */
    function decodeSteps(
        bytes memory data
    ) internal pure returns (IStrategyRegistry.Step[] memory steps) {
        if (data.length == 0) revert InvalidEncoding();
        return abi.decode(data, (IStrategyRegistry.Step[]));
    }

    /**
     * @notice Generates a unique hash for a strategy
     * @param data Encoded strategy data
     * @return Strategy hash
     */
    function hashStrategy(bytes memory data) internal pure returns (bytes32) {
        if (data.length == 0) revert InvalidEncoding();
        return keccak256(data);
    }

    /**
     * @notice Validates that encoded data can be decoded
     * @param data Encoded strategy data
     * @return True if valid, false otherwise
     */
    function validateEncoding(bytes memory data) internal pure returns (bool) {
        if (data.length == 0) return false;
        // Simple validation - check minimum encoded array size
        return data.length >= 32;
    }

    /**
     * @notice Encodes strategy configuration
     * @param config Strategy configuration struct
     * @return Encoded configuration
     */
    function encodeConfig(
        IStrategyRegistry.StrategyConfig memory config
    ) internal pure returns (bytes memory) {
        return abi.encode(config);
    }

    /**
     * @notice Decodes strategy configuration
     * @param data Encoded configuration data
     * @return config Decoded strategy configuration
     */
    function decodeConfig(
        bytes memory data
    ) internal pure returns (IStrategyRegistry.StrategyConfig memory config) {
        if (data.length == 0) revert InvalidEncoding();
        return abi.decode(data, (IStrategyRegistry.StrategyConfig));
    }
}
