// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStrategyMarketplace {
    struct Listing {
        address seller;
        uint256 price;
        uint256 listedAt;
        bool active;
    }

    struct Offer {
        address buyer;
        uint256 amount;
        uint256 expiresAt;
    }

    event StrategyListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event StrategyDelisted(uint256 indexed tokenId);
    event StrategyBought(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price);
    event OfferMade(uint256 indexed tokenId, address indexed buyer, uint256 amount, uint256 expiresAt);
    event OfferAccepted(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 amount);
    event OfferCancelled(uint256 indexed tokenId, uint256 indexed offerIndex, address indexed buyer);

    function listStrategy(uint256 tokenId, uint256 price) external;
    function delistStrategy(uint256 tokenId) external;
    function buyStrategy(uint256 tokenId) external payable;
    function makeOffer(uint256 tokenId, uint256 expiresAt) external payable;
    function acceptOffer(uint256 tokenId, uint256 offerIndex) external;
    function cancelOffer(uint256 tokenId, uint256 offerIndex) external;
    
    function getListing(uint256 tokenId) external view returns (Listing memory);
    function getOffers(uint256 tokenId) external view returns (Offer[] memory);
    function isListed(uint256 tokenId) external view returns (bool);
    function getPlatformFee() external view returns (uint256);
    function getActiveListings() external view returns (uint256[] memory);
    function getUserListings(address user) external view returns (uint256[] memory);
}

