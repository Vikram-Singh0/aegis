// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WETHTest is ERC20 {
    constructor(uint256 initialSupply) ERC20("Wrapped ETH Test", "WETH-Test") {
        _mint(msg.sender, initialSupply);
    }
}
