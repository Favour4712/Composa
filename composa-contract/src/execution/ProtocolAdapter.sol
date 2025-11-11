// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IProtocolAdapter.sol";

/**
 * @title ProtocolAdapter
 * @notice Abstract base contract for protocol-specific adapters
 */
abstract contract ProtocolAdapter is IProtocolAdapter, Ownable {
    using SafeERC20 for IERC20;

    address public immutable strategyRunner;

    error OnlyRunner();
    error NotImplemented();
    error ZeroAddress();
    error ZeroAmount();
    error InvalidToken();

    modifier onlyRunner() {
        if (msg.sender != strategyRunner) revert OnlyRunner();
        _;
    }

    constructor(address _strategyRunner) Ownable(msg.sender) {
        if (_strategyRunner == address(0)) revert ZeroAddress();
        strategyRunner = _strategyRunner;
    }

    /**
     * @notice Swaps tokens (must be implemented by child contracts)
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        bytes calldata params
    ) external virtual override returns (uint256 amountOut);

    /**
     * @notice Stakes tokens (must be implemented by child contracts)
     */
    function stake(
        address token,
        uint256 amount,
        bytes calldata params
    ) external virtual override returns (uint256);

    /**
     * @notice Unstakes tokens (must be implemented by child contracts)
     */
    function unstake(
        address token,
        uint256 amount,
        bytes calldata params
    ) external virtual override returns (uint256);

    /**
     * @notice Deposits tokens for lending (must be implemented by child contracts)
     */
    function deposit(
        address token,
        uint256 amount,
        bytes calldata params
    ) external virtual override returns (uint256);

    /**
     * @notice Withdraws tokens from lending (must be implemented by child contracts)
     */
    function withdraw(
        address token,
        uint256 amount,
        bytes calldata params
    ) external virtual override returns (uint256);

    /**
     * @notice Harvests rewards (must be implemented by child contracts)
     */
    function harvest(
        address token,
        bytes calldata params
    ) external virtual override returns (uint256);

    /**
     * @notice Gets estimated output amount (must be implemented by child contracts)
     */
    function getOutputAmount(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view virtual override returns (uint256);

    /**
     * @notice Internal helper to validate tokens
     */
    function _validateTokens(address tokenIn, address tokenOut) internal pure {
        if (tokenIn == address(0) || tokenOut == address(0))
            revert InvalidToken();
    }

    /**
     * @notice Internal helper to validate amounts
     */
    function _validateAmount(uint256 amount) internal pure {
        if (amount == 0) revert ZeroAmount();
    }

    /**
     * @notice Emergency withdraw function
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }

    receive() external payable {}
}
