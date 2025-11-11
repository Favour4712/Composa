// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "../interfaces/IStrategyNFT.sol";

contract StrategyNFT is
    ERC721Enumerable,
    ERC2981,
    Ownable2Step,
    ReentrancyGuard,
    IStrategyNFT
{
    mapping(uint256 => Strategy) private strategies;
    mapping(bytes32 => bool) private strategyExists;

    uint256 private nextTokenId = 1;
    address public strategyRegistry;
    address public strategyExecutor;

    error StrategyAlreadyExists();
    error StrategyNotFound();
    error NotStrategyOwner();
    error StrategyNotActive();
    error ParentStrategyNotFound();
    error OnlyExecutor();
    error ZeroAddress();

    modifier onlyExecutor() {
        if (msg.sender != strategyExecutor) revert OnlyExecutor();
        _;
    }

    constructor()
        ERC721("Composable Strategy NFT", "CSTRAT")
        Ownable(msg.sender)
    {
        _setDefaultRoyalty(msg.sender, 250); // 2.5% default royalty
    }

    /**
     * @notice Mints a new strategy NFT
     * @param hash Unique hash of the strategy
     * @param strategyData Encoded strategy data
     * @return tokenId ID of the minted NFT
     */
    function mintStrategy(
        bytes32 hash,
        bytes calldata strategyData
    ) external nonReentrant returns (uint256) {
        if (strategyExists[hash]) revert StrategyAlreadyExists();
        if (strategyData.length == 0) revert StrategyNotFound();

        uint256 tokenId = nextTokenId++;

        strategies[tokenId] = Strategy({
            strategyHash: hash,
            creator: msg.sender,
            createdAt: block.timestamp,
            forkCount: 0,
            parentTokenId: 0,
            isActive: true,
            totalValueLocked: 0,
            performanceScore: 0
        });

        strategyExists[hash] = true;
        _safeMint(msg.sender, tokenId);
        _setTokenRoyalty(tokenId, msg.sender, 500); // 5% creator royalty

        emit StrategyMinted(tokenId, msg.sender, hash);

        return tokenId;
    }

    /**
     * @notice Creates a fork of an existing strategy
     * @param parentId Token ID of the strategy to fork
     * @param newData New strategy data for the fork
     * @return newTokenId ID of the forked strategy NFT
     */
    function forkStrategy(
        uint256 parentId,
        bytes calldata newData
    ) external nonReentrant returns (uint256) {
        if (!_exists(parentId)) revert ParentStrategyNotFound();
        if (!strategies[parentId].isActive) revert StrategyNotActive();

        bytes32 newHash = keccak256(
            abi.encodePacked(parentId, newData, msg.sender, block.timestamp)
        );
        if (strategyExists[newHash]) revert StrategyAlreadyExists();

        uint256 newTokenId = nextTokenId++;

        strategies[newTokenId] = Strategy({
            strategyHash: newHash,
            creator: msg.sender,
            createdAt: block.timestamp,
            forkCount: 0,
            parentTokenId: parentId,
            isActive: true,
            totalValueLocked: 0,
            performanceScore: 0
        });

        // Increment parent fork count
        strategies[parentId].forkCount++;

        strategyExists[newHash] = true;
        _safeMint(msg.sender, newTokenId);
        _setTokenRoyalty(newTokenId, msg.sender, 500); // 5% creator royalty

        emit StrategyForked(newTokenId, parentId, msg.sender);

        return newTokenId;
    }

    /**
     * @notice Deactivates a strategy (only owner can deactivate)
     * @param tokenId ID of the strategy to deactivate
     */
    function deactivateStrategy(uint256 tokenId) external {
        if (ownerOf(tokenId) != msg.sender) revert NotStrategyOwner();
        if (!strategies[tokenId].isActive) revert StrategyNotActive();

        strategies[tokenId].isActive = false;
        emit StrategyDeactivated(tokenId);
    }

    /**
     * @notice Updates strategy metadata (only executor)
     * @param tokenId ID of the strategy
     * @param tvl Total value locked
     * @param score Performance score
     */
    function updateMetadata(
        uint256 tokenId,
        uint256 tvl,
        uint256 score
    ) external onlyExecutor {
        if (!_exists(tokenId)) revert StrategyNotFound();

        strategies[tokenId].totalValueLocked = tvl;
        strategies[tokenId].performanceScore = score;

        emit StrategyMetadataUpdated(tokenId, tvl, score);
    }

    /**
     * @notice Sets the strategy registry address
     * @param _registry Address of the registry contract
     */
    function setStrategyRegistry(address _registry) external onlyOwner {
        if (_registry == address(0)) revert ZeroAddress();
        strategyRegistry = _registry;
    }

    /**
     * @notice Sets the strategy executor address
     * @param _executor Address of the executor contract
     */
    function setStrategyExecutor(address _executor) external onlyOwner {
        if (_executor == address(0)) revert ZeroAddress();
        strategyExecutor = _executor;
    }

    /**
     * @notice Updates default royalty
     * @param receiver Royalty receiver address
     * @param feeNumerator Royalty fee in basis points
     */
    function setDefaultRoyalty(
        address receiver,
        uint96 feeNumerator
    ) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    // View functions

    function getStrategy(
        uint256 tokenId
    ) external view returns (Strategy memory) {
        if (!_exists(tokenId)) revert StrategyNotFound();
        return strategies[tokenId];
    }

    function getStrategyCreator(
        uint256 tokenId
    ) external view returns (address) {
        if (!_exists(tokenId)) revert StrategyNotFound();
        return strategies[tokenId].creator;
    }

    function isStrategyActive(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId)) revert StrategyNotFound();
        return strategies[tokenId].isActive;
    }

    function getStrategyForkCount(
        uint256 tokenId
    ) external view returns (uint256) {
        if (!_exists(tokenId)) revert StrategyNotFound();
        return strategies[tokenId].forkCount;
    }

    function getParentStrategy(
        uint256 tokenId
    ) external view returns (uint256) {
        if (!_exists(tokenId)) revert StrategyNotFound();
        return strategies[tokenId].parentTokenId;
    }

    function totalStrategies() external view returns (uint256) {
        return nextTokenId - 1;
    }

    // Internal helpers

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // Override required functions

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Enumerable, ERC2981, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721Enumerable) {
        super._increaseBalance(account, value);
    }
}
