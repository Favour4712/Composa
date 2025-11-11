// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/StrategyNFT.sol";
import "../src/core/StrategyRegistry.sol";
import "../src/core/StrategyExecutor.sol";
import "../src/execution/StrategyRunner.sol";
import "../src/execution/adapters/UniswapAdapter.sol";
// import "../src/execution/adapters/AaveAdapter.sol"; // Not available on Base Sepolia
import "../src/execution/adapters/CompoundAdapter.sol";
import "../src/vault/StrategyVault.sol";
import "../src/vault/VaultFactory.sol";
import "../src/marketplace/StrategyMarketplace.sol";
import "../src/marketplace/RoyaltyManager.sol";

contract DeployScript is Script {
    // Base Sepolia Protocol Addresses
    address constant UNISWAP_ROUTER =
        0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4; // Base Sepolia SwapRouter
    address constant UNISWAP_QUOTER =
        0xC5290058841028F1614F3A6F0F5816cAd0df5E27; // Base Sepolia Quoter
    address constant COMPOUND_COMET =
        0x571621Ce60Cebb0c1D442B5afb38B1663C6Bf017; // Base Sepolia cUSDCv3

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts to Base Sepolia...");
        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Core Contracts
        console.log("\n=== Deploying Core Contracts ===");

        StrategyNFT strategyNFT = new StrategyNFT();
        console.log("StrategyNFT deployed at:", address(strategyNFT));

        StrategyRegistry strategyRegistry = new StrategyRegistry(
            address(strategyNFT)
        );
        console.log("StrategyRegistry deployed at:", address(strategyRegistry));

        StrategyExecutor strategyExecutor = new StrategyExecutor(
            address(strategyNFT),
            address(strategyRegistry)
        );
        console.log("StrategyExecutor deployed at:", address(strategyExecutor));

        // 2. Deploy Execution Layer
        console.log("\n=== Deploying Execution Layer ===");

        StrategyRunner strategyRunner = new StrategyRunner(
            address(strategyExecutor),
            address(strategyRegistry)
        );
        console.log("StrategyRunner deployed at:", address(strategyRunner));

        // 3. Deploy Protocol Adapters
        console.log("\n=== Deploying Protocol Adapters ===");

        UniswapAdapter uniswapAdapter = new UniswapAdapter(
            address(strategyRunner),
            UNISWAP_ROUTER,
            UNISWAP_QUOTER
        );
        console.log("UniswapAdapter deployed at:", address(uniswapAdapter));

        CompoundAdapter compoundAdapter = new CompoundAdapter(
            address(strategyRunner),
            COMPOUND_COMET
        );
        console.log("CompoundAdapter deployed at:", address(compoundAdapter));

        // 4. Deploy Vault System
        console.log("\n=== Deploying Vault System ===");

        // Deploy vault implementation
        StrategyVault vaultImplementation = new StrategyVault(
            0, // dummy tokenId
            address(0x1), // dummy deposit token
            address(strategyExecutor),
            address(strategyNFT),
            deployer
        );
        console.log(
            "StrategyVault implementation deployed at:",
            address(vaultImplementation)
        );

        VaultFactory vaultFactory = new VaultFactory(
            address(vaultImplementation),
            address(strategyNFT),
            address(strategyExecutor)
        );
        console.log("VaultFactory deployed at:", address(vaultFactory));

        // 5. Deploy Marketplace
        console.log("\n=== Deploying Marketplace ===");

        StrategyMarketplace marketplace = new StrategyMarketplace(
            address(strategyNFT),
            deployer // Fee recipient
        );
        console.log("StrategyMarketplace deployed at:", address(marketplace));

        RoyaltyManager royaltyManager = new RoyaltyManager(
            address(strategyNFT)
        );
        console.log("RoyaltyManager deployed at:", address(royaltyManager));

        // 6. Connect Components
        console.log("\n=== Connecting Components ===");

        strategyNFT.setStrategyRegistry(address(strategyRegistry));
        console.log("Set StrategyRegistry on NFT");

        strategyNFT.setStrategyExecutor(address(strategyExecutor));
        console.log("Set StrategyExecutor on NFT");

        strategyExecutor.setStrategyRunner(address(strategyRunner));
        console.log("Set StrategyRunner on Executor");

        marketplace.setRoyaltyManager(address(royaltyManager));
        console.log("Set RoyaltyManager on Marketplace");

        // 7. Register Protocol Adapters
        console.log("\n=== Registering Protocol Adapters ===");

        strategyRunner.registerAdapter(UNISWAP_ROUTER, address(uniswapAdapter));
        console.log("Registered UniswapAdapter");

        strategyRunner.registerAdapter(COMPOUND_COMET, address(compoundAdapter));
        console.log("Registered CompoundAdapter");

        // 8. Whitelist Protocols in Registry
        console.log("\n=== Whitelisting Protocols ===");

        strategyRegistry.addAllowedProtocol(UNISWAP_ROUTER);
        console.log("Whitelisted Uniswap Router");

        strategyRegistry.addAllowedProtocol(COMPOUND_COMET);
        console.log("Whitelisted Compound Comet");

        vm.stopBroadcast();

        // 9. Save Deployment Addresses
        console.log("\n=== Deployment Summary ===");
        console.log("Network: Base Sepolia");
        console.log("Deployer:", deployer);
        console.log("\nCore Contracts:");
        console.log("  StrategyNFT:", address(strategyNFT));
        console.log("  StrategyRegistry:", address(strategyRegistry));
        console.log("  StrategyExecutor:", address(strategyExecutor));
        console.log("\nExecution Layer:");
        console.log("  StrategyRunner:", address(strategyRunner));
        console.log("  UniswapAdapter:", address(uniswapAdapter));
        console.log("  CompoundAdapter:", address(compoundAdapter));
        console.log("\nVault System:");
        console.log("  VaultFactory:", address(vaultFactory));
        console.log("  Vault Implementation:", address(vaultImplementation));
        console.log("\nMarketplace:");
        console.log("  StrategyMarketplace:", address(marketplace));
        console.log("  RoyaltyManager:", address(royaltyManager));

        // Write addresses to file for frontend
        _writeDeploymentAddresses(
            address(strategyNFT),
            address(strategyRegistry),
            address(strategyExecutor),
            address(strategyRunner),
            address(vaultFactory),
            address(marketplace),
            address(royaltyManager)
        );
    }

    function _writeDeploymentAddresses(
        address strategyNFT,
        address strategyRegistry,
        address strategyExecutor,
        address strategyRunner,
        address vaultFactory,
        address marketplace,
        address royaltyManager
    ) internal {
        string memory json = string(
            abi.encodePacked(
                "{\n",
                '  "network": "base-sepolia",\n',
                '  "chainId": 84532,\n',
                '  "contracts": {\n',
                '    "StrategyNFT": "',
                _addressToString(strategyNFT),
                '",\n',
                '    "StrategyRegistry": "',
                _addressToString(strategyRegistry),
                '",\n',
                '    "StrategyExecutor": "',
                _addressToString(strategyExecutor),
                '",\n',
                '    "StrategyRunner": "',
                _addressToString(strategyRunner),
                '",\n',
                '    "VaultFactory": "',
                _addressToString(vaultFactory),
                '",\n',
                '    "StrategyMarketplace": "',
                _addressToString(marketplace),
                '",\n',
                '    "RoyaltyManager": "',
                _addressToString(royaltyManager),
                '"\n',
                "  }\n",
                "}"
            )
        );

        vm.writeFile("deployments/base-sepolia.json", json);
        console.log(
            "\nDeployment addresses saved to: deployments/base-sepolia.json"
        );
    }

    function _addressToString(
        address addr
    ) internal pure returns (string memory) {
        bytes memory data = abi.encodePacked(addr);
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(2 + data.length * 2);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < data.length; i++) {
            str[2 + i * 2] = alphabet[uint8(data[i] >> 4)];
            str[3 + i * 2] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
}
