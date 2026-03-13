const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Verification", function () {
  let accessControl, drugRegistry, supplyChain, verification;
  let admin, manufacturer, distributor, pharmacy, consumer;
  let batchId, qrHash;

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

    const V = await ethers.getContractFactory("Verification");
    verification = await V.deploy(
      await drugRegistry.getAddress(),
      await supplyChain.getAddress(),
      await accessControl.getAddress()
    );

    // Setup roles
    await accessControl.connect(admin).grantManufacturer(manufacturer.address, "PharmaX");
    await accessControl.connect(admin).grantDistributor(distributor.address, "FastDist");
    await accessControl.connect(admin).grantPharmacy(pharmacy.address, "CityPharm");
    const ADMIN_ROLE = await accessControl.ADMIN_ROLE();
    await accessControl.connect(admin).grantRole(ADMIN_ROLE, await supplyChain.getAddress());

    // Register batch
    qrHash = ethers.keccak256(ethers.toUtf8Bytes("authentic-qr-123"));
    const now = Math.floor(Date.now() / 1000);
    const tx = await drugRegistry.connect(manufacturer).registerBatch(
      "Ibuprofen", "Ibuprofen", "Tablet", "400mg",
      "PharmaX", now - 100, now + 365 * 24 * 3600, 200,
      "QmDocHash", qrHash
    );
    const receipt = await tx.wait();
    const event = receipt.logs
      .map(l => { try { return drugRegistry.interface.parseLog(l); } catch { return null; } })
      .find(e => e?.name === "BatchRegistered");
    batchId = event.args.batchId;
    await supplyChain.connect(manufacturer).initializeBatch(batchId, "Factory", "");
  });

  describe("verifyDrug", function () {
    it("returns Authentic for valid batch with correct QR hash", async function () {
      const report = await verification.connect(consumer).verifyDrug.staticCall(batchId, qrHash);
      expect(report.isAuthentic).to.be.true;
      expect(report.status).to.equal(0); // Authentic
      expect(report.drugName).to.equal("Ibuprofen");
    });

    it("returns Counterfeit for wrong QR hash", async function () {
      const fakeHash = ethers.keccak256(ethers.toUtf8Bytes("fake-qr"));
      const report = await verification.connect(consumer).verifyDrug.staticCall(batchId, fakeHash);
      expect(report.isAuthentic).to.be.false;
      expect(report.status).to.equal(3); // Counterfeit
    });

    it("returns NotFound for non-existent batchId", async function () {
      const fakeBatchId = ethers.keccak256(ethers.toUtf8Bytes("nonexistent"));
      const report = await verification.connect(consumer).verifyDrug.staticCall(fakeBatchId, ethers.ZeroHash);
      expect(report.status).to.equal(5); // NotFound
    });

    it("returns Recalled for recalled batch", async function () {
      await drugRegistry.connect(admin).recallBatch(batchId, "Contamination");
      const report = await verification.connect(consumer).verifyDrug.staticCall(batchId, qrHash);
      expect(report.status).to.equal(2); // Recalled
    });

    it("increments verification count", async function () {
      await verification.connect(consumer).verifyDrug(batchId, qrHash);
      await verification.connect(consumer).verifyDrug(batchId, qrHash);
      expect(await verification.verificationCount(batchId)).to.equal(2);
    });

    it("report includes full ownership chain", async function () {
      const report = await verification.connect(consumer).verifyDrug.staticCall(batchId, qrHash);
      expect(report.ownershipChain.length).to.be.gte(1);
    });

    it("report includes supply chain history", async function () {
      const report = await verification.connect(consumer).verifyDrug.staticCall(batchId, qrHash);
      expect(report.supplyChainHistory.length).to.be.gte(1);
    });
  });

  describe("quickVerify", function () {
    it("returns summary without state-changing call", async function () {
      const summary = await verification.quickVerify(batchId);
      expect(summary.isAuthentic).to.be.true;
      expect(summary.drugName).to.equal("Ibuprofen");
    });
  });

  describe("getTransactionHistory", function () {
    it("returns both ownership and supply chain history", async function () {
      const [ownershipChain, supplyHistory] = await verification.getTransactionHistory(batchId);
      expect(ownershipChain.length).to.be.gte(1);
      expect(supplyHistory.length).to.be.gte(1);
    });
  });

  describe("getStatusName", function () {
    it("returns correct status names", async function () {
      expect(await verification.getStatusName(0)).to.equal("Authentic");
      expect(await verification.getStatusName(2)).to.equal("Recalled");
      expect(await verification.getStatusName(3)).to.equal("Counterfeit");
      expect(await verification.getStatusName(5)).to.equal("NotFound");
    });
  });
});
