// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AccessControl.sol";
import "./DrugRegistry.sol";

/**
 * @title SupplyChain
 * @dev Implements a 6-state supply chain state machine:
 *
 *   Manufactured → InTransit → Distributed → Retailed → Sold → Quarantined
 *
 * Each state transition is role-gated and emits an event.
 * Full history of all transitions is stored on-chain.
 */
contract SupplyChain is ReentrancyGuard {

    SecureRxAccessControl public accessControl;
    DrugRegistry          public drugRegistry;

    // ─── State Machine ───────────────────────────────────────────────────────────
    enum DrugState {
        Manufactured,   // 0 — batch just registered by manufacturer
        InTransit,      // 1 — picked up by distributor
        Distributed,    // 2 — delivered to pharmacy/retailer
        Retailed,       // 3 — on pharmacy shelf
        Sold,           // 4 — dispensed to consumer
        Quarantined     // 5 — flagged / recalled / suspicious
    }

    // ─── Structs ─────────────────────────────────────────────────────────────────
    struct StateTransition {
        DrugState   fromState;
        DrugState   toState;
        address     initiatedBy;
        string      actorRole;       // human-readable role name
        string      location;        // GPS / city / facility name (optional)
        string      notes;
        uint256     timestamp;
        bytes32     txMetaHash;      // keccak256 of off-chain metadata
    }

    struct DrugLifecycle {
        bytes32    batchId;
        DrugState  currentState;
        address    currentCustodian;
        uint256    lastUpdated;
        bool       isActive;
    }

    // ─── Storage ─────────────────────────────────────────────────────────────────
    mapping(bytes32 => DrugLifecycle)         public lifecycles;
    mapping(bytes32 => StateTransition[])     public transitionHistory;
    mapping(address => bytes32[])             public custodianBatches;

    // ─── Events ──────────────────────────────────────────────────────────────────
    event DrugTransferred(
        bytes32   indexed batchId,
        address   indexed from,
        address   indexed to,
        DrugState          newState,
        string             location,
        uint256            timestamp
    );
    event StateUpdated(
        bytes32   indexed batchId,
        DrugState          oldState,
        DrugState          newState,
        address   indexed  updatedBy,
        uint256            timestamp
    );
    event BatchQuarantined(
        bytes32   indexed batchId,
        address   indexed quarantinedBy,
        string             reason,
        uint256            timestamp
    );
    event BatchInitialized(
        bytes32   indexed batchId,
        address   indexed manufacturer,
        uint256            timestamp
    );

    // ─── Modifiers ───────────────────────────────────────────────────────────────
    modifier lifecycleExists(bytes32 batchId) {
        require(lifecycles[batchId].isActive, "SupplyChain: batch not initialized in supply chain");
        _;
    }

    modifier notQuarantined(bytes32 batchId) {
        require(
            lifecycles[batchId].currentState != DrugState.Quarantined,
            "SupplyChain: batch is quarantined"
        );
        _;
    }

    modifier onlyManufacturer() {
        require(accessControl.isManufacturer(msg.sender), "SupplyChain: not a manufacturer");
        _;
    }

    modifier onlyDistributor() {
        require(accessControl.isDistributor(msg.sender), "SupplyChain: not a distributor");
        _;
    }

    modifier onlyPharmacy() {
        require(accessControl.isPharmacy(msg.sender), "SupplyChain: not a pharmacy");
        _;
    }

    modifier onlyAdminOrManufacturer() {
        require(
            accessControl.isAdmin(msg.sender) || accessControl.isManufacturer(msg.sender),
            "SupplyChain: not admin or manufacturer"
        );
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────────
    constructor(address _accessControl, address _drugRegistry) {
        accessControl = SecureRxAccessControl(_accessControl);
        drugRegistry  = DrugRegistry(_drugRegistry);
    }

    // ─── Lifecycle Init ──────────────────────────────────────────────────────────

    /**
     * @dev Initialize a registered batch into the supply chain. Called by manufacturer
     *      after DrugRegistry.registerBatch().
     */
    function initializeBatch(
        bytes32       batchId,
        string calldata location,
        string calldata notes
    ) external onlyManufacturer nonReentrant {
        require(!lifecycles[batchId].isActive, "SupplyChain: already initialized");

        // Verify batch exists in registry
        DrugRegistry.DrugBatch memory batch = drugRegistry.getBatch(batchId);
        require(batch.manufacturer == msg.sender, "SupplyChain: not batch manufacturer");

        lifecycles[batchId] = DrugLifecycle({
            batchId:          batchId,
            currentState:     DrugState.Manufactured,
            currentCustodian: msg.sender,
            lastUpdated:      block.timestamp,
            isActive:         true
        });

        transitionHistory[batchId].push(StateTransition({
            fromState:   DrugState.Manufactured,
            toState:     DrugState.Manufactured,
            initiatedBy: msg.sender,
            actorRole:   "MANUFACTURER",
            location:    location,
            notes:       notes,
            timestamp:   block.timestamp,
            txMetaHash:  keccak256(abi.encodePacked(batchId, msg.sender, block.timestamp))
        }));

        custodianBatches[msg.sender].push(batchId);
        emit BatchInitialized(batchId, msg.sender, block.timestamp);
    }

    // ─── State Machine Transitions ───────────────────────────────────────────────

    /**
     * @dev Transfer drug from manufacturer to distributor.
     *      State: Manufactured → InTransit
     */
    function transferToDistributor(
        bytes32       batchId,
        address       distributor,
        string calldata location,
        string calldata notes
    ) external onlyManufacturer lifecycleExists(batchId) notQuarantined(batchId) nonReentrant {
        DrugLifecycle storage lc = lifecycles[batchId];
        require(lc.currentState == DrugState.Manufactured, "SupplyChain: invalid state transition");
        require(accessControl.isDistributor(distributor),  "SupplyChain: target is not a distributor");
        require(lc.currentCustodian == msg.sender,         "SupplyChain: not current custodian");

        _executeTransfer(batchId, lc, distributor, DrugState.InTransit, "MANUFACTURER", location, notes);
    }

    /**
     * @dev Distributor marks delivery complete.
     *      State: InTransit → Distributed
     */
    function markDistributed(
        bytes32       batchId,
        address       pharmacy,
        string calldata location,
        string calldata notes
    ) external onlyDistributor lifecycleExists(batchId) notQuarantined(batchId) nonReentrant {
        DrugLifecycle storage lc = lifecycles[batchId];
        require(lc.currentState == DrugState.InTransit, "SupplyChain: invalid state transition");
        require(accessControl.isPharmacy(pharmacy),     "SupplyChain: target is not a pharmacy");
        require(lc.currentCustodian == msg.sender,      "SupplyChain: not current custodian");

        _executeTransfer(batchId, lc, pharmacy, DrugState.Distributed, "DISTRIBUTOR", location, notes);
    }

    /**
     * @dev Pharmacy shelves the drug.
     *      State: Distributed → Retailed
     */
    function markRetailed(
        bytes32       batchId,
        string calldata location,
        string calldata notes
    ) external onlyPharmacy lifecycleExists(batchId) notQuarantined(batchId) nonReentrant {
        DrugLifecycle storage lc = lifecycles[batchId];
        require(lc.currentState == DrugState.Distributed, "SupplyChain: invalid state transition");
        require(lc.currentCustodian == msg.sender,        "SupplyChain: not current custodian");

        _recordTransition(batchId, lc, msg.sender, DrugState.Retailed, "PHARMACY", location, notes);
        emit StateUpdated(batchId, DrugState.Distributed, DrugState.Retailed, msg.sender, block.timestamp);
    }

    /**
     * @dev Pharmacy dispenses to consumer.
     *      State: Retailed → Sold
     */
    function markSold(
        bytes32       batchId,
        address       consumer,
        string calldata location,
        string calldata notes
    ) external onlyPharmacy lifecycleExists(batchId) notQuarantined(batchId) nonReentrant {
        DrugLifecycle storage lc = lifecycles[batchId];
        require(lc.currentState == DrugState.Retailed, "SupplyChain: invalid state transition");
        require(lc.currentCustodian == msg.sender,     "SupplyChain: not current custodian");

        _executeTransfer(batchId, lc, consumer, DrugState.Sold, "PHARMACY", location, notes);
    }

    /**
     * @dev Universal state update — for admin overrides or edge cases.
     */
    function updateState(
        bytes32       batchId,
        DrugState     newState,
        string calldata location,
        string calldata notes
    ) external lifecycleExists(batchId) nonReentrant {
        require(
            accessControl.isAdmin(msg.sender),
            "SupplyChain: only admin can perform arbitrary state update"
        );
        DrugLifecycle storage lc = lifecycles[batchId];
        DrugState oldState = lc.currentState;

        _recordTransition(batchId, lc, msg.sender, newState, "ADMIN", location, notes);
        emit StateUpdated(batchId, oldState, newState, msg.sender, block.timestamp);
    }

    /**
     * @dev Quarantine a batch due to suspicion or anomaly.
     *      Can be triggered by admin at any state.
     */
    function quarantineBatch(
        bytes32       batchId,
        string calldata reason
    ) external lifecycleExists(batchId) nonReentrant {
        require(
            accessControl.isAdmin(msg.sender) || accessControl.isManufacturer(msg.sender),
            "SupplyChain: not authorized to quarantine"
        );
        DrugLifecycle storage lc = lifecycles[batchId];
        require(lc.currentState != DrugState.Quarantined, "SupplyChain: already quarantined");

        DrugState oldState = lc.currentState;
        _recordTransition(
            batchId, lc, msg.sender, DrugState.Quarantined, "ADMIN",
            "QUARANTINE",
            string(abi.encodePacked("Quarantined: ", reason))
        );
        emit BatchQuarantined(batchId, msg.sender, reason, block.timestamp);
        emit StateUpdated(batchId, oldState, DrugState.Quarantined, msg.sender, block.timestamp);
    }

    // ─── View Functions ──────────────────────────────────────────────────────────

    /**
     * @dev Returns the full transition history of a batch.
     */
    function getDrugHistory(bytes32 batchId)
        external view lifecycleExists(batchId)
        returns (StateTransition[] memory)
    {
        return transitionHistory[batchId];
    }

    function getCurrentState(bytes32 batchId)
        external view lifecycleExists(batchId)
        returns (DrugState, address custodian, uint256 lastUpdated)
    {
        DrugLifecycle memory lc = lifecycles[batchId];
        return (lc.currentState, lc.currentCustodian, lc.lastUpdated);
    }

    function getStateName(DrugState state) external pure returns (string memory) {
        if (state == DrugState.Manufactured) return "Manufactured";
        if (state == DrugState.InTransit)    return "InTransit";
        if (state == DrugState.Distributed)  return "Distributed";
        if (state == DrugState.Retailed)     return "Retailed";
        if (state == DrugState.Sold)         return "Sold";
        return "Quarantined";
    }

    function getTransitionCount(bytes32 batchId) external view returns (uint256) {
        return transitionHistory[batchId].length;
    }

    // ─── Internal ────────────────────────────────────────────────────────────────

    function _executeTransfer(
        bytes32 batchId,
        DrugLifecycle storage lc,
        address to,
        DrugState newState,
        string memory actorRole,
        string memory location,
        string memory notes
    ) internal {
        address from = lc.currentCustodian;
        _recordTransition(batchId, lc, to, newState, actorRole, location, notes);

        // Also update ownership in DrugRegistry
        drugRegistry.transferOwnership(batchId, to, actorRole);

        custodianBatches[to].push(batchId);
        emit DrugTransferred(batchId, from, to, newState, location, block.timestamp);
    }

    function _recordTransition(
        bytes32 batchId,
        DrugLifecycle storage lc,
        address newCustodian,
        DrugState newState,
        string memory actorRole,
        string memory location,
        string memory notes
    ) internal {
        DrugState oldState = lc.currentState;
        lc.currentState    = newState;
        lc.currentCustodian = newCustodian;
        lc.lastUpdated     = block.timestamp;

        transitionHistory[batchId].push(StateTransition({
            fromState:   oldState,
            toState:     newState,
            initiatedBy: msg.sender,
            actorRole:   actorRole,
            location:    location,
            notes:       notes,
            timestamp:   block.timestamp,
            txMetaHash:  keccak256(abi.encodePacked(batchId, msg.sender, newState, block.timestamp))
        }));
    }
}
