const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DrugRegistry", function () {
  let roleManager, drugRegistry, qrVerifier;
  let admin, manufacturer, distributor, retailer, consumer;

  beforeEach(async function () {
    [admin, manufacturer, distributor, retailer, consumer] = await ethers.getSigners();

    const RoleManager = await ethers.getContractFactory("RoleManager");
    roleManager = await RoleManager.deploy(admin.address);

    const DrugRegistry = await ethers.getContractFactory("DrugRegistry");
    drugRegistry = await DrugRegistry.deploy(await roleManager.getAddress());

    // Grant manufacturer role
    await roleManager.connect(admin).grantManufacturer(manufacturer.address);
    await roleManager.connect(admin).grantDistributor(distributor.address);
    await roleManager.connect(admin).grantRetailer(retailer.address);
  });

  describe("Batch Creation", function () {
    it("should allow manufacturer to create a batch", async function () {
      const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 3600;
      const qrHash = ethers.keccak256(ethers.toUtf8Bytes("test-qr-payload"));

      const tx = await drugRegistry.connect(manufacturer).createBatch(
        "Paracetamol 500mg",
        expiryDate,
        1000,
        "QmTestIPFSHash123",
        qrHash
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try { return drugRegistry.interface.parseLog(log)?.name === 'BatchCreated'; }
        catch { return false; }
      });

      expect(event).to.not.be.undefined;
      expect(await drugRegistry.getTotalBatches()).to.equal(1);
    });

    it("should revert if non-manufacturer tries to create batch", async function () {
      const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 3600;
      await expect(
        drugRegistry.connect(consumer).createBatch(
          "Fake Drug", expiryDate, 100, "QmFake", ethers.ZeroHash
        )
      ).to.be.revertedWith("DrugRegistry: caller is not a manufacturer");
    });
  });

  describe("Batch Verification", function () {
    it("should return authentic for valid QR hash", async function () {
      const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 3600;
      const qrHash = ethers.keccak256(ethers.toUtf8Bytes("valid-qr"));

      const tx = await drugRegistry.connect(manufacturer).createBatch(
        "Amoxicillin", expiryDate, 500, "QmDoc", qrHash
      );
      const receipt = await tx.wait();
      const parsedLog = receipt.logs
        .map(log => { try { return drugRegistry.interface.parseLog(log); } catch { return null; } })
        .find(l => l?.name === 'BatchCreated');

      const batchId = parsedLog.args.batchId;
      const [isAuthentic, , isExpired] = await drugRegistry.verifyBatch(batchId, qrHash);

      expect(isAuthentic).to.be.true;
      expect(isExpired).to.be.false;
    });
  });
});
