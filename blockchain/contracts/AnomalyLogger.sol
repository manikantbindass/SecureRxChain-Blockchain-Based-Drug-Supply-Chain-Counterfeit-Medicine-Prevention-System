// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AnomalyLogger
 * @dev Logs AI-detected anomalies in the supply chain on-chain
 */
contract AnomalyLogger {
    enum AnomalyType { RapidTransfer, UnusualQuantity, GeographicAnomaly, FrequencyAnomaly, UnknownActor }
    enum Severity { Low, Medium, High, Critical }

    struct Anomaly {
        uint256 id;
        bytes32 batchId;
        AnomalyType anomalyType;
        Severity severity;
        string description;
        address reportedBy;
        uint256 timestamp;
        bool resolved;
    }

    uint256 public anomalyCount;
    mapping(uint256 => Anomaly) public anomalies;
    mapping(bytes32 => uint256[]) public batchAnomalies;

    event AnomalyDetected(uint256 indexed id, bytes32 indexed batchId, AnomalyType anomalyType, Severity severity);
    event AnomalyResolved(uint256 indexed id, address indexed resolver, uint256 timestamp);

    function logAnomaly(
        bytes32 batchId,
        AnomalyType anomalyType,
        Severity severity,
        string calldata description
    ) external returns (uint256) {
        anomalyCount++;
        anomalies[anomalyCount] = Anomaly({
            id: anomalyCount,
            batchId: batchId,
            anomalyType: anomalyType,
            severity: severity,
            description: description,
            reportedBy: msg.sender,
            timestamp: block.timestamp,
            resolved: false
        });
        batchAnomalies[batchId].push(anomalyCount);
        emit AnomalyDetected(anomalyCount, batchId, anomalyType, severity);
        return anomalyCount;
    }

    function resolveAnomaly(uint256 id) external {
        require(id <= anomalyCount, "AnomalyLogger: invalid id");
        anomalies[id].resolved = true;
        emit AnomalyResolved(id, msg.sender, block.timestamp);
    }

    function getBatchAnomalies(bytes32 batchId) external view returns (uint256[] memory) {
        return batchAnomalies[batchId];
    }
}
