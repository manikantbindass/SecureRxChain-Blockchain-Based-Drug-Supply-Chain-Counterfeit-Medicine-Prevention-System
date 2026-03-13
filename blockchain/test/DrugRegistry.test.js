const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DrugRegistry", function () {
  let accessControl, drugRegistry;
  let admin, manufacturer, distributor, stranger;

  const DRUG_NAME       = "Paracetamol";
  const GENERIC_NAME    = "Acetaminophen";
  const DOSAGE_FORM     = "Tablet";
  const STRENGTH        = "500mg";
  const MFG_NAME        = "PharmaX Ltd";
  const IPFS_CID        = "QmTestCIDhash123";

  let manufacturingDate, expiryDate, qrHash;

  beforeEach(async function () {
    [admin, manufacturer, distributor, stranger] = await ethers.getSigners();

    const AC = await ethers.getContractFactory("SecureRxAccessControl");
    accessControl = await AC.deploy(admin.address);

    const DR = await ethers.getContractFactory("DrugRegistry");
    drugRegistry = await DR.deploy(await accessControl.getAddress());

    await accessControl.connect(admin).grantManufacturer(manufacturer.address, MFG_NAME);

    const now = Math.floor(Date.now() / 1000);
    manufacturingDate = now - 100;
    expiryDate        = now + 365 * 24 * 3600; // 1 year
    qrHash = ethers.keccak256(ethers.toUtf8Bytes("batch-qr-payload-001"));
  });

  async function registerBatch(signer = manufacturer) {
    return drugRegistry.connect(signer).registerBatch(
      DRUG_NAME, GENERIC_NAME, DOSAGE_FORM, STRENGTH,
      MFG_NAME, manufacturingDate, expiryDate, 1000, IPFS_CID, qrHash
    );
  }

  describe("Batch Registration", function () {
    it("manufacturer can register a batch", async function () {
      const tx = await registerBatch();
      const receipt = await tx.wait();
      expect(await drugRegistry.getTotalBatches()).to.equal(1);
    });

    it("emits BatchRegistered event", async function () {
      await expect(registerBatch())
        .to.emit(drugRegistry, "BatchRegistered")
        .withArgs(
          /* batchId */ ethers.isHexString, // any bytes32
          DRUG_NAME,
          manufacturer.address,
          1000,
          expiryDate,
          /* timestamp */ ethers.isHexString
        );
    });

    it("non-manufacturer cannot register a batch", async function () {
      await expect(registerBatch(stranger))
        .to.be.revertedWith("DrugRegistry: caller is not a registered manufacturer");
    });

    it("rejects expired expiry date", async function () {
      const pastDate = Math.floor(Date.now() / 1000) - 1000;
      await expect(
        drugRegistry.connect(manufacturer).registerBatch(
          DRUG_NAME, GENERIC_NAME, DOSAGE_FORM, STRENGTH,
          MFG_NAME, manufacturingDate, pastDate, 100, IPFS_CID, qrHash
        )
      ).to.be.revertedWith("DrugRegistry: expiry date must be in the future");
    });

    it("rejects zero quantity", async function () {
      await expect(
        drugRegistry.connect(manufacturer).registerBatch(
          DRUG_NAME, GENERIC_NAME, DOSAGE_FORM, STRENGTH,
          MFG_NAME, manufacturingDate, expiryDate, 0, IPFS_CID, qrHash
        )
      ).to.be.revertedWith("DrugRegistry: quantity must be > 0");
    });
  });

  describe("Batch Data", function () {
    let batchId;

    beforeEach(async function () {
      const tx      = await registerBatch();
      const receipt = await tx.wait();
      const event   = receipt.logs
        .map(l => { try { return drugRegistry.interface.parseLog(l); } catch { return null; } })
        .find(e => e?.name === "BatchRegistered");
      batchId = event.args.batchId;
    });

    it("stores correct batch data", async function () {
      const batch = await drugRegistry.getBatch(batchId);
      expect(batch.drugName).to.equal(DRUG_NAME);
      expect(batch.quantity).to.equal(1000);
      expect(batch.manufacturer).to.equal(manufacturer.address);
      expect(batch.ipfsCID).to.equal(IPFS_CID);
      expect(batch.qrCodeHash).to.equal(qrHash);
    });

    it("ownership history starts with REGISTERED", async function () {
      const history = await drugRegistry.getOwnershipHistory(batchId);
      expect(history.length).to.equal(1);
      expect(history[0].action).to.equal("REGISTERED");
      expect(history[0].owner).to.equal(manufacturer.address);
    });

    it("isExpired returns false for valid batch", async function () {
      expect(await drugRegistry.isExpired(batchId)).to.be.false;
    });
  });

  describe("Recall & Counterfeit", function () {
    let batchId;

    beforeEach(async function () {
      const tx      = await registerBatch();
      const receipt = await tx.wait();
      const event   = receipt.logs
        .map(l => { try { return drugRegistry.interface.parseLog(l); } catch { return null; } })
        .find(e => e?.name === "BatchRegistered");
      batchId = event.args.batchId;
    });

    it("admin can recall a batch", async function () {
      await expect(drugRegistry.connect(admin).recallBatch(batchId, "Contamination found"))
        .to.emit(drugRegistry, "BatchRecalled");
      const batch = await drugRegistry.getBatch(batchId);
      expect(batch.isRecalled).to.be.true;
    });

    it("admin can flag counterfeit", async function () {
      await expect(drugRegistry.connect(admin).flagCounterfeit(batchId))
        .to.emit(drugRegistry, "CounterfeitFlagged");
      const batch = await drugRegistry.getBatch(batchId);
      expect(batch.isCounterfeit).to.be.true;
    });

    it("non-admin cannot recall", async function () {
      await expect(drugRegistry.connect(stranger).recallBatch(batchId, "fake"))
        .to.be.revertedWith("DrugRegistry: caller is not admin");
    });
  });
});
