// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/core/StrategyRegistry.sol";
import "../../src/core/StrategyNFT.sol";

contract StrategyRegistryTest is Test {
    StrategyRegistry public registry;
    StrategyNFT public nft;
    
    address public alice = address(0x1);
    address public protocol1 = address(0x100);
    address public protocol2 = address(0x200);
    address public token1 = address(0x1000);
    address public token2 = address(0x2000);

    function setUp() public {
        nft = new StrategyNFT();
        registry = new StrategyRegistry(address(nft));
        
        // Connect NFT to registry
        nft.setStrategyRegistry(address(registry));
        
        vm.label(alice, "Alice");
        vm.label(protocol1, "Protocol1");
        vm.label(protocol2, "Protocol2");
    }

    function _createValidStep() internal view returns (IStrategyRegistry.Step memory) {
        return IStrategyRegistry.Step({
            actionType: 0,
            protocol: protocol1,
            tokenIn: token1,
            tokenOut: token2,
            params: ""
        });
    }

    function test_AddAllowedProtocol() public {
        registry.addAllowedProtocol(protocol1);
        assertTrue(registry.isProtocolAllowed(protocol1));
    }

    function test_RemoveAllowedProtocol() public {
        registry.addAllowedProtocol(protocol1);
        registry.removeAllowedProtocol(protocol1);
        assertFalse(registry.isProtocolAllowed(protocol1));
    }

    function test_EncodeAndDecodeStrategy() public {
        IStrategyRegistry.Step[] memory steps = new IStrategyRegistry.Step[](2);
        steps[0] = _createValidStep();
        steps[1] = _createValidStep();
        
        bytes memory encoded = registry.encodeStrategy(steps);
        assertTrue(encoded.length > 0);
    }

    function test_RegisterStrategy() public {
        // Setup
        registry.addAllowedProtocol(protocol1);
        
        vm.prank(alice);
        uint256 tokenId = nft.mintStrategy(keccak256("test"), hex"1234");
        
        // Create valid strategy
        IStrategyRegistry.Step[] memory steps = new IStrategyRegistry.Step[](1);
        steps[0] = _createValidStep();
        bytes memory strategyData = registry.encodeStrategy(steps);
        
        // Register
        vm.prank(alice);
        registry.registerStrategy(tokenId, strategyData);
        
        // Verify
        IStrategyRegistry.StrategyConfig memory config = registry.getStrategyConfig(tokenId);
        assertEq(config.tokenId, tokenId);
        assertEq(config.stepCount, 1);
        assertEq(config.protocols.length, 1);
        assertEq(config.protocols[0], protocol1);
    }

    function test_RevertWhen_RegisteringWithUnallowedProtocol() public {
        vm.prank(alice);
        uint256 tokenId = nft.mintStrategy(keccak256("test"), hex"1234");
        
        IStrategyRegistry.Step[] memory steps = new IStrategyRegistry.Step[](1);
        steps[0] = _createValidStep();
        bytes memory strategyData = registry.encodeStrategy(steps);
        
        vm.prank(alice);
        vm.expectRevert();
        registry.registerStrategy(tokenId, strategyData);
    }

    function test_ValidateStrategy() public {
        registry.addAllowedProtocol(protocol1);
        
        IStrategyRegistry.Step[] memory steps = new IStrategyRegistry.Step[](1);
        steps[0] = _createValidStep();
        bytes memory strategyData = registry.encodeStrategy(steps);
        
        (bool valid, string memory reason) = registry.validateStrategy(strategyData);
        assertTrue(valid);
        assertEq(reason, "");
    }

    function test_GetStrategySteps() public {
        registry.addAllowedProtocol(protocol1);
        
        // Create strategy with proper token flow
        IStrategyRegistry.Step[] memory steps = new IStrategyRegistry.Step[](2);
        steps[0] = IStrategyRegistry.Step({
            actionType: 0,
            protocol: protocol1,
            tokenIn: token1,
            tokenOut: token2,
            params: ""
        });
        steps[1] = IStrategyRegistry.Step({
            actionType: 0,
            protocol: protocol1,
            tokenIn: token2,
            tokenOut: token1,
            params: ""
        });
        
        bytes memory strategyData = registry.encodeStrategy(steps);
        bytes32 strategyHash = keccak256(strategyData);
        
        vm.startPrank(alice);
        uint256 tokenId = nft.mintStrategy(strategyHash, strategyData);
        registry.registerStrategy(tokenId, strategyData);
        vm.stopPrank();
        
        IStrategyRegistry.Step[] memory retrieved = registry.getStrategySteps(tokenId);
        assertEq(retrieved.length, 2);
        assertEq(retrieved[0].protocol, protocol1);
    }

    function test_GetStep() public {
        registry.addAllowedProtocol(protocol1);
        
        vm.prank(alice);
        uint256 tokenId = nft.mintStrategy(keccak256("test"), hex"1234");
        
        IStrategyRegistry.Step[] memory steps = new IStrategyRegistry.Step[](1);
        steps[0] = _createValidStep();
        bytes memory strategyData = registry.encodeStrategy(steps);
        
        vm.prank(alice);
        registry.registerStrategy(tokenId, strategyData);
        
        IStrategyRegistry.Step memory step = registry.getStep(tokenId, 0);
        assertEq(step.protocol, protocol1);
        assertEq(step.actionType, 0);
    }

    function test_GetStepCount() public {
        registry.addAllowedProtocol(protocol1);
        
        // Create strategy with proper token flow: token1 → token2 → token1
        IStrategyRegistry.Step[] memory steps = new IStrategyRegistry.Step[](3);
        steps[0] = IStrategyRegistry.Step({
            actionType: 0,
            protocol: protocol1,
            tokenIn: token1,
            tokenOut: token2,
            params: ""
        });
        steps[1] = IStrategyRegistry.Step({
            actionType: 0,
            protocol: protocol1,
            tokenIn: token2,
            tokenOut: token1,
            params: ""
        });
        steps[2] = IStrategyRegistry.Step({
            actionType: 0,
            protocol: protocol1,
            tokenIn: token1,
            tokenOut: token2,
            params: ""
        });
        
        bytes memory strategyData = registry.encodeStrategy(steps);
        bytes32 strategyHash = keccak256(strategyData);
        
        vm.startPrank(alice);
        uint256 tokenId = nft.mintStrategy(strategyHash, strategyData);
        registry.registerStrategy(tokenId, strategyData);
        vm.stopPrank();
        
        assertEq(registry.getStepCount(tokenId), 3);
    }

    function test_UpdateStrategyConfig() public {
        registry.addAllowedProtocol(protocol1);
        
        vm.prank(alice);
        uint256 tokenId = nft.mintStrategy(keccak256("test"), hex"1234");
        
        IStrategyRegistry.Step[] memory steps = new IStrategyRegistry.Step[](1);
        steps[0] = _createValidStep();
        bytes memory strategyData = registry.encodeStrategy(steps);
        
        vm.prank(alice);
        registry.registerStrategy(tokenId, strategyData);
        
        vm.prank(alice);
        registry.updateStrategyConfig(tokenId, 100, 1000, false);
        
        IStrategyRegistry.StrategyConfig memory config = registry.getStrategyConfig(tokenId);
        assertEq(config.minDeposit, 100);
        assertEq(config.maxDeposit, 1000);
        assertFalse(config.isPublic);
    }
}

