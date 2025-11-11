// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "../interfaces/IVaultFactory.sol";
import "../interfaces/IStrategyNFT.sol";
import "./StrategyVault.sol";

contract VaultFactory is IVaultFactory, Ownable2Step {
    using Clones for address;

    mapping(uint256 => address) private strategyVaults;
    
    address public vaultImplementation;
    address public immutable strategyNFT;
    address public immutable strategyExecutor;

    address[] private allVaults;

    error VaultAlreadyExists();
    error VaultNotFound();
    error ZeroAddress();
    error InvalidStrategy();

    constructor(
        address _vaultImplementation,
        address _strategyNFT,
        address _strategyExecutor
    ) Ownable(msg.sender) {
        if (_vaultImplementation == address(0) || _strategyNFT == address(0) || _strategyExecutor == address(0)) {
            revert ZeroAddress();
        }
        
        vaultImplementation = _vaultImplementation;
        strategyNFT = _strategyNFT;
        strategyExecutor = _strategyExecutor;
    }

    /**
     * @notice Creates a new vault for a strategy
     * @param tokenId Strategy NFT token ID
     * @param depositToken Token to accept for deposits
     * @return vault Address of the created vault
     */
    function createVault(uint256 tokenId, address depositToken) 
        external 
        returns (address vault) 
    {
        // Check strategy exists
        try IStrategyNFT(strategyNFT).ownerOf(tokenId) returns (address owner) {
            if (owner == address(0)) revert InvalidStrategy();
        } catch {
            revert InvalidStrategy();
        }

        // Check vault doesn't already exist
        if (strategyVaults[tokenId] != address(0)) revert VaultAlreadyExists();
        
        if (depositToken == address(0)) revert ZeroAddress();

        // Deploy new vault instance directly (not using clone for simplicity)
        vault = address(new StrategyVault(
            tokenId,
            depositToken,
            strategyExecutor,
            strategyNFT,
            msg.sender
        ));

        // Store vault
        strategyVaults[tokenId] = vault;
        allVaults.push(vault);

        emit VaultCreated(tokenId, vault, depositToken);

        return vault;
    }

    /**
     * @notice Sets the vault implementation contract
     * @param impl New implementation address
     */
    function setVaultImplementation(address impl) external onlyOwner {
        if (impl == address(0)) revert ZeroAddress();
        vaultImplementation = impl;
        emit VaultImplementationUpdated(impl);
    }

    // View functions

    function getVault(uint256 tokenId) external view returns (address) {
        return strategyVaults[tokenId];
    }

    function vaultExists(uint256 tokenId) external view returns (bool) {
        return strategyVaults[tokenId] != address(0);
    }

    function getAllVaults() external view returns (address[] memory) {
        return allVaults;
    }

    function getVaultImplementation() external view returns (address) {
        return vaultImplementation;
    }

    /**
     * @notice Gets total number of vaults
     * @return Total vault count
     */
    function totalVaults() external view returns (uint256) {
        return allVaults.length;
    }

    /**
     * @notice Gets vault at specific index
     * @param index Index in allVaults array
     * @return Vault address
     */
    function getVaultAtIndex(uint256 index) external view returns (address) {
        require(index < allVaults.length, "Index out of bounds");
        return allVaults[index];
    }
}

