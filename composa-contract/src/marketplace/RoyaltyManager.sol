// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IRoyaltyManager.sol";
import "../interfaces/IStrategyNFT.sol";

contract RoyaltyManager is IRoyaltyManager, Ownable2Step, ReentrancyGuard {
    mapping(uint256 => RoyaltyInfo) private royalties;

    address public immutable strategyNFT;

    uint256 public defaultRoyaltyBps = 500; // 5%
    uint256 public constant MAX_ROYALTY_BPS = 1000; // 10%

    error RoyaltyTooHigh();
    error NotStrategyOwner();
    error StrategyNotFound();
    error ZeroAddress();
    error InsufficientPayment();
    error TransferFailed();

    constructor(address _strategyNFT) Ownable(msg.sender) {
        if (_strategyNFT == address(0)) revert ZeroAddress();
        strategyNFT = _strategyNFT;
    }

    /**
     * @notice Sets royalty for a specific strategy
     * @param tokenId Strategy token ID
     * @param recipient Royalty recipient address
     * @param bps Royalty in basis points
     */
    function setRoyalty(
        uint256 tokenId,
        address recipient,
        uint256 bps
    ) external {
        // Verify caller is strategy owner or contract owner
        address tokenOwner;
        try IStrategyNFT(strategyNFT).ownerOf(tokenId) returns (address owner) {
            tokenOwner = owner;
        } catch {
            revert StrategyNotFound();
        }

        if (msg.sender != tokenOwner && msg.sender != owner()) {
            revert NotStrategyOwner();
        }

        if (bps > MAX_ROYALTY_BPS) revert RoyaltyTooHigh();
        if (recipient == address(0)) revert ZeroAddress();

        royalties[tokenId] = RoyaltyInfo({
            recipient: recipient,
            royaltyBps: bps
        });

        emit RoyaltySet(tokenId, recipient, bps);
    }

    /**
     * @notice Calculates royalty amount for a sale
     * @param tokenId Strategy token ID
     * @param salePrice Sale price
     * @return royaltyAmount Royalty amount to pay
     */
    function calculateRoyalty(
        uint256 tokenId,
        uint256 salePrice
    ) external view returns (uint256 royaltyAmount) {
        RoyaltyInfo memory info = royalties[tokenId];

        uint256 bps = info.royaltyBps > 0 ? info.royaltyBps : defaultRoyaltyBps;

        return (salePrice * bps) / 10000;
    }

    /**
     * @notice Distributes royalty payment
     * @param tokenId Strategy token ID
     * @param salePrice Sale price
     * @return royaltyAmount Amount distributed
     */
    function distributeRoyalty(
        uint256 tokenId,
        uint256 salePrice
    ) external payable nonReentrant returns (uint256 royaltyAmount) {
        RoyaltyInfo memory info = royalties[tokenId];

        // Get royalty amount
        uint256 bps = info.royaltyBps > 0 ? info.royaltyBps : defaultRoyaltyBps;
        royaltyAmount = (salePrice * bps) / 10000;

        if (msg.value < royaltyAmount) revert InsufficientPayment();

        // Get recipient (use strategy creator if not set)
        address recipient = info.recipient;
        if (recipient == address(0)) {
            try IStrategyNFT(strategyNFT).getStrategyCreator(tokenId) returns (
                address creator
            ) {
                recipient = creator;
            } catch {
                revert StrategyNotFound();
            }
        }

        // Transfer royalty
        if (royaltyAmount > 0 && recipient != address(0)) {
            (bool success, ) = payable(recipient).call{value: royaltyAmount}(
                ""
            );
            if (!success) revert TransferFailed();
            emit RoyaltyDistributed(tokenId, recipient, royaltyAmount);
        }

        // Refund excess
        if (msg.value > royaltyAmount) {
            (bool success, ) = payable(msg.sender).call{
                value: msg.value - royaltyAmount
            }("");
            if (!success) revert TransferFailed();
        }

        return royaltyAmount;
    }

    /**
     * @notice Sets default royalty percentage
     * @param bps Royalty in basis points
     */
    function setDefaultRoyalty(uint256 bps) external onlyOwner {
        if (bps > MAX_ROYALTY_BPS) revert RoyaltyTooHigh();
        defaultRoyaltyBps = bps;
    }

    /**
     * @notice Batch sets royalties for multiple strategies
     * @param tokenIds Array of token IDs
     * @param recipients Array of recipient addresses
     * @param bpsValues Array of royalty basis points
     */
    function batchSetRoyalty(
        uint256[] calldata tokenIds,
        address[] calldata recipients,
        uint256[] calldata bpsValues
    ) external {
        require(
            tokenIds.length == recipients.length &&
                tokenIds.length == bpsValues.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < tokenIds.length; i++) {
            // Verify ownership
            address tokenOwner;
            try IStrategyNFT(strategyNFT).ownerOf(tokenIds[i]) returns (
                address owner
            ) {
                tokenOwner = owner;
            } catch {
                continue; // Skip if strategy not found
            }

            if (msg.sender != tokenOwner && msg.sender != owner()) {
                continue; // Skip if not authorized
            }

            if (bpsValues[i] > MAX_ROYALTY_BPS || recipients[i] == address(0)) {
                continue; // Skip invalid values
            }

            royalties[tokenIds[i]] = RoyaltyInfo({
                recipient: recipients[i],
                royaltyBps: bpsValues[i]
            });

            emit RoyaltySet(tokenIds[i], recipients[i], bpsValues[i]);
        }
    }

    // View functions

    function getRoyaltyInfo(
        uint256 tokenId
    ) external view returns (RoyaltyInfo memory) {
        return royalties[tokenId];
    }

    function getRoyaltyAmount(
        uint256 tokenId,
        uint256 price
    ) external view returns (uint256) {
        RoyaltyInfo memory info = royalties[tokenId];
        uint256 bps = info.royaltyBps > 0 ? info.royaltyBps : defaultRoyaltyBps;
        return (price * bps) / 10000;
    }

    function getDefaultRoyalty() external view returns (uint256) {
        return defaultRoyaltyBps;
    }

    function getMaxRoyalty() external view returns (uint256) {
        return MAX_ROYALTY_BPS;
    }

    /**
     * @notice Checks if royalty is set for a token
     * @param tokenId Token ID to check
     * @return True if custom royalty is set
     */
    function hasCustomRoyalty(uint256 tokenId) external view returns (bool) {
        return royalties[tokenId].recipient != address(0);
    }

    receive() external payable {}
}
