const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecureRxAccessControl", function () {
  let accessControl;
  let admin, manufacturer, distributor, pharmacy, consumer, stranger;

  beforeEach(async function () {
    [admin, manufacturer, distributor, pharmacy, consumer, stranger] = await ethers.getSigners();
    const AC = await ethers.getContractFactory("SecureRxAccessControl");
    accessControl = await AC.deploy(admin.address);
    await accessControl.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set deployer as admin", async function () {
      expect(await accessControl.isAdmin(admin.address)).to.be.true;
    });

    it("should have correct role identifiers", async function () {
      expect(await accessControl.MANUFACTURER_ROLE())
        .to.equal(ethers.keccak256(ethers.toUtf8Bytes("MANUFACTURER_ROLE")));
    });
  });

  describe("Role Management", function () {
    it("admin can grant manufacturer role", async function () {
      await accessControl.connect(admin).grantManufacturer(manufacturer.address, "PharmaX Ltd");
      expect(await accessControl.isManufacturer(manufacturer.address)).to.be.true;
    });

    it("admin can grant distributor role", async function () {
      await accessControl.connect(admin).grantDistributor(distributor.address, "FastDist Co");
      expect(await accessControl.isDistributor(distributor.address)).to.be.true;
    });

    it("admin can grant pharmacy role", async function () {
      await accessControl.connect(admin).grantPharmacy(pharmacy.address, "CityPharmacy");
      expect(await accessControl.isPharmacy(pharmacy.address)).to.be.true;
    });

    it("admin can grant consumer role", async function () {
      await accessControl.connect(admin).grantConsumer(consumer.address);
      expect(await accessControl.isConsumer(consumer.address)).to.be.true;
    });

    it("non-admin cannot grant roles", async function () {
      await expect(
        accessControl.connect(stranger).grantManufacturer(manufacturer.address, "FakeOrg")
      ).to.be.reverted;
    });

    it("admin can revoke a role", async function () {
      await accessControl.connect(admin).grantManufacturer(manufacturer.address, "PharmaX");
      await accessControl.connect(admin).revokeUserRole(manufacturer.address);
      expect(await accessControl.isManufacturer(manufacturer.address)).to.be.false;
    });

    it("getAccountRole returns correct info", async function () {
      await accessControl.connect(admin).grantDistributor(distributor.address, "QuickDist");
      const [, orgName, active] = await accessControl.getAccountRole(distributor.address);
      expect(orgName).to.equal("QuickDist");
      expect(active).to.be.true;
    });
  });
});
