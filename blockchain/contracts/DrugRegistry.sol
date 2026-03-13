// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./RoleManager.sol";

/**
 * @title DrugRegistry
 * @dev Core contract for drug batch lifecycle management
 */
contract DrugRegistry is ReentrancyGuard {
    RoleManager public roleManager;

    enum BatchStatus { Created, InTransit, Delivered, Sold, Recalled }

    struct DrugBatch {
        bytes32 batchId;
        string drugName;
        string manufacturer;
        uint256 manufactureDate;
        uint256 expiryDate;
        uint256 quantity;
        string ipfsDocHash;     // IPFS CID of regulatory docs
        bytes32 qrCodeHash;     // keccak256 of QR payload
        BatchStatus status;
        address currentHolder;
        address[] transferHistory;
        uint256 createdAt;
        bool isCounterfeit;
    }

    mapping(bytes32 => DrugBatch) public batches;
    mapping(address => bytes32[]) public holderBatches;
    bytes32[] public allBatchIds;

    event BatchCreated(bytes32 indexed batchId, string drugName, address indexed manufacturer, uint256 timestamp);
    event BatchTransferred(bytes32 indexed batchId, address indexed from, address indexed to, uint256 timestamp);
    event BatchRecalled(bytes32 indexed batchId, string reason, uint256 timestamp);
    event CounterfeitFlagged(bytes32 indexed batchId, address indexed reporter, uint256 timestamp);

    modifier onlyManufacturer() {
        require(roleManager.isManufacturer(msg.sender), "DrugRegistry: caller is not a manufacturer");
        _;
    }

    modifier batchExists(bytes32 batchId) {
        require(batches[batchId].createdAt != 0, "DrugRegistry: batch does not exist");
        _;
    }

    constructor(address _roleManager) {
        roleManager = RoleManager(_roleManager);
    }

    function createBatch(
        string calldata drugName,
        uint256 expiryDate,
        uint256 quantity,
        string calldata ipfsDocHash,
        bytes32 qrCodeHash
    ) external onlyManufacturer nonReentrant returns (bytes32) {
        bytes32 batchId = keccak256(
            abi.encodePacked(msg.sender, drugName, block.timestamp, quantity)
        );

        DrugBatch storage batch = batches[batchId];
        batch.batchId = batchId;
        batch.drugName = drugName;
        batch.manufacturer = addressToString(msg.sender);
        batch.manufactureDate = block.timestamp;
        batch.expiryDate = expiryDate;
        batch.quantity = quantity;
        batch.ipfsDocHash = ipfsDocHash;
        batch.qrCodeHash = qrCodeHash;
        batch.status = BatchStatus.Created;
        batch.currentHolder = msg.sender;
        batch.createdAt = block.timestamp;
        batch.transferHistory.push(msg.sender);

        holderBatches[msg.sender].push(batchId);
        allBatchIds.push(batchId);

        emit BatchCreated(batchId, drugName, msg.sender, block.timestamp);
        return batchId;
    }

    function transferBatch(
        bytes32 batchId,
        address to
    ) external batchExists(batchId) nonReentrant {
        DrugBatch storage batch = batches[batchId];
        require(batch.currentHolder == msg.sender, "DrugRegistry: not current holder");
        require(batch.status != BatchStatus.Recalled, "DrugRegistry: batch is recalled");
        require(!batch.isCounterfeit, "DrugRegistry: batch flagged as counterfeit");

        address from = batch.currentHolder;
        batch.currentHolder = to;
        batch.status = BatchStatus.InTransit;
        batch.transferHistory.push(to);
        holderBatches[to].push(batchId);

        emit BatchTransferred(batchId, from, to, block.timestamp);
    }

    function verifyBatch(bytes32 batchId, bytes32 qrHash)
        external view batchExists(batchId)
        returns (bool isAuthentic, BatchStatus status, bool isExpired)
    {
        DrugBatch storage batch = batches[batchId];
        isAuthentic = (batch.qrCodeHash == qrHash) && !batch.isCounterfeit;
        status = batch.status;
        isExpired = block.timestamp > batch.expiryDate;
    }

    function flagCounterfeit(bytes32 batchId) external batchExists(batchId) {
        require(
            roleManager.hasRole(roleManager.REGULATOR_ROLE(), msg.sender) ||
            roleManager.hasRole(roleManager.ADMIN_ROLE(), msg.sender),
            "DrugRegistry: unauthorized"
        );
        batches[batchId].isCounterfeit = true;
        emit CounterfeitFlagged(batchId, msg.sender, block.timestamp);
    }

    function recallBatch(bytes32 batchId, string calldata reason)
        external batchExists(batchId)
    {
        require(
            roleManager.hasRole(roleManager.REGULATOR_ROLE(), msg.sender) ||
            roleManager.hasRole(roleManager.ADMIN_ROLE(), msg.sender),
            "DrugRegistry: unauthorized"
        );
        batches[batchId].status = BatchStatus.Recalled;
        emit BatchRecalled(batchId, reason, block.timestamp);
    }

    function getBatchHistory(bytes32 batchId)
        external view batchExists(batchId)
        returns (address[] memory)
    {
        return batches[batchId].transferHistory;
    }

    function getTotalBatches() external view returns (uint256) {
        return allBatchIds.length;
    }

    function addressToString(address addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0'; str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}
