// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RiskBounds
 * @dev Defines risk parameter bounds and validation for the protocol
 * @notice This contract establishes safe limits for critical protocol parameters
 * to prevent excessive risk exposure and ensure system stability
 */
contract RiskBounds {
    // Events
    event RiskBoundsUpdated(
        uint256 maxCollateralFactor,
        uint256 minCollateralFactor,
        uint256 maxLiquidationThreshold,
        uint256 minLiquidationThreshold,
        uint256 maxPriceDeviation,
        uint256 maxOracleTimeout
    );

    // Risk parameter bounds
    struct RiskLimits {
        uint256 maxCollateralFactor; // Maximum allowed collateral factor (e.g., 80%)
        uint256 minCollateralFactor; // Minimum allowed collateral factor (e.g., 20%)
        uint256 maxLiquidationThreshold; // Maximum allowed liquidation threshold (e.g., 90%)
        uint256 minLiquidationThreshold; // Minimum allowed liquidation threshold (e.g., 50%)
        uint256 maxPriceDeviation; // Maximum price deviation from oracle (e.g., 10%)
        uint256 maxOracleTimeout; // Maximum oracle timeout in seconds (e.g., 1 hour)
    }

    RiskLimits public riskLimits;

    // Access control
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "RiskBounds: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;

        // Initialize with conservative default bounds
        riskLimits = RiskLimits({
            maxCollateralFactor: 80e16, // 80%
            minCollateralFactor: 20e16, // 20%
            maxLiquidationThreshold: 90e16, // 90%
            minLiquidationThreshold: 50e16, // 50%
            maxPriceDeviation: 10e16, // 10%
            maxOracleTimeout: 3600 // 1 hour
        });
    }

    /**
     * @dev Updates the risk parameter bounds
     * @param _maxCollateralFactor Maximum allowed collateral factor
     * @param _minCollateralFactor Minimum allowed collateral factor
     * @param _maxLiquidationThreshold Maximum allowed liquidation threshold
     * @param _minLiquidationThreshold Minimum allowed liquidation threshold
     * @param _maxPriceDeviation Maximum price deviation from oracle
     * @param _maxOracleTimeout Maximum oracle timeout in seconds
     */
    function updateRiskBounds(
        uint256 _maxCollateralFactor,
        uint256 _minCollateralFactor,
        uint256 _maxLiquidationThreshold,
        uint256 _minLiquidationThreshold,
        uint256 _maxPriceDeviation,
        uint256 _maxOracleTimeout
    ) external onlyOwner {
        // Validate bounds
        require(
            _maxCollateralFactor <= 100e16,
            "RiskBounds: max collateral factor cannot exceed 100%"
        );
        require(
            _minCollateralFactor >= 0,
            "RiskBounds: min collateral factor cannot be negative"
        );
        require(
            _maxCollateralFactor > _minCollateralFactor,
            "RiskBounds: max must be greater than min collateral factor"
        );

        require(
            _maxLiquidationThreshold <= 100e16,
            "RiskBounds: max liquidation threshold cannot exceed 100%"
        );
        require(
            _minLiquidationThreshold >= 0,
            "RiskBounds: min liquidation threshold cannot be negative"
        );
        require(
            _maxLiquidationThreshold > _minLiquidationThreshold,
            "RiskBounds: max must be greater than min liquidation threshold"
        );

        require(
            _maxPriceDeviation <= 50e16,
            "RiskBounds: max price deviation cannot exceed 50%"
        );
        require(
            _maxOracleTimeout <= 86400,
            "RiskBounds: max oracle timeout cannot exceed 24 hours"
        );

        // Ensure liquidation threshold is always higher than collateral factor
        require(
            _minLiquidationThreshold > _maxCollateralFactor,
            "RiskBounds: liquidation threshold must be higher than collateral factor"
        );

        riskLimits = RiskLimits({
            maxCollateralFactor: _maxCollateralFactor,
            minCollateralFactor: _minCollateralFactor,
            maxLiquidationThreshold: _maxLiquidationThreshold,
            minLiquidationThreshold: _minLiquidationThreshold,
            maxPriceDeviation: _maxPriceDeviation,
            maxOracleTimeout: _maxOracleTimeout
        });

        emit RiskBoundsUpdated(
            _maxCollateralFactor,
            _minCollateralFactor,
            _maxLiquidationThreshold,
            _minLiquidationThreshold,
            _maxPriceDeviation,
            _maxOracleTimeout
        );
    }

    /**
     * @dev Validates collateral factor against bounds
     * @param collateralFactor The collateral factor to validate
     * @return True if valid
     */
    function validateCollateralFactor(
        uint256 collateralFactor
    ) external view returns (bool) {
        return
            collateralFactor >= riskLimits.minCollateralFactor &&
            collateralFactor <= riskLimits.maxCollateralFactor;
    }

    /**
     * @dev Validates liquidation threshold against bounds
     * @param liquidationThreshold The liquidation threshold to validate
     * @return True if valid
     */
    function validateLiquidationThreshold(
        uint256 liquidationThreshold
    ) external view returns (bool) {
        return
            liquidationThreshold >= riskLimits.minLiquidationThreshold &&
            liquidationThreshold <= riskLimits.maxLiquidationThreshold;
    }

    /**
     * @dev Validates price deviation against bounds
     * @param currentPrice The current price
     * @param oraclePrice The oracle price
     * @return True if deviation is within bounds
     */
    function validatePriceDeviation(
        uint256 currentPrice,
        uint256 oraclePrice
    ) external view returns (bool) {
        if (oraclePrice == 0) return false;

        uint256 deviation;
        if (currentPrice > oraclePrice) {
            deviation = ((currentPrice - oraclePrice) * 1e18) / oraclePrice;
        } else {
            deviation = ((oraclePrice - currentPrice) * 1e18) / oraclePrice;
        }

        return deviation <= riskLimits.maxPriceDeviation;
    }

    /**
     * @dev Validates oracle timeout against bounds
     * @param lastUpdateTime The last update time
     * @return True if timeout is within bounds
     */
    function validateOracleTimeout(
        uint256 lastUpdateTime
    ) external view returns (bool) {
        return block.timestamp - lastUpdateTime <= riskLimits.maxOracleTimeout;
    }

    /**
     * @dev Validates that liquidation threshold is higher than collateral factor
     * @param collateralFactor The collateral factor
     * @param liquidationThreshold The liquidation threshold
     * @return True if valid
     */
    function validateThresholdHigherThanFactor(
        uint256 collateralFactor,
        uint256 liquidationThreshold
    ) external pure returns (bool) {
        return liquidationThreshold > collateralFactor;
    }

    /**
     * @dev Gets all risk bounds
     * @return The risk limits structure
     */
    function getRiskBounds() external view returns (RiskLimits memory) {
        return riskLimits;
    }

    /**
     * @dev Transfers ownership to a new owner
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(
            newOwner != address(0),
            "RiskBounds: new owner is the zero address"
        );
        owner = newOwner;
    }
}
