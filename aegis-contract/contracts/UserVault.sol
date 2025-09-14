// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20Minimal {
    function transfer(address to, uint256 amount) external returns (bool);
}

/**
 * UserVault
 * - Owned by the user (EOA or smart account)
 * - Controlled by a single controller (the CollateralManager)
 * - Holds the user's collateral tokens in their own address
 * - Controller can instruct the vault to send tokens to specific recipients
 */
contract UserVault {
    address public immutable owner; // user who owns this vault
    address public immutable controller; // protocol CollateralManager

    modifier onlyController() {
        require(msg.sender == controller, "NOT_CONTROLLER");
        _;
    }

    constructor(address _owner, address _controller) {
        require(_owner != address(0) && _controller != address(0), "ZERO_ADDR");
        owner = _owner;
        controller = _controller;
    }

    /**
     * Send tokens from the vault.
     * - Only callable by controller (CollateralManager)
     * - Used for withdrawals back to owner and for liquidations to liquidators
     */
    function sendToken(
        address token,
        address to,
        uint256 amount
    ) external onlyController {
        require(to != address(0), "BAD_TO");
        require(IERC20Minimal(token).transfer(to, amount), "TRANSFER_FAIL");
    }
}


