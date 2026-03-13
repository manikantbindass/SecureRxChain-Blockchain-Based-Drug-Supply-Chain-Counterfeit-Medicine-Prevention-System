const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SupplyChain", function () {
  let accessControl, drugRegistry, supplyChain;
  let admin, manufacturer, distributor, pharmacy, consumer;
  let batchId;

  const DrugState = { Manufactured: 0, InTransit: 1, Distributed: 2, Retailed: 3, Sold: 4, Quarantined: 5 };

  beforeEach(async function () {
    [admin, manufacturer, distributor, pharmacy, consumer] = await ethers.getSigners();

    const AC = await ethers.getContractFactory("SecureRxAccessControl");
    accessControl = await AC.deploy(admin.address);

    const DR = await ethers.getContractFactory("DrugRegistry");
    drugRegistry = await DR.deploy(await accessControl.getAddress());

    const SC = await ethers.getContractFactory("SupplyChain");
    supplyChain = await SC.deploy(
      await accessControl.getAddress(),
      await drugRegistry.getAddress()
    );

    // Grant roles
    await accessControl.connect(admin).grantManufacturer(manufacturer.address, "PharmaX");
    await accessControl.connect(admin).grantDistributor(distributor.address, "FastDist");
    await accessControl.connect(admin).grantPharmacy(pharmacy.address, "CityPharm");

    // Grant SupplyChain ADMIN_ROLE so it can call transferOwnership on DrugRegistry
    const ADMIN_ROLE = await accessControl.ADMIN_ROLE();
    await accessControl.connect(admin).grantRole(ADMIN_ROLE, await supplyChain.getAddress());

    // Register a batch
    const now = Math.floor(Date.now() / 1000);
    const tx = await drugRegistry.connect(manufacturer).registerBatch(
      "Amoxicillin", "Amoxicillin", "Capsule", "250mg",
      "PharmaX", now - 100, now + 365 * 24 * 3600, 500,
      "QmIPFSHash", ethers.keccak256(ethers.toUtf8Bytes("qr-payload"))
    );
    const receipt = await tx.wait();
    const event = receipt.logs
      .map(l => { try { return drugRegistry.interface.parseLog(l); } catch { return null; } })
      .find(e => e?.name === "BatchRegistered");
    batchId = event.args.batchId;

    // Initialize batch in supply chain
    await supplyChain.connect(manufacturer).initializeBatch(batchId, "Factory A", "Batch ready");
  });

  describe("State Machine: Happy Path", function () {
    it("starts at Manufactured state", async function () {
      const [state] = await supplyChain.getCurrentState(batchId);
      expect(state).to.equal(DrugState.Manufactured);
    });

    it("Manufactured → InTransit (transferToDistributor)", async function () {
      await supplyChain.connect(manufacturer)
        .transferToDistributor(batchId, distributor.address, "Warehouse A", "Picked up");
      const [state] = await supplyChain.getCurrentState(batchId);
      expect(state).to.equal(DrugState.InTransit);
    });

    it("InTransit → Distributed (markDistributed)", async function () {
      await supplyChain.connect(manufacturer)
        .transferToDistributor(batchId, distributor.address, "Warehouse A", "");
      await supplyChain.connect(distributor)
        .markDistributed(batchId, pharmacy.address, "Hub B", "Delivered");
      const [state] = await supplyChain.getCurrentState(batchId);
      expect(state).to.equal(DrugState.Distributed);
    });

    it("full flow: Manufactured → Sold", async function () {
      await supplyChain.connect(manufacturer)
        .transferToDistributor(batchId, distributor.address, "Factory A", "");
      await supplyChain.connect(distributor)
        .markDistributed(batchId, pharmacy.address, "City Hub", "");
      await supplyChain.connect(pharmacy)
        .markRetailed(batchId, "Shelf A", "");
      await supplyChain.connect(pharmacy)
        .markSold(batchId, consumer.address, "Counter 1", "Dispensed");

      const [state] = await supplyChain.getCurrentState(batchId);
      expect(state).to.equal(DrugState.Sold);
    });
  });

  describe("getDrugHistory", function () {
    it("returns correct number of transitions", async function () {
      await supplyChain.connect(manufacturer)
        .transferToDistributor(batchId, distributor.address, "A", "");
      await supplyChain.connect(distributor)
        .markDistributed(batchId, pharmacy.address, "B", "");

      const history = await supplyChain.getDrugHistory(batchId);
      expect(history.length).to.equal(3); // init + 2 transfers
    });

    it("records correct from/to states", async function () {
      await supplyChain.connect(manufacturer)
        .transferToDistributor(batchId, distributor.address, "A", "Notes");
      const history = await supplyChain.getDrugHistory(batchId);
      expect(history[1].fromState).to.equal(DrugState.Manufactured);
      expect(history[1].toState).to.equal(DrugState.InTransit);
    });
  });

  describe("Quarantine", function () {
    it("admin can quarantine at any state", async function () {
      await supplyChain.connect(admin).quarantineBatch(batchId, "Suspicious activity");
      const [state] = await supplyChain.getCurrentState(batchId);
      expect(state).to.equal(DrugState.Quarantined);
    });

    it("transfer fails when quarantined", async function () {
      await supplyChain.connect(admin).quarantineBatch(batchId, "Test");
      await expect(
        supplyChain.connect(manufacturer)
          .transferToDistributor(batchId, distributor.address, "A", "")
      ).to.be.revertedWith("SupplyChain: batch is quarantined");
    });
  });

  describe("Invalid State Transitions", function () {
    it("distributor cannot directly distribute without InTransit", async function () {
      await expect(
        supplyChain.connect(distributor)
          .markDistributed(batchId, pharmacy.address, "A", "")
      ).to.be.revertedWith("SupplyChain: invalid state transition");
    });
  });
});
