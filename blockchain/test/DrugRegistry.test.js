const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DrugRegistry", function () {
  let drugRegistry;
  let admin, manufacturer, distributor, pharmacy, consumer;

  beforeEach(async function () {
    [admin, manufacturer, distributor, pharmacy, consumer] = await ethers.getSigners();
    
    const DrugRegistry = await ethers.getContractFactory("DrugRegistry");
    drugRegistry = await DrugRegistry.deploy();
    await drugRegistry.waitForDeployment();

    // Grant roles
    const MANUFACTURER_ROLE = await drugRegistry.MANUFACTURER_ROLE();
    const DISTRIBUTOR_ROLE = await drugRegistry.DISTRIBUTOR_ROLE();
    const PHARMACY_ROLE = await drugRegistry.PHARMACY_ROLE();

    await drugRegistry.grantRole(MANUFACTURER_ROLE, manufacturer.address);
    await drugRegistry.grantRole(DISTRIBUTOR_ROLE, distributor.address);
    await drugRegistry.grantRole(PHARMACY_ROLE, pharmacy.address);
  });

  it("Should register a new drug if manufacturer", async function () {
    const batchId = "BATCH001";
    const expiry = Math.floor(Date.now() / 1000) + 86400; // 1 day in future
    
    await expect(drugRegistry.connect(manufacturer).registerDrug(batchId, "Aspirin", Math.floor(Date.now()/1000), expiry, 100))
      .to.emit(drugRegistry, "DrugRegistered")
      .withArgs(batchId, manufacturer.address);
      
    const drug = await drugRegistry.drugs(batchId);
    expect(drug.drugName).to.equal("Aspirin");
    expect(drug.state).to.equal(0); // Manufactured
  });

  it("Should transfer drug to distributor", async function () {
    const batchId = "BATCH002";
    const expiry = Math.floor(Date.now() / 1000) + 86400;
    
    await drugRegistry.connect(manufacturer).registerDrug(batchId, "Aspirin", Math.floor(Date.now()/1000), expiry, 100);
    
    await expect(drugRegistry.connect(manufacturer).transferDrug(batchId, distributor.address, 1)) // 1 = InTransit
      .to.emit(drugRegistry, "DrugTransferred")
      .withArgs(batchId, manufacturer.address, distributor.address, 1);
  });

  it("Should verify authentic drug and return history", async function () {
    const batchId = "BATCH003";
    const expiry = Math.floor(Date.now() / 1000) + 86400;
    
    await drugRegistry.connect(manufacturer).registerDrug(batchId, "Aspirin", Math.floor(Date.now()/1000), expiry, 100);
    await drugRegistry.connect(manufacturer).transferDrug(batchId, distributor.address, 2); // Distributed
    
    const [isAuthentic, drugDetails, history] = await drugRegistry.verifyDrug(batchId);
    expect(isAuthentic).to.be.true;
    expect(drugDetails.currentOwner).to.equal(distributor.address);
    expect(history.length).to.equal(2);
    expect(history[0]).to.equal(manufacturer.address);
    expect(history[1]).to.equal(distributor.address);
  });
});
