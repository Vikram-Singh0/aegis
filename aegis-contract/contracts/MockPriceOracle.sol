// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IPriceOracle.sol";

/**
 * @title MockPriceOracle
 * @dev Mock implementation of IPriceOracle for testing and MVP purposes
 * @notice This contract provides mock price feeds with manual price updates
 */
contract MockPriceOracle is IPriceOracle {
    address public immutable owner;

    // Price data structure
    struct PriceData {
        uint256 price; // Price in USD (scaled by 1e18)
        uint256 timestamp; // Last update timestamp
    }

    // Token address => Price data
    mapping(address => PriceData) public prices;

    // Oracle status
    bool public paused;
    uint256 public maxPriceAge = 24 hours; // Default max age: 24 hours

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "ORACLE_PAUSED");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Set the price for a token (owner only)
     * @param token The address of the token
     * @param price The new price in USD (scaled by 1e18)
     */
    function setPrice(
        address token,
        uint256 price
    ) external onlyOwner whenNotPaused {
        require(token != address(0), "INVALID_TOKEN");
        require(price > 0, "INVALID_PRICE");

        uint256 oldPrice = prices[token].price;
        uint256 timestamp = block.timestamp;

        prices[token] = PriceData({price: price, timestamp: timestamp});

        emit PriceUpdated(token, oldPrice, price, timestamp);
    }

    /**
     * @dev Set prices for multiple tokens in one transaction
     * @param tokens Array of token addresses
     * @param tokenPrices Array of corresponding prices
     */
    function setPrices(
        address[] calldata tokens,
        uint256[] calldata tokenPrices
    ) external onlyOwner whenNotPaused {
        require(tokens.length == tokenPrices.length, "ARRAY_LENGTH_MISMATCH");
        require(tokens.length > 0, "EMPTY_ARRAY");

        uint256 timestamp = block.timestamp;

        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            uint256 price = tokenPrices[i];

            require(token != address(0), "INVALID_TOKEN");
            require(price > 0, "INVALID_PRICE");

            uint256 oldPrice = prices[token].price;

            prices[token] = PriceData({price: price, timestamp: timestamp});

            emit PriceUpdated(token, oldPrice, price, timestamp);
        }
    }

    /**
     * @dev Pause the oracle (owner only)
     */
    function pause() external onlyOwner {
        require(!paused, "ALREADY_PAUSED");
        paused = true;
        emit OracleStatusChanged(true, block.timestamp);
    }

    /**
     * @dev Unpause the oracle (owner only)
     */
    function unpause() external onlyOwner {
        require(paused, "NOT_PAUSED");
        paused = false;
        emit OracleStatusChanged(false, block.timestamp);
    }

    /**
     * @dev Set the maximum price age (owner only)
     * @param newMaxAge The new maximum age in seconds
     */
    function setMaxPriceAge(uint256 newMaxAge) external onlyOwner {
        require(newMaxAge > 0, "INVALID_MAX_AGE");
        maxPriceAge = newMaxAge;
    }

    /**
     * @dev Get the price of a token
     * @param token The address of the token
     * @return price The price in USD (scaled by 1e18)
     */
    function getPrice(
        address token
    ) external view override returns (uint256 price) {
        require(!paused, "ORACLE_PAUSED");
        require(token != address(0), "INVALID_TOKEN");

        PriceData memory priceData = prices[token];
        require(priceData.price > 0, "PRICE_NOT_SET");

        return priceData.price;
    }

    /**
     * @dev Get the price of a token with timestamp
     * @param token The address of the token
     * @return price The price in USD (scaled by 1e18)
     * @return timestamp The timestamp when the price was last updated
     */
    function getPriceWithTimestamp(
        address token
    ) external view override returns (uint256 price, uint256 timestamp) {
        require(!paused, "ORACLE_PAUSED");
        require(token != address(0), "INVALID_TOKEN");

        PriceData memory priceData = prices[token];
        require(priceData.price > 0, "PRICE_NOT_SET");

        return (priceData.price, priceData.timestamp);
    }

    /**
     * @dev Check if a price is valid
     * @param token The address of the token
     * @return isValid True if the price is valid
     */
    function isValidPrice(
        address token
    ) external view override returns (bool isValid) {
        if (paused || token == address(0)) {
            return false;
        }

        PriceData memory priceData = prices[token];
        if (priceData.price == 0) {
            return false;
        }

        // Check if price is not stale
        return (block.timestamp - priceData.timestamp) <= maxPriceAge;
    }

    /**
     * @dev Check if the oracle is paused
     * @return isPaused True if the oracle is paused
     */
    function isPaused() external view override returns (bool) {
        return paused;
    }

    /**
     * @dev Get the maximum price age
     * @return maxAge The maximum age in seconds
     */
    function getMaxPriceAge() external view override returns (uint256 maxAge) {
        return maxPriceAge;
    }

    /**
     * @dev Get the last update time for a token
     * @param token The address of the token
     * @return timestamp The timestamp of the last update
     */
    function getLastUpdateTime(
        address token
    ) external view override returns (uint256 timestamp) {
        require(token != address(0), "INVALID_TOKEN");
        return prices[token].timestamp;
    }

    /**
     * @dev Get price data for a token (internal view)
     * @param token The address of the token
     * @return priceData The price data structure
     */
    function getPriceData(
        address token
    ) external view returns (PriceData memory priceData) {
        return prices[token];
    }

    /**
     * @dev Check if a token has a price set
     * @param token The address of the token
     * @return hasPrice True if the token has a price set
     */
    function hasPrice(address token) external view returns (bool) {
        return prices[token].price > 0;
    }
}
