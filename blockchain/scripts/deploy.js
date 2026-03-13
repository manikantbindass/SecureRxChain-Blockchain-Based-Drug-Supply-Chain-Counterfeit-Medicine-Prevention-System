const { ethers, network } = require("hardhat");
const fs   = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance    = await ethers.provider.getBalance(deployer.address);

  console.log("━".repeat(60));
  console.log("  🚀 SecureRxChain Contract Deployment");
  console.log("━".repeat(60));
  console.log(`  Network   : ${network.name}`);
  console.log(`  Deployer  : ${deployer.address}`);
  console.log(`  Balance   : ${ethers.formatEther(balance)} ETH/MATIC`);
  console.log("━".repeat(60));

  // ── 1. Deploy SecureRxAccessControl ──────────────────────────────────────────
  console.log("\n[1/4] Deploying SecureRxAccessControl...");
  const AccessControlFactory = await ethers.getContractFactory("SecureRxAccessControl");
  const accessControl = await AccessControlFactory.deploy(deployer.address);
  await accessControl.waitForDeployment();
  const acAddress = await accessControl.getAddress();
  console.log(`  ✅ SecureRxAccessControl : ${acAddress}`);

  // ── 2. Deploy DrugRegistry ───────────────────────────────────────────────────
  console.log("\n[2/4] Deploying DrugRegistry...");
  const DrugRegistryFactory = await ethers.getContractFactory("DrugRegistry");
  const drugRegistry = await DrugRegistryFactory.deploy(acAddress);
  await drugRegistry.waitForDeployment();
  const drAddress = await drugRegistry.getAddress();
  console.log(`  ✅ DrugRegistry           : ${drAddress}`);

  // ── 3. Deploy SupplyChain ────────────────────────────────────────────────────
  console.log("\n[3/4] Deploying SupplyChain...");
  const SupplyChainFactory = await ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChainFactory.deploy(acAddress, drAddress);
  await supplyChain.waitForDeployment();
  const scAddress = await supplyChain.getAddress();
  console.log(`  ✅ SupplyChain            : ${scAddress}`);

  // ── 4. Deploy Verification ───────────────────────────────────────────────────
  console.log("\n[4/4] Deploying Verification...");
  const VerificationFactory = await ethers.getContractFactory("Verification");
  const verification = await VerificationFactory.deploy(drAddress, scAddress, acAddress);
  await verification.waitForDeployment();
  const vAddress = await verification.getAddress();
  console.log(`  ✅ Verification           : ${vAddress}`);

  // ── Post-deploy: Grant SupplyChain permission in DrugRegistry ────────────────
  console.log("\n⚙️  Configuring contract permissions...");
  // Grant ADMIN_ROLE to SupplyChain contract so it can call transferOwnership
  const ADMIN_ROLE = await accessControl.ADMIN_ROLE();
  const tx = await accessControl.grantRole(ADMIN_ROLE, scAddress);
  await tx.wait();
  console.log(`  ✅ SupplyChain granted ADMIN_ROLE in AccessControl`);

  // ── Save Deployment Addresses ────────────────────────────────────────────────
  const chainId = (await ethers.provider.getNetwork()).chainId.toString();
  const deploymentInfo = {
    network:     network.name,
    chainId,
    deployer:    deployer.address,
    deployedAt:  new Date().toISOString(),
    contracts: {
      SecureRxAccessControl: acAddress,
      DrugRegistry:          drAddress,
      SupplyChain:           scAddress,
      Verification:          vAddress,
    },
  };

  const outDir  = path.join(__dirname, "../deployments");
  const outFile = path.join(outDir, `${network.name}.json`);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(deploymentInfo, null, 2));

  // Also copy to client & server for easy consumption
  const clientOut = path.join(__dirname, "../../client/src/contracts");
  const serverOut = path.join(__dirname, "../../server/src/config/contracts");
  [clientOut, serverOut].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `addresses.json`), JSON.stringify(deploymentInfo.contracts, null, 2));
  });

  console.log("\n━".repeat(60));
  console.log("  🎉 Deployment Complete!");
  console.log("━".repeat(60));
  console.table(deploymentInfo.contracts);
  console.log(`\n  📄 Addresses saved to: blockchain/deployments/${network.name}.json`);
  console.log(`  📄 Copied to: client/src/contracts/addresses.json`);
  console.log(`  📄 Copied to: server/src/config/contracts/addresses.json`);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exitCode = 1;
});
