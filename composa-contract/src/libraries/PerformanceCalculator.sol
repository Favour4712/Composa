// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library PerformanceCalculator {
    uint256 constant PRECISION = 1e18;
    uint256 constant SECONDS_PER_YEAR = 365 days;
    uint256 constant BASIS_POINTS = 10000;

    error InvalidDuration();
    error InvalidPrincipal();
    error InsufficientData();
    error DivisionByZero();

    /**
     * @notice Calculates APY (Annual Percentage Yield)
     * @param principal Initial investment amount
     * @param totalReturns Total returns earned
     * @param duration Time period in seconds
     * @return apy APY in basis points (100 = 1%)
     */
    function calculateAPY(
        uint256 principal,
        uint256 totalReturns,
        uint256 duration
    ) internal pure returns (uint256 apy) {
        if (principal == 0) revert InvalidPrincipal();
        if (duration == 0) revert InvalidDuration();

        // Calculate simple return percentage
        uint256 returnRate = (totalReturns * PRECISION) / principal;
        
        // Annualize the return
        uint256 annualized = (returnRate * SECONDS_PER_YEAR) / duration;
        
        // Convert to basis points
        return (annualized * BASIS_POINTS) / PRECISION;
    }

    /**
     * @notice Calculates Sharpe Ratio (risk-adjusted return)
     * @param periodReturns Array of period returns
     * @return sharpe Sharpe ratio scaled by PRECISION
     */
    function calculateSharpeRatio(int256[] memory periodReturns) internal pure returns (int256 sharpe) {
        if (periodReturns.length < 2) revert InsufficientData();

        // Calculate mean return
        int256 sum = 0;
        for (uint256 i = 0; i < periodReturns.length; i++) {
            sum += periodReturns[i];
        }
        int256 mean = sum / int256(periodReturns.length);

        // Calculate standard deviation
        uint256 varianceSum = 0;
        for (uint256 i = 0; i < periodReturns.length; i++) {
            int256 diff = periodReturns[i] - mean;
            varianceSum += uint256(diff * diff);
        }
        uint256 variance = varianceSum / periodReturns.length;
        uint256 stdDev = sqrt(variance);

        if (stdDev == 0) revert DivisionByZero();

        // Sharpe ratio = mean / stdDev
        return (mean * int256(PRECISION)) / int256(stdDev);
    }

    /**
     * @notice Calculates maximum drawdown
     * @param values Array of portfolio values over time
     * @return maxDrawdown Maximum percentage drawdown in basis points
     */
    function calculateMaxDrawdown(uint256[] memory values) internal pure returns (uint256 maxDrawdown) {
        if (values.length < 2) return 0;

        uint256 peak = values[0];
        uint256 maxDraw = 0;

        for (uint256 i = 1; i < values.length; i++) {
            if (values[i] > peak) {
                peak = values[i];
            } else if (peak > 0) {
                uint256 drawdown = ((peak - values[i]) * BASIS_POINTS) / peak;
                if (drawdown > maxDraw) {
                    maxDraw = drawdown;
                }
            }
        }

        return maxDraw;
    }

    /**
     * @notice Calculates total value locked from vault balance
     * @param vaultBalance Current vault token balance
     * @param tokenPrice Price of vault token
     * @return tvl Total value locked
     */
    function calculateTVL(uint256 vaultBalance, uint256 tokenPrice) internal pure returns (uint256 tvl) {
        return (vaultBalance * tokenPrice) / PRECISION;
    }

    /**
     * @notice Calculates share price in a vault
     * @param totalAssets Total assets in vault
     * @param totalShares Total shares issued
     * @return price Share price scaled by PRECISION
     */
    function calculateSharePrice(
        uint256 totalAssets,
        uint256 totalShares
    ) internal pure returns (uint256 price) {
        if (totalShares == 0) return PRECISION;
        return (totalAssets * PRECISION) / totalShares;
    }

    /**
     * @notice Calculates number of shares to mint for deposit
     * @param depositAmount Amount being deposited
     * @param totalAssets Current total assets
     * @param totalShares Current total shares
     * @return shares Number of shares to mint
     */
    function calculateShares(
        uint256 depositAmount,
        uint256 totalAssets,
        uint256 totalShares
    ) internal pure returns (uint256 shares) {
        if (totalShares == 0 || totalAssets == 0) {
            return depositAmount;
        }
        return (depositAmount * totalShares) / totalAssets;
    }

    /**
     * @notice Calculates asset amount for share redemption
     * @param shareAmount Shares being redeemed
     * @param totalAssets Current total assets
     * @param totalShares Current total shares
     * @return assets Amount of assets to return
     */
    function calculateAssets(
        uint256 shareAmount,
        uint256 totalAssets,
        uint256 totalShares
    ) internal pure returns (uint256 assets) {
        if (totalShares == 0) revert DivisionByZero();
        return (shareAmount * totalAssets) / totalShares;
    }

    /**
     * @notice Square root function using Babylonian method
     * @param x Input value
     * @return y Square root of x
     */
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    /**
     * @notice Calculates performance score (0-100) based on returns and risk
     * @param apy Annual percentage yield in basis points
     * @param riskScore Risk score (0-100)
     * @return score Performance score
     */
    function calculatePerformanceScore(
        uint256 apy,
        uint8 riskScore
    ) internal pure returns (uint256 score) {
        // Base score from APY (max 50 points)
        uint256 apyScore = apy / 100; // Convert basis points to percentage
        if (apyScore > 50) apyScore = 50;

        // Risk-adjusted score (max 50 points)
        uint256 riskAdjustment = 50 - ((uint256(riskScore) * 50) / 100);

        return apyScore + riskAdjustment;
    }
}

