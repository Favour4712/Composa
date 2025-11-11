// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IStrategyRegistry.sol";
import "../interfaces/IStrategyNFT.sol";
import "../libraries/StrategyEncoder.sol";
import "../libraries/StrategyValidator.sol";

contract StrategyRegistry is IStrategyRegistry, Ownable2Step, ReentrancyGuard {
    using StrategyEncoder for bytes;
    using StrategyValidator for Step[];

    mapping(uint256 => StrategyConfig) private configs;
    mapping(uint256 => Step[]) private strategySteps;
    mapping(address => bool) private allowedProtocols;

    address public immutable strategyNFT;

    error OnlyNFTContract();
    error StrategyNotFound();
    error ProtocolNotAllowed();
    error InvalidStrategy();
    error ZeroAddress();

    modifier onlyNFT() {
        if (msg.sender != strategyNFT) revert OnlyNFTContract();
        _;
    }

    constructor(address _strategyNFT) Ownable(msg.sender) {
        if (_strategyNFT == address(0)) revert ZeroAddress();
        strategyNFT = _strategyNFT;
    }

    /**
     * @notice Registers a new strategy configuration
     * @param tokenId NFT token ID
     * @param strategyData Encoded strategy data
     */
    function registerStrategy(
        uint256 tokenId,
        bytes calldata strategyData
    ) external nonReentrant {
        // Verify caller owns the NFT or is the NFT contract
        if (msg.sender != strategyNFT) {
            if (IStrategyNFT(strategyNFT).ownerOf(tokenId) != msg.sender) {
                revert OnlyNFTContract();
            }
        }

        // Decode strategy steps
        Step[] memory steps = StrategyEncoder.decodeSteps(strategyData);

        // Validate strategy
        (bool valid, string memory reason) = steps.validateStrategy(
            allowedProtocols
        );
        if (!valid) revert InvalidStrategy();

        // Extract unique protocols
        address[] memory protocols = _extractProtocols(steps);

        // Store configuration
        configs[tokenId] = StrategyConfig({
            tokenId: tokenId,
            protocols: protocols,
            stepCount: uint8(steps.length),
            minDeposit: 0,
            maxDeposit: 0,
            isPublic: true
        });

        // Store steps
        delete strategySteps[tokenId];
        for (uint256 i = 0; i < steps.length; i++) {
            strategySteps[tokenId].push(steps[i]);
        }

        emit StrategyRegistered(tokenId, protocols);
    }

    /**
     * @notice Validates strategy data without registering
     * @param strategyData Encoded strategy data
     * @return valid True if valid
     * @return reason Error message if invalid
     */
    function validateStrategy(
        bytes calldata strategyData
    ) external view returns (bool valid, string memory reason) {
        if (strategyData.length == 0) {
            return (false, "Empty strategy data");
        }

        // Decode and validate
        Step[] memory steps = StrategyEncoder.decodeSteps(strategyData);
        return steps.validateStrategy(allowedProtocols);
    }

    /**
     * @notice Adds a protocol to the whitelist
     * @param protocol Protocol address to allow
     */
    function addAllowedProtocol(address protocol) external onlyOwner {
        if (protocol == address(0)) revert ZeroAddress();
        allowedProtocols[protocol] = true;
        emit ProtocolAllowed(protocol);
    }

    /**
     * @notice Removes a protocol from the whitelist
     * @param protocol Protocol address to remove
     */
    function removeAllowedProtocol(address protocol) external onlyOwner {
        allowedProtocols[protocol] = false;
        emit ProtocolRemoved(protocol);
    }

    /**
     * @notice Encodes strategy steps into bytes
     * @param steps Array of steps to encode
     * @return Encoded strategy data
     */
    function encodeStrategy(
        Step[] calldata steps
    ) external pure returns (bytes memory) {
        Step[] memory stepsMemory = new Step[](steps.length);
        for (uint256 i = 0; i < steps.length; i++) {
            stepsMemory[i] = steps[i];
        }
        return StrategyEncoder.encodeSteps(stepsMemory);
    }

    /**
     * @notice Updates strategy configuration settings
     * @param tokenId Strategy token ID
     * @param minDeposit Minimum deposit amount
     * @param maxDeposit Maximum deposit amount
     * @param isPublic Whether strategy is public
     */
    function updateStrategyConfig(
        uint256 tokenId,
        uint256 minDeposit,
        uint256 maxDeposit,
        bool isPublic
    ) external {
        if (IStrategyNFT(strategyNFT).ownerOf(tokenId) != msg.sender) {
            revert OnlyNFTContract();
        }

        configs[tokenId].minDeposit = minDeposit;
        configs[tokenId].maxDeposit = maxDeposit;
        configs[tokenId].isPublic = isPublic;
    }

    // View functions

    function getStrategyConfig(
        uint256 tokenId
    ) external view returns (StrategyConfig memory) {
        if (configs[tokenId].stepCount == 0) revert StrategyNotFound();
        return configs[tokenId];
    }

    function getStrategySteps(
        uint256 tokenId
    ) external view returns (Step[] memory) {
        return strategySteps[tokenId];
    }

    function getStep(
        uint256 tokenId,
        uint8 stepIndex
    ) external view returns (Step memory) {
        if (stepIndex >= strategySteps[tokenId].length)
            revert StrategyNotFound();
        return strategySteps[tokenId][stepIndex];
    }

    function isProtocolAllowed(address protocol) external view returns (bool) {
        return allowedProtocols[protocol];
    }

    function getStepCount(uint256 tokenId) external view returns (uint8) {
        return uint8(strategySteps[tokenId].length);
    }

    function getStrategyProtocols(
        uint256 tokenId
    ) external view returns (address[] memory) {
        if (configs[tokenId].stepCount == 0) revert StrategyNotFound();
        return configs[tokenId].protocols;
    }

    // Internal helpers

    function _extractProtocols(
        Step[] memory steps
    ) internal pure returns (address[] memory) {
        address[] memory temp = new address[](steps.length);
        uint256 count = 0;

        for (uint256 i = 0; i < steps.length; i++) {
            bool exists = false;
            for (uint256 j = 0; j < count; j++) {
                if (temp[j] == steps[i].protocol) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                temp[count] = steps[i].protocol;
                count++;
            }
        }

        address[] memory protocols = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            protocols[i] = temp[i];
        }

        return protocols;
    }
}
