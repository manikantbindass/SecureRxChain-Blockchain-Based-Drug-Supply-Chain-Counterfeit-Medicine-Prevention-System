// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title QRVerifier
 * @dev Generates and verifies QR code hashes for drug batches
 */
contract QRVerifier {
    event QRGenerated(bytes32 indexed batchId, bytes32 indexed qrHash, uint256 timestamp);
    event QRVerified(bytes32 indexed batchId, address indexed verifier, bool result, uint256 timestamp);

    mapping(bytes32 => bytes32) public batchQRHash;
    mapping(bytes32 => uint256) public verificationCount;

    function generateQRHash(
        bytes32 batchId,
        string calldata drugName,
        address manufacturer,
        uint256 timestamp
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(batchId, drugName, manufacturer, timestamp));
    }

    function registerQR(bytes32 batchId, bytes32 qrHash) external {
        batchQRHash[batchId] = qrHash;
        emit QRGenerated(batchId, qrHash, block.timestamp);
    }

    function verifyQR(bytes32 batchId, bytes32 qrHash) external returns (bool isValid) {
        isValid = batchQRHash[batchId] == qrHash;
        verificationCount[batchId]++;
        emit QRVerified(batchId, msg.sender, isValid, block.timestamp);
    }
}
