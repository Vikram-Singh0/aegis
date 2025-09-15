// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Pausable
 * @dev Provides emergency pause functionality for contracts
 * @notice This contract allows authorized accounts to pause and unpause the contract
 * to halt operations during emergencies or security incidents
 */
contract Pausable {
    // Events
    event Paused(address account);
    event Unpaused(address account);
    event PauserRoleGranted(address indexed account, address indexed sender);
    event PauserRoleRevoked(address indexed account, address indexed sender);

    // State variables
    bool private _paused;
    address private _pauser;

    // Role for pausing/unpausing
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Mapping of accounts to their pauser role status
    mapping(address => bool) private _pausers;

    // Modifiers
    modifier whenNotPaused() {
        require(!_paused, "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(_paused, "Pausable: not paused");
        _;
    }

    modifier onlyPauser() {
        require(_pausers[msg.sender], "Pausable: caller is not a pauser");
        _;
    }

    constructor() {
        _pauser = msg.sender;
        _pausers[msg.sender] = true;
        emit PauserRoleGranted(msg.sender, msg.sender);
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise
     */
    function paused() public view returns (bool) {
        return _paused;
    }

    /**
     * @dev Triggers stopped state
     * Requirements:
     * - The contract must not be paused
     * - The caller must have the pauser role
     */
    function pause() public onlyPauser whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @dev Returns to normal state
     * Requirements:
     * - The contract must be paused
     * - The caller must have the pauser role
     */
    function unpause() public onlyPauser whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }

    /**
     * @dev Grants the pauser role to an account
     * @param account The account to grant the pauser role to
     */
    function grantPauserRole(address account) public {
        require(
            _pausers[msg.sender] || msg.sender == _pauser,
            "Pausable: caller is not authorized"
        );
        _pausers[account] = true;
        emit PauserRoleGranted(account, msg.sender);
    }

    /**
     * @dev Revokes the pauser role from an account
     * @param account The account to revoke the pauser role from
     */
    function revokePauserRole(address account) public {
        require(
            _pausers[msg.sender] || msg.sender == _pauser,
            "Pausable: caller is not authorized"
        );
        require(
            account != _pauser,
            "Pausable: cannot revoke pauser role from primary pauser"
        );
        _pausers[account] = false;
        emit PauserRoleRevoked(account, msg.sender);
    }

    /**
     * @dev Checks if an account has the pauser role
     * @param account The account to check
     * @return True if the account has the pauser role
     */
    function hasPauserRole(address account) public view returns (bool) {
        return _pausers[account];
    }

    /**
     * @dev Returns the primary pauser address
     * @return The primary pauser address
     */
    function pauser() public view returns (address) {
        return _pauser;
    }
}




