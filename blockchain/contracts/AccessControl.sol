// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SecureRxAccessControl
 * @dev Role-based access control for the entire SecureRxChain system.
 *      Defines 5 roles: ADMIN, MANUFACTURER, DISTRIBUTOR, PHARMACY, CONSUMER
 */
contract SecureRxAccessControl is AccessControl, Ownable {

    // ─── Role Identifiers ───────────────────────────────────────────────────────
    bytes32 public constant ADMIN_ROLE        = keccak256("ADMIN_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE  = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant PHARMACY_ROLE     = keccak256("PHARMACY_ROLE");
    bytes32 public constant CONSUMER_ROLE     = keccak256("CONSUMER_ROLE");

    // ─── Structs ─────────────────────────────────────────────────────────────────
    struct RoleInfo {
        address account;
        bytes32 role;
        string  organizationName;
        bool    isActive;
        uint256 grantedAt;
    }

    // ─── Storage ─────────────────────────────────────────────────────────────────
    mapping(address => RoleInfo) public roleRegistry;
    address[] public registeredAddresses;

    // ─── Events ──────────────────────────────────────────────────────────────────
    event RoleGranted(bytes32 indexed role, address indexed account, string organizationName, uint256 timestamp);
    event RoleRevoked(bytes32 indexed role, address indexed account, uint256 timestamp);
    event AccountDeactivated(address indexed account, uint256 timestamp);

    // ─── Constructor ─────────────────────────────────────────────────────────────
    constructor(address admin) Ownable(admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _setRoleAdmin(MANUFACTURER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(DISTRIBUTOR_ROLE,  ADMIN_ROLE);
        _setRoleAdmin(PHARMACY_ROLE,     ADMIN_ROLE);
        _setRoleAdmin(CONSUMER_ROLE,     ADMIN_ROLE);

        roleRegistry[admin] = RoleInfo({
            account: admin,
            role: ADMIN_ROLE,
            organizationName: "SecureRxChain Admin",
            isActive: true,
            grantedAt: block.timestamp
        });
        registeredAddresses.push(admin);
    }

    // ─── Role Grant Functions ────────────────────────────────────────────────────

    function grantManufacturer(address account, string calldata orgName)
        external onlyRole(ADMIN_ROLE)
    {
        _registerRole(account, MANUFACTURER_ROLE, orgName);
        emit RoleGranted(MANUFACTURER_ROLE, account, orgName, block.timestamp);
    }

    function grantDistributor(address account, string calldata orgName)
        external onlyRole(ADMIN_ROLE)
    {
        _registerRole(account, DISTRIBUTOR_ROLE, orgName);
        emit RoleGranted(DISTRIBUTOR_ROLE, account, orgName, block.timestamp);
    }

    function grantPharmacy(address account, string calldata orgName)
        external onlyRole(ADMIN_ROLE)
    {
        _registerRole(account, PHARMACY_ROLE, orgName);
        emit RoleGranted(PHARMACY_ROLE, account, orgName, block.timestamp);
    }

    function grantConsumer(address account)
        external onlyRole(ADMIN_ROLE)
    {
        _registerRole(account, CONSUMER_ROLE, "Consumer");
        emit RoleGranted(CONSUMER_ROLE, account, "Consumer", block.timestamp);
    }

    function revokeUserRole(address account)
        external onlyRole(ADMIN_ROLE)
    {
        bytes32 role = roleRegistry[account].role;
        _revokeRole(role, account);
        roleRegistry[account].isActive = false;
        emit RoleRevoked(role, account, block.timestamp);
    }

    // ─── View Functions ──────────────────────────────────────────────────────────

    function isManufacturer(address account) external view returns (bool) {
        return hasRole(MANUFACTURER_ROLE, account) && roleRegistry[account].isActive;
    }

    function isDistributor(address account) external view returns (bool) {
        return hasRole(DISTRIBUTOR_ROLE, account) && roleRegistry[account].isActive;
    }

    function isPharmacy(address account) external view returns (bool) {
        return hasRole(PHARMACY_ROLE, account) && roleRegistry[account].isActive;
    }

    function isConsumer(address account) external view returns (bool) {
        return hasRole(CONSUMER_ROLE, account) && roleRegistry[account].isActive;
    }

    function isAdmin(address account) external view returns (bool) {
        return hasRole(ADMIN_ROLE, account);
    }

    function getAccountRole(address account)
        external view
        returns (bytes32 role, string memory orgName, bool active, uint256 grantedAt)
    {
        RoleInfo memory info = roleRegistry[account];
        return (info.role, info.organizationName, info.isActive, info.grantedAt);
    }

    function getRegisteredCount() external view returns (uint256) {
        return registeredAddresses.length;
    }

    // ─── Internal ────────────────────────────────────────────────────────────────

    function _registerRole(address account, bytes32 role, string memory orgName) internal {
        _grantRole(role, account);
        if (roleRegistry[account].grantedAt == 0) {
            registeredAddresses.push(account);
        }
        roleRegistry[account] = RoleInfo({
            account: account,
            role: role,
            organizationName: orgName,
            isActive: true,
            grantedAt: block.timestamp
        });
    }
}
