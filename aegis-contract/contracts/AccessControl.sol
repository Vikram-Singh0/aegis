// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AccessControl
 * @dev Provides role-based access control functionality
 * @notice This contract implements a flexible role-based access control system
 * where different roles can be granted to different accounts
 */
contract AccessControl {
    // Events
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
    event RoleAdminChanged(
        bytes32 indexed role,
        bytes32 indexed previousAdminRole,
        bytes32 indexed newAdminRole
    );

    // Role definitions
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant PARAMETER_ROLE = keccak256("PARAMETER_ROLE");

    // Mapping from role to admin role
    mapping(bytes32 => bytes32) private _roleAdmins;

    // Mapping from role to accounts with that role
    mapping(bytes32 => mapping(address => bool)) private _roles;

    // Mapping from account to roles
    mapping(address => bytes32[]) private _accountRoles;

    // Modifiers
    modifier onlyRole(bytes32 role) {
        _checkRole(role, msg.sender);
        _;
    }

    modifier onlyRoleOrOwner(bytes32 role) {
        require(
            hasRole(role, msg.sender) || hasRole(OWNER_ROLE, msg.sender),
            "AccessControl: account does not have required role"
        );
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OWNER_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        _grantRole(PARAMETER_ROLE, msg.sender);

        // Set role admins
        _roleAdmins[OWNER_ROLE] = DEFAULT_ADMIN_ROLE;
        _roleAdmins[ADMIN_ROLE] = OWNER_ROLE;
        _roleAdmins[EMERGENCY_ROLE] = OWNER_ROLE;
        _roleAdmins[PARAMETER_ROLE] = ADMIN_ROLE;
    }

    /**
     * @dev Grants a role to an account
     * @param role The role to grant
     * @param account The account to grant the role to
     */
    function grantRole(
        bytes32 role,
        address account
    ) public onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    /**
     * @dev Revokes a role from an account
     * @param role The role to revoke
     * @param account The account to revoke the role from
     */
    function revokeRole(
        bytes32 role,
        address account
    ) public onlyRole(getRoleAdmin(role)) {
        _revokeRole(role, account);
    }

    /**
     * @dev Renounces a role from the caller
     * @param role The role to renounce
     * @param callerConfirmation The caller's address for confirmation
     */
    function renounceRole(bytes32 role, address callerConfirmation) public {
        require(
            callerConfirmation == msg.sender,
            "AccessControl: can only renounce roles for self"
        );
        _revokeRole(role, msg.sender);
    }

    /**
     * @dev Sets the admin role for a given role
     * @param role The role to set the admin for
     * @param adminRole The admin role
     */
    function setRoleAdmin(
        bytes32 role,
        bytes32 adminRole
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        bytes32 previousAdminRole = _roleAdmins[role];
        _roleAdmins[role] = adminRole;
        emit RoleAdminChanged(role, previousAdminRole, adminRole);
    }

    /**
     * @dev Checks if an account has a role
     * @param role The role to check
     * @param account The account to check
     * @return True if the account has the role
     */
    function hasRole(
        bytes32 role,
        address account
    ) public view virtual returns (bool) {
        return _roles[role][account];
    }

    /**
     * @dev Gets the admin role for a given role
     * @param role The role to get the admin for
     * @return The admin role
     */
    function getRoleAdmin(bytes32 role) public view virtual returns (bytes32) {
        return _roleAdmins[role];
    }

    /**
     * @dev Gets all roles for an account
     * @param account The account to get roles for
     * @return Array of role hashes
     */
    function getAccountRoles(
        address account
    ) public view returns (bytes32[] memory) {
        return _accountRoles[account];
    }

    /**
     * @dev Internal function to grant a role
     * @param role The role to grant
     * @param account The account to grant the role to
     */
    function _grantRole(bytes32 role, address account) internal {
        if (!_roles[role][account]) {
            _roles[role][account] = true;
            _accountRoles[account].push(role);
            emit RoleGranted(role, account, msg.sender);
        }
    }

    /**
     * @dev Internal function to revoke a role
     * @param role The role to revoke
     * @param account The account to revoke the role from
     */
    function _revokeRole(bytes32 role, address account) internal {
        if (_roles[role][account]) {
            _roles[role][account] = false;

            // Remove role from account's role list
            bytes32[] storage roles = _accountRoles[account];
            for (uint256 i = 0; i < roles.length; i++) {
                if (roles[i] == role) {
                    roles[i] = roles[roles.length - 1];
                    roles.pop();
                    break;
                }
            }

            emit RoleRevoked(role, account, msg.sender);
        }
    }

    /**
     * @dev Internal function to check if an account has a role
     * @param role The role to check
     * @param account The account to check
     */
    function _checkRole(bytes32 role, address account) internal view {
        if (!_roles[role][account]) {
            revert(
                string(
                    abi.encodePacked(
                        "AccessControl: account ",
                        _toHexString(account),
                        " is missing role ",
                        _toHexString(abi.encodePacked(role))
                    )
                )
            );
        }
    }

    /**
     * @dev Converts an address to a hex string
     * @param account The address to convert
     * @return The hex string representation
     */
    function _toHexString(
        address account
    ) internal pure returns (string memory) {
        return _toHexString(abi.encodePacked(account));
    }

    /**
     * @dev Converts bytes to a hex string
     * @param value The bytes to convert
     * @return The hex string representation
     */
    function _toHexString(
        bytes memory value
    ) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(2 + value.length * 2);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < value.length; i++) {
            str[2 + i * 2] = alphabet[uint256(uint8(value[i] >> 4))];
            str[2 + i * 2 + 1] = alphabet[uint256(uint8(value[i] & 0x0f))];
        }
        return string(str);
    }
}
