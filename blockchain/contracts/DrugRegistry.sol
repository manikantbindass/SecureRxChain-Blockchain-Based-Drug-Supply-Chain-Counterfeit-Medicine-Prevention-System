// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract DrugRegistry is AccessControl {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant PHARMACY_ROLE = keccak256("PHARMACY_ROLE");
    
    enum DrugState { Manufactured, InTransit, Distributed, Retailed, Sold, Quarantined }

    struct Drug {
        string batchId;
        string drugName;
        address manufacturer;
        uint256 manufacturingDate;
        uint256 expiryDate;
        uint256 quantity;
        address currentOwner;
        DrugState state;
    }

    mapping(string => Drug) public drugs;
    mapping(string => bool) public drugExists;
    mapping(string => address[]) public ownershipHistory;

    event DrugRegistered(string batchId, address indexed manufacturer);
    event DrugTransferred(string batchId, address indexed from, address indexed to, DrugState newState);
    event DrugQuarantined(string batchId, address indexed trigger);
    event RoleGrantedEvent(bytes32 role, address account, address sender);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // Role management overrides to track via events easily in frontend
    function grantRole(bytes32 role, address account) public override {
        super.grantRole(role, account);
        emit RoleGrantedEvent(role, account, msg.sender);
    }

    // Register a new batch of drugs
    function registerDrug(
        string memory _batchId,
        string memory _drugName,
        uint256 _manufacturingDate,
        uint256 _expiryDate,
        uint256 _quantity
    ) public onlyRole(MANUFACTURER_ROLE) {
        require(!drugExists[_batchId], "Drug batch already exists");
        require(_expiryDate > block.timestamp, "Expiry date must be in the future");

        drugs[_batchId] = Drug({
            batchId: _batchId,
            drugName: _drugName,
            manufacturer: msg.sender,
            manufacturingDate: _manufacturingDate,
            expiryDate: _expiryDate,
            quantity: _quantity,
            currentOwner: msg.sender,
            state: DrugState.Manufactured
        });
        drugExists[_batchId] = true;
        ownershipHistory[_batchId].push(msg.sender);

        emit DrugRegistered(_batchId, msg.sender);
    }

    // Transfer ownership along the supply chain
    function transferDrug(string memory _batchId, address _to, DrugState _newState) public {
        require(drugExists[_batchId], "Drug does not exist");
        Drug storage drug = drugs[_batchId];
        require(drug.currentOwner == msg.sender, "You do not own this drug");
        require(drug.state != DrugState.Quarantined, "Drug quarantined");
        require(drug.state != DrugState.Sold, "Drug already sold");
        
        drug.currentOwner = _to;
        drug.state = _newState;
        ownershipHistory[_batchId].push(_to);

        emit DrugTransferred(_batchId, msg.sender, _to, _newState);
    }
    
    // Pharmacy sells drug to consumer
    function sellDrug(string memory _batchId) public onlyRole(PHARMACY_ROLE) {
        require(drugExists[_batchId], "Drug does not exist");
        Drug storage drug = drugs[_batchId];
        require(drug.currentOwner == msg.sender, "You do not own this drug");
        require(drug.state != DrugState.Quarantined, "Drug quarantined");
        require(drug.state != DrugState.Sold, "Drug already sold");
        
        drug.state = DrugState.Sold;
        
        emit DrugTransferred(_batchId, msg.sender, address(0), DrugState.Sold);
    }

    // Quarantine drug if found counterfeit or expired
    function quarantineDrug(string memory _batchId) public {
        require(drugExists[_batchId], "Drug does not exist");
        Drug storage drug = drugs[_batchId];
        
        // Manufacturer can quarantine their own drug, or Admin can
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || drug.manufacturer == msg.sender, "Not authorized to quarantine");
        
        drug.state = DrugState.Quarantined;
        
        emit DrugQuarantined(_batchId, msg.sender);
    }

    // Full verification function returning state and history
    function verifyDrug(string memory _batchId) public view returns (
        bool isAuthentic, 
        Drug memory drugDetails, 
        address[] memory history
    ) {
        if (!drugExists[_batchId]) {
            // Drug structure will be empty if not found
            return (false, drugs[_batchId], new address[](0));
        }
        
        // Authentic if it's registered and not quarantined
        bool authentic = (drugs[_batchId].state != DrugState.Quarantined);
        
        return (authentic, drugs[_batchId], ownershipHistory[_batchId]);
    }
}
