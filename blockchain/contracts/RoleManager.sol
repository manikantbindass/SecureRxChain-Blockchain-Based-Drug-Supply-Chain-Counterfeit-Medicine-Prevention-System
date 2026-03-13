// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RoleManager
 * @dev On-chain role-based access control for SecureRxChain
 */
contract RoleManager is AccessControl, Ownable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant REGULATOR_ROLE = keccak256("REGULATOR_ROLE");

    event RoleGrantedToAddress(bytes32 indexed role, address indexed account, address indexed grantor);
    event RoleRevokedFromAddress(bytes32 indexed role, address indexed account, address indexed revoker);

    constructor(address admin) Ownable(admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    function grantManufacturer(address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(MANUFACTURER_ROLE, account);
        emit RoleGrantedToAddress(MANUFACTURER_ROLE, account, msg.sender);
    }

    function grantDistributor(address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(DISTRIBUTOR_ROLE, account);
        emit RoleGrantedToAddress(DISTRIBUTOR_ROLE, account, msg.sender);
    }

    function grantRetailer(address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(RETAILER_ROLE, account);
        emit RoleGrantedToAddress(RETAILER_ROLE, account, msg.sender);
    }

    function grantRegulator(address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(REGULATOR_ROLE, account);
        emit RoleGrantedToAddress(REGULATOR_ROLE, account, msg.sender);
    }

    function isManufacturer(address account) external view returns (bool) {
        return hasRole(MANUFACTURER_ROLE, account);
    }

    function isDistributor(address account) external view returns (bool) {
        return hasRole(DISTRIBUTOR_ROLE, account);
    }

    function isRetailer(address account) external view returns (bool) {
        return hasRole(RETAILER_ROLE, account);
    }
}
