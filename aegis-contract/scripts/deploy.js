const { ethers } = require("hardhat");

async function main() {
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

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

  // 3. Deploy RiskBounds (required by CollateralManager constructor)
  const RiskBounds = await ethers.getContractFactory("RiskBounds");
  const riskBounds = await RiskBounds.deploy();
  await riskBounds.waitForDeployment();
  console.log("✅ RiskBounds deployed at:", await riskBounds.getAddress());

  // 4. Deploy CollateralManager
  const CollateralManager = await ethers.getContractFactory("CollateralManager");

  // Parameters
  const collateralToken = await weth.getAddress();   // use WETH as collateral
  const debtToken = await usdc.getAddress();         // use USDC as debt
  const collateralPrice = ethers.parseEther("2000"); // 1 WETH = $2000
  const debtPrice = ethers.parseEther("1");          // 1 USDC = $1
  const collateralFactor = ethers.parseEther("0.6"); // 60% LTV
  const liquidationThreshold = ethers.parseEther("0.8"); // 80%
  const riskBoundsAddr = await riskBounds.getAddress();

  const manager = await CollateralManager.deploy(
    collateralToken,
    debtToken,
    collateralPrice,
    debtPrice,
    collateralFactor,
    liquidationThreshold,
    riskBoundsAddr
  );

  await manager.waitForDeployment();
  console.log("✅ CollateralManager deployed at:", await manager.getAddress());

  // 5. Deploy MockPriceOracle
  const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
  const oracle = await MockPriceOracle.deploy();
  await oracle.waitForDeployment();
  console.log("✅ MockPriceOracle deployed at:", await oracle.getAddress());

  // 6. Set up oracle in CollateralManager
  await manager.connect(deployer).setOracle(await oracle.getAddress());
  console.log("✅ Oracle set in CollateralManager");

  // 7. Set initial prices in oracle
  const wethOraclePrice = ethers.parseEther("2000"); // $2000
  const usdcOraclePrice = ethers.parseEther("1");    // $1

  await oracle.connect(deployer).setPrice(await weth.getAddress(), wethOraclePrice);
  await oracle.connect(deployer).setPrice(await usdc.getAddress(), usdcOraclePrice);
  console.log("✅ Initial prices set in oracle");

  // 8. Deploy UserVaults for demo users (only if signers exist)
  const UserVault = await ethers.getContractFactory("UserVault");
  let userVault1 = null;
  let userVault2 = null;
  if (user1) {
    userVault1 = await UserVault.deploy(user1.address, await manager.getAddress());
    await userVault1.waitForDeployment();
    console.log("✅ UserVault1 deployed at:", await userVault1.getAddress());
  }
  if (user2) {
    userVault2 = await UserVault.deploy(user2.address, await manager.getAddress());
    await userVault2.waitForDeployment();
    console.log("✅ UserVault2 deployed at:", await userVault2.getAddress());
  }

  // 9. Set up user vaults in CollateralManager (guard if users exist)
  if (user1 && userVault1) {
    await manager.connect(user1).setUserVault(await userVault1.getAddress());
    console.log("✅ User1 vault set in CollateralManager");
  }
  if (user2 && userVault2) {
    await manager.connect(user2).setUserVault(await userVault2.getAddress());
    console.log("✅ User2 vault set in CollateralManager");
  }

  // 10. Fund users with tokens for testing (if present)
  const userFunding = ethers.parseEther("1000");
  if (user1) {
    await weth.transfer(user1.address, userFunding);
    await usdc.transfer(user1.address, userFunding);
  }
  if (user2) {
    await weth.transfer(user2.address, userFunding);
    await usdc.transfer(user2.address, userFunding);
  }
  if (user1 || user2) {
    console.log("✅ Users funded with test tokens");
  } else {
    console.log("ℹ️  Skipping user funding: only deployer available");
  }

  // 11. Fund the CollateralManager pool with USDC for borrowing
  const poolFunding = ethers.parseEther("100000");
  await usdc.transfer(await manager.getAddress(), poolFunding);
  console.log("✅ CollateralManager pool funded with USDC");

  console.log("\n🎉 Deployment complete!");
  console.log("=====================================");
  console.log("Contract Addresses:");
  console.log("WETH:", await weth.getAddress());
  console.log("USDC:", await usdc.getAddress());
  console.log("CollateralManager:", await manager.getAddress());
  console.log("MockPriceOracle:", await oracle.getAddress());
  if (userVault1) console.log("UserVault1 (User1):", await userVault1.getAddress());
  if (userVault2) console.log("UserVault2 (User2):", await userVault2.getAddress());
  console.log("=====================================");
  console.log("User Addresses:");
  console.log("Deployer:", deployer.address);
  if (user1) console.log("User1:", user1.address);
  else console.log("User1: <not available>");
  if (user2) console.log("User2:", user2.address);
  else console.log("User2: <not available>");
  console.log("=====================================");
  console.log("Configuration:");
  console.log("WETH Price (Oracle): $2000");
  console.log("USDC Price (Oracle): $1");
  console.log("Collateral Factor: 60%");
  console.log("Liquidation Threshold: 80%");
  console.log("Oracle Integration: Enabled");
  console.log("=====================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
