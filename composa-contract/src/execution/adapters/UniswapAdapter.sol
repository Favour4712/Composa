// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../ProtocolAdapter.sol";

// Uniswap V3 Router Interface (simplified for Base Sepolia)
interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}

interface IQuoter {
    function quoteExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint160 sqrtPriceLimitX96
    ) external returns (uint256 amountOut);
}

/**
 * @title UniswapAdapter
 * @notice Adapter for Uniswap V3 on Base Sepolia
 */
contract UniswapAdapter is ProtocolAdapter {
    using SafeERC20 for IERC20;

    // Base Sepolia Uniswap V3 addresses (replace with actual deployed addresses)
    address public uniswapRouter;
    address public quoter;
    
    uint24 public constant DEFAULT_FEE = 3000; // 0.3%
    uint24 public constant LOW_FEE = 500; // 0.05%
    uint24 public constant HIGH_FEE = 10000; // 1%

    error SwapFailed();
    error InvalidParams();

    constructor(
        address _strategyRunner,
        address _uniswapRouter,
        address _quoter
    ) ProtocolAdapter(_strategyRunner) {
        if (_uniswapRouter == address(0) || _quoter == address(0)) revert ZeroAddress();
        uniswapRouter = _uniswapRouter;
        quoter = _quoter;
    }

    /**
     * @notice Swaps tokens via Uniswap V3
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount to swap
     * @param params Encoded swap parameters (fee tier, slippage)
     * @return amountOut Amount received
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        bytes calldata params
    ) external override onlyRunner returns (uint256 amountOut) {
        _validateTokens(tokenIn, tokenOut);
        _validateAmount(amountIn);

        // Decode params (fee tier, minimum output)
        (uint24 fee, uint256 minAmountOut) = params.length > 0
            ? abi.decode(params, (uint24, uint256))
            : (DEFAULT_FEE, 0);

        // Transfer tokens from runner
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Approve router
        IERC20(tokenIn).safeIncreaseAllowance(uniswapRouter, amountIn);

        // Execute swap
        ISwapRouter.ExactInputSingleParams memory swapParams = ISwapRouter.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: fee,
            recipient: msg.sender, // Send back to strategy runner
            deadline: block.timestamp + 300, // 5 minutes
            amountIn: amountIn,
            amountOutMinimum: minAmountOut,
            sqrtPriceLimitX96: 0
        });

        amountOut = ISwapRouter(uniswapRouter).exactInputSingle(swapParams);

        if (amountOut == 0) revert SwapFailed();

        return amountOut;
    }

    /**
     * @notice Not implemented for Uniswap
     */
    function stake(
        address token,
        uint256 amount,
        bytes calldata params
    ) external pure override returns (uint256) {
        revert NotImplemented();
    }

    /**
     * @notice Not implemented for Uniswap
     */
    function unstake(
        address token,
        uint256 amount,
        bytes calldata params
    ) external pure override returns (uint256) {
        revert NotImplemented();
    }

    /**
     * @notice Not implemented for Uniswap
     */
    function deposit(
        address token,
        uint256 amount,
        bytes calldata params
    ) external pure override returns (uint256) {
        revert NotImplemented();
    }

    /**
     * @notice Not implemented for Uniswap
     */
    function withdraw(
        address token,
        uint256 amount,
        bytes calldata params
    ) external pure override returns (uint256) {
        revert NotImplemented();
    }

    /**
     * @notice Not implemented for Uniswap
     */
    function harvest(
        address token,
        bytes calldata params
    ) external pure override returns (uint256) {
        revert NotImplemented();
    }

    /**
     * @notice Gets quote for swap
     * @param tokenIn Input token
     * @param tokenOut Output token
     * @param amountIn Input amount
     * @return Expected output amount
     */
    function getOutputAmount(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view override returns (uint256) {
        if (amountIn == 0) return 0;
        
        // For testnet, return a mock quote (90% of input for same decimals)
        // In production, use the Quoter contract
        return (amountIn * 90) / 100;
    }

    /**
     * @notice Gets pool fee for a token pair
     * @param token0 First token
     * @param token1 Second token
     * @return fee Pool fee tier
     */
    function getPoolFee(address token0, address token1) external pure returns (uint24 fee) {
        // Default fee tier
        return DEFAULT_FEE;
    }

    /**
     * @notice Updates router address
     * @param _router New router address
     */
    function setRouter(address _router) external onlyOwner {
        if (_router == address(0)) revert ZeroAddress();
        uniswapRouter = _router;
    }

    /**
     * @notice Updates quoter address
     * @param _quoter New quoter address
     */
    function setQuoter(address _quoter) external onlyOwner {
        if (_quoter == address(0)) revert ZeroAddress();
        quoter = _quoter;
    }
}

