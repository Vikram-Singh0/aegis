// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPriceOracle
 * @dev Interface for price oracle contracts
 * @notice This interface defines the standard functions for price oracles
 */
interface IPriceOracle {
    /**
     * @dev Emitted when a price is updated
     * @param token The address of the token
     * @param oldPrice The previous price (scaled by 1e18)
     * @param newPrice The new price (scaled by 1e18)
     * @param timestamp The block timestamp when the price was updated
     */
    event PriceUpdated(
        address indexed token,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp
    );

    /**
     * @dev Emitted when the oracle is paused/unpaused
     * @param paused True if paused, false if unpaused
     * @param timestamp The block timestamp when the status changed
     */
    event OracleStatusChanged(bool paused, uint256 timestamp);

    /**
     * @dev Returns the price of a token in USD (scaled by 1e18)
     * @param token The address of the token
     * @return price The price of the token in USD (scaled by 1e18)
     */
    function getPrice(address token) external view returns (uint256 price);

    /**
     * @dev Returns the price of a token in USD with timestamp
     * @param token The address of the token
     * @return price The price of the token in USD (scaled by 1e18)
     * @return timestamp The timestamp when the price was last updated
     */
    function getPriceWithTimestamp(
        address token
    ) external view returns (uint256 price, uint256 timestamp);

    /**
     * @dev Checks if a price is valid (not zero and not stale)
     * @param token The address of the token
     * @return isValid True if the price is valid
     */
    function isValidPrice(address token) external view returns (bool isValid);

    /**
     * @dev Checks if the oracle is currently paused
     * @return isPaused True if the oracle is paused
     */
    function isPaused() external view returns (bool isPaused);

    /**
     * @dev Returns the maximum age for a price to be considered valid (in seconds)
     * @return maxAge The maximum age in seconds
     */
    function getMaxPriceAge() external view returns (uint256 maxAge);

    /**
     * @dev Returns the last update timestamp for a token
     * @param token The address of the token
     * @return timestamp The timestamp of the last update
     */
    function getLastUpdateTime(
        address token
    ) external view returns (uint256 timestamp);
}
