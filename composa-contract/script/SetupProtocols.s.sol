// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/StrategyRegistry.sol";
import "../src/execution/StrategyRunner.sol";

/**
 * @title SetupProtocols
 * @notice Script to add additional protocols after initial deployment
 */
contract SetupProtocolsScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Load deployed contract addresses from environment or JSON
        address registryAddress = vm.envAddress("STRATEGY_REGISTRY");
        address payable runnerAddress = payable(
            vm.envAddress("STRATEGY_RUNNER")
        );

        console.log("Setting up additional protocols...");
        console.log("Registry:", registryAddress);
        console.log("Runner:", runnerAddress);

        vm.startBroadcast(deployerPrivateKey);

        StrategyRegistry registry = StrategyRegistry(registryAddress);
        StrategyRunner runner = StrategyRunner(runnerAddress);

        // Example: Add custom protocol
        address customProtocol = vm.envOr("CUSTOM_PROTOCOL", address(0));
        address customAdapter = vm.envOr("CUSTOM_ADAPTER", address(0));

        if (customProtocol != address(0) && customAdapter != address(0)) {
            registry.addAllowedProtocol(customProtocol);
            console.log("Added custom protocol to registry:", customProtocol);

            runner.registerAdapter(customProtocol, customAdapter);
            console.log("Registered custom adapter:", customAdapter);
        }

        vm.stopBroadcast();

        console.log("Protocol setup complete!");
    }
}
