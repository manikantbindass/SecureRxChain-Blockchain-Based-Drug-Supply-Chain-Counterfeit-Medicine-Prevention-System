// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DrugRegistry.sol";
import "./SupplyChain.sol";
import "./AccessControl.sol";

/**
 * @title Verification
 * @dev Public-facing contract for drug authenticity verification.
 *      Any address (especially consumers) can call verifyDrug(batchId)
 *      to get the full authenticity report and transaction history.
 */
contract Verification {

    DrugRegistry          public drugRegistry;
    SupplyChain           public supplyChain;
    SecureRxAccessControl public accessControl;

    // ─── Structs ─────────────────────────────────────────────────────────────────
    enum AuthenticityStatus {
        Authentic,          // 0 — passes all checks
        Expired,            // 1 — past expiry date
        Recalled,           // 2 — manufacturer/regulator recall
        Counterfeit,        // 3 — flagged as counterfeit
        Quarantined,        // 4 — currently in quarantine state
        NotFound            // 5 — batch ID does not exist
    }

    struct VerificationReport {
        bytes32                         batchId;
        AuthenticityStatus              status;
        bool                            isAuthentic;
        string                          drugName;
        string                          manufacturerName;
        uint256                         expiryDate;
        uint256                         quantity;
        SupplyChain.DrugState           currentState;
        address                         currentCustodian;
        uint256                         totalTransitions;
        DrugRegistry.OwnershipRecord[]  ownershipChain;
        SupplyChain.StateTransition[]   supplyChainHistory;
        uint256                         verifiedAt;
    }

    struct VerificationSummary {
        bytes32               batchId;
        AuthenticityStatus    status;
        bool                  isAuthentic;
        string                drugName;
        string                manufacturerName;
        SupplyChain.DrugState currentState;
        uint256               verifiedAt;
    }

    // ─── Storage ─────────────────────────────────────────────────────────────────
    mapping(bytes32 => uint256) public verificationCount;
    mapping(bytes32 => uint256) public lastVerifiedAt;

    uint256 public totalVerifications;

    // ─── Events ──────────────────────────────────────────────────────────────────
    event DrugVerified(
        bytes32           indexed batchId,
        address           indexed verifiedBy,
        AuthenticityStatus         status,
        uint256                    timestamp
    );
    event SuspiciousVerificationPattern(
        bytes32 indexed batchId,
        uint256          count,
        uint256          timestamp
    );

    // ─── Constructor ─────────────────────────────────────────────────────────────
    constructor(
        address _drugRegistry,
        address _supplyChain,
        address _accessControl
    ) {
        drugRegistry  = DrugRegistry(_drugRegistry);
        supplyChain   = SupplyChain(_supplyChain);
        accessControl = SecureRxAccessControl(_accessControl);
    }

    // ─── Main Verification Function ──────────────────────────────────────────────

    /**
     * @dev Full verification report for a drug batch.
     *      Returns authenticity status + complete on-chain audit trail.
     *      Open to all callers (consumers, pharmacies, regulators).
     * @param batchId   keccak256 batch identifier
     * @param qrPayloadHash  keccak256 of the scanned QR payload (for hash check)
     */
    function verifyDrug(
        bytes32 batchId,
        bytes32 qrPayloadHash
    ) external returns (VerificationReport memory report) {
        // Track verification analytics
        verificationCount[batchId]++;
        lastVerifiedAt[batchId] = block.timestamp;
        totalVerifications++;

        // Emit anomaly if verified excessively in short period (potential counterfeit distribution)
        if (verificationCount[batchId] > 1000) {
            emit SuspiciousVerificationPattern(batchId, verificationCount[batchId], block.timestamp);
        }

        // Check batch exists
        DrugRegistry.DrugBatch memory batch;
        bool batchFound = _batchExists(batchId);

        if (!batchFound) {
            report.batchId     = batchId;
            report.status      = AuthenticityStatus.NotFound;
            report.isAuthentic = false;
            report.verifiedAt  = block.timestamp;
            emit DrugVerified(batchId, msg.sender, AuthenticityStatus.NotFound, block.timestamp);
            return report;
        }

        batch = drugRegistry.getBatch(batchId);

        // ── Determine Status ─────────────────────────────────────────────────────
        AuthenticityStatus status = _determineStatus(batch, batchId, qrPayloadHash);

        // ── Build Full Report ────────────────────────────────────────────────────
        (
            SupplyChain.DrugState currentState,
            address currentCustodian,
        ) = supplyChain.getCurrentState(batchId);

        report.batchId              = batchId;
        report.status               = status;
        report.isAuthentic          = (status == AuthenticityStatus.Authentic);
        report.drugName             = batch.drugName;
        report.manufacturerName     = batch.manufacturerName;
        report.expiryDate           = batch.expiryDate;
        report.quantity             = batch.quantity;
        report.currentState         = currentState;
        report.currentCustodian     = currentCustodian;
        report.ownershipChain       = drugRegistry.getOwnershipHistory(batchId);
        report.supplyChainHistory   = supplyChain.getDrugHistory(batchId);
        report.totalTransitions     = report.supplyChainHistory.length;
        report.verifiedAt           = block.timestamp;

        emit DrugVerified(batchId, msg.sender, status, block.timestamp);
        return report;
    }

    /**
     * @dev Lightweight check — returns just the summary (cheaper gas for consumers).
     */
    function quickVerify(bytes32 batchId)
        external view
        returns (VerificationSummary memory summary)
    {
        if (!_batchExists(batchId)) {
            summary.batchId    = batchId;
            summary.status     = AuthenticityStatus.NotFound;
            summary.isAuthentic = false;
            summary.verifiedAt = block.timestamp;
            return summary;
        }

        DrugRegistry.DrugBatch memory batch = drugRegistry.getBatch(batchId);
        AuthenticityStatus status = _determineStatus(batch, batchId, bytes32(0));

        (SupplyChain.DrugState currentState,,) = supplyChain.getCurrentState(batchId);

        summary.batchId          = batchId;
        summary.status           = status;
        summary.isAuthentic      = (status == AuthenticityStatus.Authentic);
        summary.drugName         = batch.drugName;
        summary.manufacturerName = batch.manufacturerName;
        summary.currentState     = currentState;
        summary.verifiedAt       = block.timestamp;
    }

    /**
     * @dev Returns only the full transaction/ownership history.
     */
    function getTransactionHistory(bytes32 batchId)
        external view
        returns (
            DrugRegistry.OwnershipRecord[]  memory ownershipChain,
            SupplyChain.StateTransition[]   memory supplyHistory
        )
    {
        require(_batchExists(batchId), "Verification: batch not found");
        ownershipChain = drugRegistry.getOwnershipHistory(batchId);
        supplyHistory  = supplyChain.getDrugHistory(batchId);
    }

    /**
     * @dev Returns the status name as a human-readable string.
     */
    function getStatusName(AuthenticityStatus status) external pure returns (string memory) {
        if (status == AuthenticityStatus.Authentic)   return "Authentic";
        if (status == AuthenticityStatus.Expired)     return "Expired";
        if (status == AuthenticityStatus.Recalled)    return "Recalled";
        if (status == AuthenticityStatus.Counterfeit) return "Counterfeit";
        if (status == AuthenticityStatus.Quarantined) return "Quarantined";
        return "NotFound";
    }

    // ─── Internal Helpers ────────────────────────────────────────────────────────

    function _determineStatus(
        DrugRegistry.DrugBatch memory batch,
        bytes32 batchId,
        bytes32 qrPayloadHash
    ) internal view returns (AuthenticityStatus) {
        // Priority order matters
        if (batch.isCounterfeit)  return AuthenticityStatus.Counterfeit;
        if (batch.isRecalled)     return AuthenticityStatus.Recalled;

        // Check supply chain state
        if (supplyChain.lifecycles(batchId).isActive) {
            if (supplyChain.lifecycles(batchId).currentState == SupplyChain.DrugState.Quarantined) {
                return AuthenticityStatus.Quarantined;
            }
        }

        if (block.timestamp > batch.expiryDate) return AuthenticityStatus.Expired;

        // QR hash check (skip if zero hash passed — i.e., not checking QR)
        if (qrPayloadHash != bytes32(0) && batch.qrCodeHash != qrPayloadHash) {
            return AuthenticityStatus.Counterfeit;
        }

        return AuthenticityStatus.Authentic;
    }

    function _batchExists(bytes32 batchId) internal view returns (bool) {
        try drugRegistry.getBatch(batchId) returns (DrugRegistry.DrugBatch memory) {
            return true;
        } catch {
            return false;
        }
    }
}
