const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // 1. Deploy RoleManager
  console.log("\n📋 Deploying RoleManager...");
  const RoleManager = await ethers.getContractFactory("RoleManager");
  const roleManager = await RoleManager.deploy(deployer.address);
  await roleManager.waitForDeployment();
  console.log("✅ RoleManager deployed to:", await roleManager.getAddress());

  // 2. Deploy DrugRegistry
  console.log("\n💊 Deploying DrugRegistry...");
  const DrugRegistry = await ethers.getContractFactory("DrugRegistry");
  const drugRegistry = await DrugRegistry.deploy(await roleManager.getAddress());
  await drugRegistry.waitForDeployment();
  console.log("✅ DrugRegistry deployed to:", await drugRegistry.getAddress());

  // 3. Deploy QRVerifier
  console.log("\n📱 Deploying QRVerifier...");
  const QRVerifier = await ethers.getContractFactory("QRVerifier");
  const qrVerifier = await QRVerifier.deploy();
  await qrVerifier.waitForDeployment();
  console.log("✅ QRVerifier deployed to:", await qrVerifier.getAddress());

  // 4. Deploy AnomalyLogger
  console.log("\n🔍 Deploying AnomalyLogger...");
  const AnomalyLogger = await ethers.getContractFactory("AnomalyLogger");
  const anomalyLogger = await AnomalyLogger.deploy();
  await anomalyLogger.waitForDeployment();
  console.log("✅ AnomalyLogger deployed to:", await anomalyLogger.getAddress());

  // Save deployment addresses
  const deployments = {
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      RoleManager: await roleManager.getAddress(),
      DrugRegistry: await drugRegistry.getAddress(),
      QRVerifier: await qrVerifier.getAddress(),
      AnomalyLogger: await anomalyLogger.getAddress(),
    },
  };

  const outputDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `${hre.network.name}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(deployments, null, 2));
  console.log("\n📄 Deployment info saved to:", outputPath);

  console.log("\n🎉 All contracts deployed successfully!");
  console.table(deployments.contracts);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
