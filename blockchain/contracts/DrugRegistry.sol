// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AccessControl.sol";

/**
 * @title DrugRegistry
 * @dev Registers drug batches on-chain with full metadata.
 *      Stores batchId, drugName, manufacturer, dates, quantity.
 *      Emits events for every registration and ownership change.
 */
contract DrugRegistry is ReentrancyGuard {

    SecureRxAccessControl public accessControl;

    // ─── Structs ─────────────────────────────────────────────────────────────────
    struct DrugBatch {
        bytes32   batchId;
        string    drugName;
        string    genericName;
        string    dosageForm;          // tablet, capsule, injection, etc.
        string    strength;            // e.g. "500mg"
        address   manufacturer;        // wallet address of manufacturer
        string    manufacturerName;
        uint256   manufacturingDate;
        uint256   expiryDate;
        uint256   quantity;            // units
        string    ipfsCID;             // IPFS CID for regulatory docs
        bytes32   qrCodeHash;          // keccak256 of QR payload
        address   currentOwner;
        bool      isRecalled;
        bool      isCounterfeit;
        uint256   registeredAt;
    }

    struct OwnershipRecord {
        address  owner;
        uint256  timestamp;
        string   action;              // "REGISTERED", "TRANSFERRED", "RECALLED"
    }

    // ─── Storage ─────────────────────────────────────────────────────────────────
    mapping(bytes32 => DrugBatch)           public batches;
    mapping(bytes32 => OwnershipRecord[])   public ownershipHistory;
    mapping(address => bytes32[])           public manufacturerBatches;
    mapping(address => bytes32[])           public ownerBatches;
    bytes32[]                               public allBatchIds;

    // ─── Events ──────────────────────────────────────────────────────────────────
    event BatchRegistered(
        bytes32 indexed batchId,
        string  drugName,
        address indexed manufacturer,
        uint256 quantity,
        uint256 expiryDate,
        uint256 timestamp
    );
    event OwnershipTransferred(
        bytes32 indexed batchId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    event BatchRecalled(
        bytes32 indexed batchId,
        address indexed recalledBy,
        string  reason,
        uint256 timestamp
    );
    event CounterfeitFlagged(
        bytes32 indexed batchId,
        address indexed flaggedBy,
        uint256 timestamp
    );

    // ─── Modifiers ───────────────────────────────────────────────────────────────
    modifier onlyManufacturer() {
        require(
            accessControl.isManufacturer(msg.sender),
            "DrugRegistry: caller is not a registered manufacturer"
        );
        _;
    }

    modifier onlyAdmin() {
        require(
            accessControl.isAdmin(msg.sender),
            "DrugRegistry: caller is not admin"
        );
        _;
    }

    modifier batchExists(bytes32 batchId) {
        require(batches[batchId].registeredAt != 0, "DrugRegistry: batch does not exist");
        _;
    }

    modifier notRecalled(bytes32 batchId) {
        require(!batches[batchId].isRecalled, "DrugRegistry: batch has been recalled");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────────
    constructor(address _accessControl) {
        accessControl = SecureRxAccessControl(_accessControl);
    }

    // ─── Core Functions ──────────────────────────────────────────────────────────

    /**
     * @dev Register a new drug batch on-chain.
     * @return batchId The unique keccak256 identifier for this batch
     */
    function registerBatch(
        string  calldata drugName,
        string  calldata genericName,
        string  calldata dosageForm,
        string  calldata strength,
        string  calldata manufacturerName,
        uint256          manufacturingDate,
        uint256          expiryDate,
        uint256          quantity,
        string  calldata ipfsCID,
        bytes32          qrCodeHash
    ) external onlyManufacturer nonReentrant returns (bytes32 batchId) {
        require(expiryDate > block.timestamp,    "DrugRegistry: expiry date must be in the future");
        require(expiryDate > manufacturingDate,  "DrugRegistry: expiry must be after manufacturing date");
        require(quantity > 0,                    "DrugRegistry: quantity must be > 0");
        require(bytes(drugName).length > 0,      "DrugRegistry: drug name cannot be empty");

        batchId = keccak256(
            abi.encodePacked(
                msg.sender,
                drugName,
                manufacturingDate,
                quantity,
                block.timestamp,
                block.number
            )
        );

        require(batches[batchId].registeredAt == 0, "DrugRegistry: batch ID collision");

        batches[batchId] = DrugBatch({
            batchId:          batchId,
            drugName:         drugName,
            genericName:      genericName,
            dosageForm:       dosageForm,
            strength:         strength,
            manufacturer:     msg.sender,
            manufacturerName: manufacturerName,
            manufacturingDate: manufacturingDate,
            expiryDate:       expiryDate,
            quantity:         quantity,
            ipfsCID:          ipfsCID,
            qrCodeHash:       qrCodeHash,
            currentOwner:     msg.sender,
            isRecalled:       false,
            isCounterfeit:    false,
            registeredAt:     block.timestamp
        });

        ownershipHistory[batchId].push(OwnershipRecord({
            owner:     msg.sender,
            timestamp: block.timestamp,
            action:    "REGISTERED"
        }));

        manufacturerBatches[msg.sender].push(batchId);
        ownerBatches[msg.sender].push(batchId);
        allBatchIds.push(batchId);

        emit BatchRegistered(batchId, drugName, msg.sender, quantity, expiryDate, block.timestamp);
        return batchId;
    }

    /**
     * @dev Transfer ownership of a batch to a new address.
     */
    function transferOwnership(
        bytes32 batchId,
        address newOwner,
        string calldata action
    ) external batchExists(batchId) notRecalled(batchId) nonReentrant {
        DrugBatch storage batch = batches[batchId];
        require(batch.currentOwner == msg.sender, "DrugRegistry: caller is not current owner");
        require(newOwner != address(0),           "DrugRegistry: new owner is zero address");
        require(!batch.isCounterfeit,             "DrugRegistry: cannot transfer counterfeit batch");

        address previousOwner = batch.currentOwner;
        batch.currentOwner = newOwner;

        ownershipHistory[batchId].push(OwnershipRecord({
            owner:     newOwner,
            timestamp: block.timestamp,
            action:    action
        }));

        ownerBatches[newOwner].push(batchId);

        emit OwnershipTransferred(batchId, previousOwner, newOwner, block.timestamp);
    }

    /**
     * @dev Recall a drug batch — marks it as recalled, blocks transfers.
     */
    function recallBatch(bytes32 batchId, string calldata reason)
        external onlyAdmin batchExists(batchId)
    {
        batches[batchId].isRecalled = true;
        ownershipHistory[batchId].push(OwnershipRecord({
            owner:     msg.sender,
            timestamp: block.timestamp,
            action:    string(abi.encodePacked("RECALLED: ", reason))
        }));
        emit BatchRecalled(batchId, msg.sender, reason, block.timestamp);
    }

    /**
     * @dev Flag a batch as counterfeit.
     */
    function flagCounterfeit(bytes32 batchId)
        external onlyAdmin batchExists(batchId)
    {
        batches[batchId].isCounterfeit = true;
        emit CounterfeitFlagged(batchId, msg.sender, block.timestamp);
    }

    // ─── View Functions ──────────────────────────────────────────────────────────

    function getBatch(bytes32 batchId)
        external view batchExists(batchId)
        returns (DrugBatch memory)
    {
        return batches[batchId];
    }

    function getOwnershipHistory(bytes32 batchId)
        external view batchExists(batchId)
        returns (OwnershipRecord[] memory)
    {
        return ownershipHistory[batchId];
    }

    function getManufacturerBatches(address manufacturer)
        external view returns (bytes32[] memory)
    {
        return manufacturerBatches[manufacturer];
    }

    function isExpired(bytes32 batchId)
        external view batchExists(batchId)
        returns (bool)
    {
        return block.timestamp > batches[batchId].expiryDate;
    }

    function getTotalBatches() external view returns (uint256) {
        return allBatchIds.length;
    }
}
