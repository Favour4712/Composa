// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVaultFactory {
    event VaultCreated(uint256 indexed tokenId, address indexed vault, address indexed depositToken);
    event VaultImplementationUpdated(address indexed newImplementation);

    function createVault(uint256 tokenId, address depositToken) external returns (address);
    function setVaultImplementation(address impl) external;
    
    function getVault(uint256 tokenId) external view returns (address);
    function vaultExists(uint256 tokenId) external view returns (bool);
    function getAllVaults() external view returns (address[] memory);
    function getVaultImplementation() external view returns (address);
}

