// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TimelockController
 * @dev A timelock controller contract for delayed execution of admin actions
 * @notice This contract implements a timelock mechanism where certain operations
 * must be queued and can only be executed after a minimum delay period
 */
contract TimelockController {
    // Events
    event CallScheduled(
        bytes32 indexed id,
        uint256 indexed index,
        address target,
        uint256 value,
        bytes data,
        bytes32 predecessor,
        uint256 delay
    );

    event CallExecuted(
        bytes32 indexed id,
        uint256 indexed index,
        address target,
        uint256 value,
        bytes data
    );

    event Cancelled(bytes32 indexed id);
    event MinDelayChange(uint256 oldDuration, uint256 newDuration);
    event RoleGranted(
        bytes32 indexed role,
        address indexed account,
        address indexed sender
    );
    event RoleRevoked(
        bytes32 indexed role,
        address indexed account,
        address indexed sender
    );

    // Roles
    bytes32 public constant TIMELOCK_ADMIN_ROLE =
        keccak256("TIMELOCK_ADMIN_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant CANCELLER_ROLE = keccak256("CANCELLER_ROLE");

    // Minimum delay for operations (in seconds)
    uint256 public minDelay;

    // Mapping of operation IDs to their scheduled execution time
    mapping(bytes32 => uint256) private _timestamps;

    // Mapping of operation IDs to their status (0 = not scheduled, 1 = scheduled, 2 = executed)
    mapping(bytes32 => uint256) private _states;

    // Mapping of roles to accounts
    mapping(bytes32 => mapping(address => bool)) private _roles;

    // Constants for operation states
    uint256 private constant _DONE_TIMESTAMP = 1;
    uint256 private constant _NOT_READY = 2;
    uint256 private constant _READY = 3;

    modifier onlyRole(bytes32 role) {
        require(
            _roles[role][msg.sender],
            "AccessControl: account does not have role"
        );
        _;
    }

    constructor(
        uint256 minDelay_,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) {
        require(minDelay_ >= 0, "TimelockController: invalid minimum delay");
        require(
            proposers.length > 0,
            "TimelockController: proposers list cannot be empty"
        );
        require(
            executors.length > 0,
            "TimelockController: executors list cannot be empty"
        );

        minDelay = minDelay_;

        // Grant roles
        for (uint256 i = 0; i < proposers.length; ++i) {
            _roles[PROPOSER_ROLE][proposers[i]] = true;
            emit RoleGranted(PROPOSER_ROLE, proposers[i], msg.sender);
        }

        for (uint256 i = 0; i < executors.length; ++i) {
            _roles[EXECUTOR_ROLE][executors[i]] = true;
            emit RoleGranted(EXECUTOR_ROLE, executors[i], msg.sender);
        }

        _roles[TIMELOCK_ADMIN_ROLE][admin] = true;
        emit RoleGranted(TIMELOCK_ADMIN_ROLE, admin, msg.sender);
    }

    /**
     * @dev Schedule a call for execution
     * @param target The target contract address
     * @param value The value to send with the call
     * @param data The calldata for the call
     * @param predecessor The predecessor operation ID (0 for none)
     * @param salt A unique salt for the operation
     * @param delay The delay before execution (must be >= minDelay)
     */
    function schedule(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt,
        uint256 delay
    ) public onlyRole(PROPOSER_ROLE) {
        require(delay >= minDelay, "TimelockController: insufficient delay");
        bytes32 id = hashOperation(target, value, data, predecessor, salt);
        _schedule(id, delay);
        emit CallScheduled(id, 0, target, value, data, predecessor, delay);
    }

    /**
     * @dev Execute a scheduled call
     * @param target The target contract address
     * @param value The value to send with the call
     * @param data The calldata for the call
     * @param predecessor The predecessor operation ID (0 for none)
     * @param salt A unique salt for the operation
     */
    function execute(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt
    ) public payable onlyRole(EXECUTOR_ROLE) {
        bytes32 id = hashOperation(target, value, data, predecessor, salt);
        _beforeCall(id, predecessor);
        _call(id, 0, target, value, data);
        _afterCall(id);
    }

    /**
     * @dev Cancel a scheduled operation
     * @param id The operation ID to cancel
     */
    function cancel(bytes32 id) public onlyRole(CANCELLER_ROLE) {
        require(
            _states[id] == _READY,
            "TimelockController: operation cannot be cancelled"
        );
        delete _timestamps[id];
        delete _states[id];
        emit Cancelled(id);
    }

    /**
     * @dev Update the minimum delay
     * @param newDelay The new minimum delay
     */
    function updateDelay(
        uint256 newDelay
    ) external onlyRole(TIMELOCK_ADMIN_ROLE) {
        require(
            newDelay >= minDelay,
            "TimelockController: new delay must be greater than current delay"
        );
        emit MinDelayChange(minDelay, newDelay);
        minDelay = newDelay;
    }

    /**
     * @dev Grant a role to an account
     * @param role The role to grant
     * @param account The account to grant the role to
     */
    function grantRole(
        bytes32 role,
        address account
    ) public onlyRole(TIMELOCK_ADMIN_ROLE) {
        _roles[role][account] = true;
        emit RoleGranted(role, account, msg.sender);
    }

    /**
     * @dev Revoke a role from an account
     * @param role The role to revoke
     * @param account The account to revoke the role from
     */
    function revokeRole(
        bytes32 role,
        address account
    ) public onlyRole(TIMELOCK_ADMIN_ROLE) {
        _roles[role][account] = false;
        emit RoleRevoked(role, account, msg.sender);
    }

    /**
     * @dev Check if an account has a role
     * @param role The role to check
     * @param account The account to check
     * @return True if the account has the role
     */
    function hasRole(bytes32 role, address account) public view returns (bool) {
        return _roles[role][account];
    }

    /**
     * @dev Get the timestamp when an operation can be executed
     * @param id The operation ID
     * @return The timestamp
     */
    function getTimestamp(bytes32 id) public view returns (uint256) {
        return _timestamps[id];
    }

    /**
     * @dev Check if an operation is ready for execution
     * @param id The operation ID
     * @return True if the operation is ready
     */
    function isOperationReady(bytes32 id) public view returns (bool) {
        return _states[id] == _READY && block.timestamp >= _timestamps[id];
    }

    /**
     * @dev Check if an operation is done
     * @param id The operation ID
     * @return True if the operation is done
     */
    function isOperationDone(bytes32 id) public view returns (bool) {
        return _states[id] == _DONE_TIMESTAMP;
    }

    /**
     * @dev Hash an operation
     * @param target The target contract address
     * @param value The value to send with the call
     * @param data The calldata for the call
     * @param predecessor The predecessor operation ID (0 for none)
     * @param salt A unique salt for the operation
     * @return The operation hash
     */
    function hashOperation(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(target, value, data, predecessor, salt));
    }

    // Internal functions
    function _schedule(bytes32 id, uint256 delay) private {
        require(
            _timestamps[id] == 0,
            "TimelockController: operation already scheduled"
        );
        _timestamps[id] = block.timestamp + delay;
        _states[id] = _READY;
    }

    function _beforeCall(bytes32 id, bytes32 predecessor) private view {
        require(
            predecessor == bytes32(0) || isOperationDone(predecessor),
            "TimelockController: missing dependency"
        );
        require(
            isOperationReady(id),
            "TimelockController: operation is not ready"
        );
    }

    function _call(
        bytes32 id,
        uint256 index,
        address target,
        uint256 value,
        bytes calldata data
    ) private {
        (bool success, ) = target.call{value: value}(data);
        require(success, "TimelockController: underlying transaction reverted");
        emit CallExecuted(id, index, target, value, data);
    }

    function _afterCall(bytes32 id) private {
        _states[id] = _DONE_TIMESTAMP;
    }
}




