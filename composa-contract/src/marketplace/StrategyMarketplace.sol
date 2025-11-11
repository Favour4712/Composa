// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../interfaces/IStrategyMarketplace.sol";
import "../interfaces/IStrategyNFT.sol";
import "../interfaces/IRoyaltyManager.sol";

contract StrategyMarketplace is
    IStrategyMarketplace,
    Ownable2Step,
    ReentrancyGuard
{
    mapping(uint256 => Listing) private listings;
    mapping(uint256 => Offer[]) private offers;
    mapping(uint256 => uint256) private activeListingIndex;

    uint256[] private activeListings;

    address public immutable strategyNFT;
    address public royaltyManager;

    uint256 public platformFee = 250; // 2.5% in basis points
    address public feeRecipient;

    error NotTokenOwner();
    error NotListed();
    error AlreadyListed();
    error InsufficientPayment();
    error InvalidPrice();
    error InvalidOffer();
    error OfferExpired();
    error ZeroAddress();
    error TransferFailed();

    modifier onlyTokenOwner(uint256 tokenId) {
        if (IERC721(strategyNFT).ownerOf(tokenId) != msg.sender) {
            revert NotTokenOwner();
        }
        _;
    }

    constructor(
        address _strategyNFT,
        address _feeRecipient
    ) Ownable(msg.sender) {
        if (_strategyNFT == address(0) || _feeRecipient == address(0)) {
            revert ZeroAddress();
        }
        strategyNFT = _strategyNFT;
        feeRecipient = _feeRecipient;
    }

    /**
     * @notice Lists a strategy NFT for sale
     * @param tokenId Token ID to list
     * @param price Listing price
     */
    function listStrategy(
        uint256 tokenId,
        uint256 price
    ) external nonReentrant onlyTokenOwner(tokenId) {
        if (price == 0) revert InvalidPrice();
        if (listings[tokenId].active) revert AlreadyListed();

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            listedAt: block.timestamp,
            active: true
        });

        // Add to active listings
        activeListingIndex[tokenId] = activeListings.length;
        activeListings.push(tokenId);

        emit StrategyListed(tokenId, msg.sender, price);
    }

    /**
     * @notice Removes a listing
     * @param tokenId Token ID to delist
     */
    function delistStrategy(
        uint256 tokenId
    ) external nonReentrant onlyTokenOwner(tokenId) {
        if (!listings[tokenId].active) revert NotListed();

        listings[tokenId].active = false;
        _removeFromActiveListings(tokenId);

        emit StrategyDelisted(tokenId);
    }

    /**
     * @notice Buys a listed strategy
     * @param tokenId Token ID to buy
     */
    function buyStrategy(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];

        if (!listing.active) revert NotListed();
        if (msg.value < listing.price) revert InsufficientPayment();

        address seller = listing.seller;
        uint256 price = listing.price;

        // Mark as inactive
        listings[tokenId].active = false;
        _removeFromActiveListings(tokenId);

        // Calculate fees
        uint256 platformFeeAmount = (price * platformFee) / 10000;
        uint256 royaltyAmount = 0;

        // Handle royalties if manager is set
        if (royaltyManager != address(0)) {
            royaltyAmount = IRoyaltyManager(royaltyManager).calculateRoyalty(
                tokenId,
                price
            );
            if (royaltyAmount > 0) {
                IRoyaltyManager(royaltyManager).distributeRoyalty{
                    value: royaltyAmount
                }(tokenId, price);
            }
        }

        // Calculate seller proceeds
        uint256 sellerProceeds = price - platformFeeAmount - royaltyAmount;

        // Transfer NFT to buyer
        IERC721(strategyNFT).safeTransferFrom(seller, msg.sender, tokenId);

        // Transfer payments
        (bool feeSuccess, ) = payable(feeRecipient).call{
            value: platformFeeAmount
        }("");
        if (!feeSuccess) revert TransferFailed();
        (bool sellerSuccess, ) = payable(seller).call{value: sellerProceeds}(
            ""
        );
        if (!sellerSuccess) revert TransferFailed();

        // Refund excess
        if (msg.value > price) {
            (bool refundSuccess, ) = payable(msg.sender).call{
                value: msg.value - price
            }("");
            if (!refundSuccess) revert TransferFailed();
        }

        emit StrategyBought(tokenId, msg.sender, seller, price);
    }

    /**
     * @notice Makes an offer on a strategy
     * @param tokenId Token ID to make offer on
     * @param expiresAt Timestamp when offer expires
     */
    function makeOffer(
        uint256 tokenId,
        uint256 expiresAt
    ) external payable nonReentrant {
        if (msg.value == 0) revert InvalidOffer();
        if (expiresAt <= block.timestamp) revert OfferExpired();

        offers[tokenId].push(
            Offer({buyer: msg.sender, amount: msg.value, expiresAt: expiresAt})
        );

        emit OfferMade(tokenId, msg.sender, msg.value, expiresAt);
    }

    /**
     * @notice Accepts an offer
     * @param tokenId Token ID
     * @param offerIndex Index of the offer to accept
     */
    function acceptOffer(
        uint256 tokenId,
        uint256 offerIndex
    ) external nonReentrant onlyTokenOwner(tokenId) {
        if (offerIndex >= offers[tokenId].length) revert InvalidOffer();

        Offer memory offer = offers[tokenId][offerIndex];

        if (offer.expiresAt <= block.timestamp) revert OfferExpired();

        address buyer = offer.buyer;
        uint256 amount = offer.amount;

        // Calculate fees
        uint256 platformFeeAmount = (amount * platformFee) / 10000;
        uint256 royaltyAmount = 0;

        if (royaltyManager != address(0)) {
            royaltyAmount = IRoyaltyManager(royaltyManager).calculateRoyalty(
                tokenId,
                amount
            );
            if (royaltyAmount > 0) {
                IRoyaltyManager(royaltyManager).distributeRoyalty{
                    value: royaltyAmount
                }(tokenId, amount);
            }
        }

        uint256 sellerProceeds = amount - platformFeeAmount - royaltyAmount;

        // Remove listing if active
        if (listings[tokenId].active) {
            listings[tokenId].active = false;
            _removeFromActiveListings(tokenId);
        }

        // Clear all offers for this token
        delete offers[tokenId];

        // Transfer NFT
        IERC721(strategyNFT).safeTransferFrom(msg.sender, buyer, tokenId);

        // Transfer payments
        (bool feeSuccess, ) = payable(feeRecipient).call{
            value: platformFeeAmount
        }("");
        if (!feeSuccess) revert TransferFailed();
        (bool sellerSuccess, ) = payable(msg.sender).call{
            value: sellerProceeds
        }("");
        if (!sellerSuccess) revert TransferFailed();

        emit OfferAccepted(tokenId, buyer, msg.sender, amount);
    }

    /**
     * @notice Cancels an offer
     * @param tokenId Token ID
     * @param offerIndex Index of the offer to cancel
     */
    function cancelOffer(
        uint256 tokenId,
        uint256 offerIndex
    ) external nonReentrant {
        if (offerIndex >= offers[tokenId].length) revert InvalidOffer();

        Offer memory offer = offers[tokenId][offerIndex];

        if (offer.buyer != msg.sender) revert NotTokenOwner();

        uint256 refundAmount = offer.amount;

        // Remove offer by replacing with last and popping
        offers[tokenId][offerIndex] = offers[tokenId][
            offers[tokenId].length - 1
        ];
        offers[tokenId].pop();

        // Refund offer amount
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        if (!success) revert TransferFailed();

        emit OfferCancelled(tokenId, offerIndex, msg.sender);
    }

    /**
     * @notice Sets the royalty manager
     * @param _royaltyManager Royalty manager address
     */
    function setRoyaltyManager(address _royaltyManager) external onlyOwner {
        royaltyManager = _royaltyManager;
    }

    /**
     * @notice Sets the platform fee
     * @param _platformFee New platform fee in basis points
     */
    function setPlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= 1000, "Max 10% fee"); // Max 10%
        platformFee = _platformFee;
    }

    /**
     * @notice Sets the fee recipient
     * @param _feeRecipient New fee recipient address
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        if (_feeRecipient == address(0)) revert ZeroAddress();
        feeRecipient = _feeRecipient;
    }

    // View functions

    function getListing(
        uint256 tokenId
    ) external view returns (Listing memory) {
        return listings[tokenId];
    }

    function getOffers(uint256 tokenId) external view returns (Offer[] memory) {
        return offers[tokenId];
    }

    function isListed(uint256 tokenId) external view returns (bool) {
        return listings[tokenId].active;
    }

    function getPlatformFee() external view returns (uint256) {
        return platformFee;
    }

    function getActiveListings() external view returns (uint256[] memory) {
        return activeListings;
    }

    function getUserListings(
        address user
    ) external view returns (uint256[] memory) {
        uint256 balance = IERC721(strategyNFT).balanceOf(user);
        uint256[] memory userTokens = new uint256[](balance);
        uint256 count = 0;

        // This is a simplified version - in production you'd use ERC721Enumerable
        for (uint256 i = 0; i < activeListings.length; i++) {
            uint256 tokenId = activeListings[i];
            if (listings[tokenId].seller == user && listings[tokenId].active) {
                if (count < balance) {
                    userTokens[count] = tokenId;
                    count++;
                }
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userTokens[i];
        }

        return result;
    }

    // Internal helpers

    function _removeFromActiveListings(uint256 tokenId) internal {
        uint256 index = activeListingIndex[tokenId];
        uint256 lastIndex = activeListings.length - 1;

        if (index != lastIndex) {
            uint256 lastTokenId = activeListings[lastIndex];
            activeListings[index] = lastTokenId;
            activeListingIndex[lastTokenId] = index;
        }

        activeListings.pop();
        delete activeListingIndex[tokenId];
    }

    receive() external payable {}
}
