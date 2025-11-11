// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/core/StrategyExecutor.sol";
import "../../src/core/StrategyNFT.sol";
import "../../src/core/StrategyRegistry.sol";

contract StrategyExecutorTest is Test {
    StrategyExecutor public executor;
    StrategyNFT public nft;
    StrategyRegistry public registry;
    
    address public alice = address(0x1);
    address public keeper = address(0x2);

    function setUp() public {
        nft = new StrategyNFT();
        registry = new StrategyRegistry(address(nft));
        executor = new StrategyExecutor(address(nft), address(registry));
        
        nft.setStrategyExecutor(address(executor));
        
        vm.label(alice, "Alice");
        vm.label(keeper, "Keeper");
    }

    function test_AddKeeper() public {
        executor.addKeeper(keeper);
        assertTrue(executor.isKeeper(keeper));
    }

    function test_RemoveKeeper() public {
        executor.addKeeper(keeper);
        executor.removeKeeper(keeper);
        assertFalse(executor.isKeeper(keeper));
    }

    function test_SetExecutionCooldown() public {
        executor.setExecutionCooldown(2 hours);
        assertEq(executor.getExecutionCooldown(), 2 hours);
    }

    function test_CanExecute_InitialState() public {
        vm.prank(alice);
        uint256 tokenId = nft.mintStrategy(keccak256("test"), hex"1234");
        
        assertTrue(executor.canExecute(tokenId));
    }

    function test_CanExecute_AfterCooldown() public {
        vm.prank(alice);
        uint256 tokenId = nft.mintStrategy(keccak256("test"), hex"1234");
        
        // Initially can execute
        assertTrue(executor.canExecute(tokenId));
        
        // After some time passes, still can execute
        vm.warp(block.timestamp + 2 hours);
        assertTrue(executor.canExecute(tokenId));
    }

    function test_RevertWhen_NonKeeperExecutes() public {
        vm.prank(alice);
        uint256 tokenId = nft.mintStrategy(keccak256("test"), hex"1234");
        
        vm.prank(alice);
        vm.expectRevert(StrategyExecutor.NotAuthorized.selector);
        executor.executeStrategy(tokenId, 100, alice);
    }

    function test_EmergencyStop() public {
        vm.prank(alice);
        uint256 tokenId = nft.mintStrategy(keccak256("test"), hex"1234");
        
        executor.emergencyStop(tokenId);
        assertFalse(executor.isExecuting(tokenId));
    }

    function test_GetLastExecutionTime() public {
        vm.prank(alice);
        uint256 tokenId = nft.mintStrategy(keccak256("test"), hex"1234");
        
        assertEq(executor.getLastExecutionTime(tokenId), 0);
    }
}

