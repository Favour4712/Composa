// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/core/StrategyNFT.sol";

contract StrategyNFTTest is Test {
    StrategyNFT public nft;
    
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public executor = address(0x3);
    
    bytes32 public testHash = keccak256("test strategy");
    bytes public testData = hex"1234567890";

    event StrategyMinted(uint256 indexed tokenId, address indexed creator, bytes32 strategyHash);
    event StrategyForked(uint256 indexed newTokenId, uint256 indexed parentTokenId, address indexed creator);
    event StrategyDeactivated(uint256 indexed tokenId);

    function setUp() public {
        nft = new StrategyNFT();
        nft.setStrategyExecutor(executor);
        
        vm.label(alice, "Alice");
        vm.label(bob, "Bob");
        vm.label(executor, "Executor");
    }

    function test_MintStrategy() public {
        vm.startPrank(alice);
        
        vm.expectEmit(true, true, false, true);
        emit StrategyMinted(1, alice, testHash);
        
        uint256 tokenId = nft.mintStrategy(testHash, testData);
        
        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(tokenId), alice);
        assertEq(nft.totalStrategies(), 1);
        
        IStrategyNFT.Strategy memory strategy = nft.getStrategy(tokenId);
        assertEq(strategy.strategyHash, testHash);
        assertEq(strategy.creator, alice);
        assertTrue(strategy.isActive);
        assertEq(strategy.forkCount, 0);
        assertEq(strategy.parentTokenId, 0);
        
        vm.stopPrank();
    }

    function test_RevertWhen_MintingDuplicateStrategy() public {
        vm.startPrank(alice);
        
        nft.mintStrategy(testHash, testData);
        
        vm.expectRevert(StrategyNFT.StrategyAlreadyExists.selector);
        nft.mintStrategy(testHash, testData);
        
        vm.stopPrank();
    }

    function test_ForkStrategy() public {
        // Alice creates original strategy
        vm.prank(alice);
        uint256 parentId = nft.mintStrategy(testHash, testData);
        
        // Bob forks it
        bytes memory newData = hex"abcdef";
        vm.startPrank(bob);
        
        vm.expectEmit(true, true, true, false);
        emit StrategyForked(2, parentId, bob);
        
        uint256 forkedId = nft.forkStrategy(parentId, newData);
        
        assertEq(forkedId, 2);
        assertEq(nft.ownerOf(forkedId), bob);
        
        IStrategyNFT.Strategy memory forked = nft.getStrategy(forkedId);
        assertEq(forked.creator, bob);
        assertEq(forked.parentTokenId, parentId);
        assertTrue(forked.isActive);
        
        // Check parent fork count increased
        IStrategyNFT.Strategy memory parent = nft.getStrategy(parentId);
        assertEq(parent.forkCount, 1);
        
        vm.stopPrank();
    }

    function test_RevertWhen_ForkingInactiveStrategy() public {
        vm.prank(alice);
        uint256 tokenId = nft.mintStrategy(testHash, testData);
        
        vm.prank(alice);
        nft.deactivateStrategy(tokenId);
        
        vm.prank(bob);
        vm.expectRevert(StrategyNFT.StrategyNotActive.selector);
        nft.forkStrategy(tokenId, hex"1234");
    }

    function test_DeactivateStrategy() public {
        vm.startPrank(alice);
        
        uint256 tokenId = nft.mintStrategy(testHash, testData);
        assertTrue(nft.isStrategyActive(tokenId));
        
        vm.expectEmit(true, false, false, false);
        emit StrategyDeactivated(tokenId);
        
        nft.deactivateStrategy(tokenId);
        assertFalse(nft.isStrategyActive(tokenId));
        
        vm.stopPrank();
    }

    function test_RevertWhen_NonOwnerDeactivates() public {
        vm.prank(alice);
        uint256 tokenId = nft.mintStrategy(testHash, testData);
        
        vm.prank(bob);
        vm.expectRevert(StrategyNFT.NotStrategyOwner.selector);
        nft.deactivateStrategy(tokenId);
    }

    function test_UpdateMetadata() public {
        vm.prank(alice);
        uint256 tokenId = nft.mintStrategy(testHash, testData);
        
        vm.prank(executor);
        nft.updateMetadata(tokenId, 1000 ether, 95);
        
        IStrategyNFT.Strategy memory strategy = nft.getStrategy(tokenId);
        assertEq(strategy.totalValueLocked, 1000 ether);
        assertEq(strategy.performanceScore, 95);
    }

    function test_RevertWhen_NonExecutorUpdatesMetadata() public {
        vm.prank(alice);
        uint256 tokenId = nft.mintStrategy(testHash, testData);
        
        vm.prank(bob);
        vm.expectRevert(StrategyNFT.OnlyExecutor.selector);
        nft.updateMetadata(tokenId, 1000 ether, 95);
    }

    function test_GetStrategyCreator() public {
        vm.prank(alice);
        uint256 tokenId = nft.mintStrategy(testHash, testData);
        
        assertEq(nft.getStrategyCreator(tokenId), alice);
    }

    function test_GetParentStrategy() public {
        vm.prank(alice);
        uint256 parentId = nft.mintStrategy(testHash, testData);
        
        vm.prank(bob);
        uint256 forkedId = nft.forkStrategy(parentId, hex"abcd");
        
        assertEq(nft.getParentStrategy(forkedId), parentId);
        assertEq(nft.getParentStrategy(parentId), 0); // No parent
    }

    function test_SupportsInterface() public {
        // ERC721
        assertTrue(nft.supportsInterface(0x80ac58cd));
        // ERC721Enumerable
        assertTrue(nft.supportsInterface(0x780e9d63));
        // ERC2981
        assertTrue(nft.supportsInterface(0x2a55205a));
    }

    function test_RoyaltyInfo() public {
        vm.prank(alice);
        uint256 tokenId = nft.mintStrategy(testHash, testData);
        
        (address receiver, uint256 royaltyAmount) = nft.royaltyInfo(tokenId, 1 ether);
        
        assertEq(receiver, alice);
        assertEq(royaltyAmount, 0.05 ether); // 5%
    }
}

