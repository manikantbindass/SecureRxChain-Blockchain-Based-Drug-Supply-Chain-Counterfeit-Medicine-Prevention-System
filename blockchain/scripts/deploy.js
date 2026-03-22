const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const DrugRegistry = await hre.ethers.getContractFactory("DrugRegistry");
  const drugRegistry = await DrugRegistry.deploy();

  await drugRegistry.waitForDeployment();
  const address = await drugRegistry.getAddress();

  console.log("DrugRegistry deployed to:", address);
  
  const envPath = path.join(__dirname, "../../backend/.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf-8");
    envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${address}`);
    fs.writeFileSync(envPath, envContent);
    console.log("Updated backend .env with target contract address");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
