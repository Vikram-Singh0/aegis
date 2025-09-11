const { ethers } = require("hardhat");

async function main() {
  // 1. Deploy WETH-Test
  const WETH = await ethers.getContractFactory("WETHTest");
  const weth = await WETH.deploy(ethers.parseEther("1000000")); // 1M supply
  await weth.waitForDeployment();
  console.log("✅ WETH-Test deployed at:", await weth.getAddress());

  // 2. Deploy USDC-Test
  const USDC = await ethers.getContractFactory("USDCTest");
  const usdc = await USDC.deploy(ethers.parseEther("1000000")); // 1M supply
  await usdc.waitForDeployment();
  console.log("✅ USDC-Test deployed at:", await usdc.getAddress());

  // 3. Deploy CollateralManager
  const CollateralManager = await ethers.getContractFactory("CollateralManager");

  // Parameters
  const collateralToken = await weth.getAddress();   // use WETH as collateral
  const debtToken = await usdc.getAddress();         // use USDC as debt
  const collateralPrice = ethers.parseEther("2000"); // 1 WETH = $2000
  const debtPrice = ethers.parseEther("1");          // 1 USDC = $1
  const collateralFactor = ethers.parseEther("0.6"); // 60% LTV
  const liquidationThreshold = ethers.parseEther("0.8"); // 80%

  const manager = await CollateralManager.deploy(
    collateralToken,
    debtToken,
    collateralPrice,
    debtPrice,
    collateralFactor,
    liquidationThreshold
  );

  await manager.waitForDeployment();
  console.log("✅ CollateralManager deployed at:", await manager.getAddress());

  console.log("\n🎉 Deployment complete!");
  console.log("WETH:", await weth.getAddress());
  console.log("USDC:", await usdc.getAddress());
  console.log("CollateralManager:", await manager.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
