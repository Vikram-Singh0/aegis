const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Aegis MVP with Enhanced Security Features...\n");

  // Get available signers (on testnet there is usually only 1)
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  if (!deployer) {
    throw new Error("No signer available. Ensure PRIVATE_KEY is set in .env for the selected network.");
  }

  console.log("Deploying contracts with the account:", deployer.address);
  // ethers v6: signer doesn't have getBalance(); use provider
  const deployerBal = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(deployerBal));

  // Resolve role addresses via ENV with safe fallbacks to deployer
  const ROLE_ADMIN = process.env.ROLE_ADMIN || deployer.address;
  const ROLE_PARAMETER = process.env.ROLE_PARAMETER || deployer.address;
  const ROLE_EMERGENCY = process.env.ROLE_EMERGENCY || deployer.address;
  const ROLE_PROPOSER = process.env.ROLE_PROPOSER || deployer.address;
  const ROLE_EXECUTOR = process.env.ROLE_EXECUTOR || deployer.address;

  // Deploy mock tokens first (WETH for collateral, USDC for debt)
  console.log("\n📦 Deploying Mock Tokens...");
  const WETHTest = await ethers.getContractFactory("WETHTest");
  const USDCTest = await ethers.getContractFactory("USDCTest");

  const collateralToken = await WETHTest.deploy(ethers.parseEther("1000000")); // 1M WETH test
  await collateralToken.waitForDeployment();
  console.log("Collateral Token (WETH) deployed to:", await collateralToken.getAddress());

  const debtToken = await USDCTest.deploy(ethers.parseEther("1000000")); // 1M USDC test
  await debtToken.waitForDeployment();
  console.log("Debt Token (USDC) deployed to:", await debtToken.getAddress());

  // Deploy RiskBounds contract
  console.log("\n🛡️ Deploying RiskBounds...");
  const RiskBounds = await ethers.getContractFactory("RiskBounds");
  const riskBounds = await RiskBounds.deploy();
  await riskBounds.waitForDeployment();
  console.log("RiskBounds deployed to:", await riskBounds.getAddress());

  // Deploy TimelockController
  console.log("\n⏰ Deploying TimelockController...");
  const TimelockController = await ethers.getContractFactory("TimelockController");
  const timelockController = await TimelockController.deploy(
    3600, // 1 hour delay for critical operations
    [ROLE_PROPOSER], // proposers
    [ROLE_EXECUTOR], // executors
    ROLE_ADMIN // admin
  );
  await timelockController.waitForDeployment();
  console.log("TimelockController deployed to:", await timelockController.getAddress());

  // Deploy CollateralManager with security features
  console.log("\n🏦 Deploying CollateralManager...");
  const CollateralManager = await ethers.getContractFactory("CollateralManager");
  const collateralManager = await CollateralManager.deploy(
    await collateralToken.getAddress(),
    await debtToken.getAddress(),
    ethers.parseEther("2000"), // collateral price: $2000 per WETH
    ethers.parseEther("1"), // debt price: $1 per USDC
    ethers.parseEther("0.6"), // collateral factor: 60%
    ethers.parseEther("0.8"), // liquidation threshold: 80%
    await riskBounds.getAddress()
  );
  await collateralManager.waitForDeployment();
  console.log("CollateralManager deployed to:", await collateralManager.getAddress());

  // Deploy MockPriceOracle
  console.log("\n🔮 Deploying MockPriceOracle...");
  const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
  const priceOracle = await MockPriceOracle.deploy();
  await priceOracle.waitForDeployment();
  console.log("MockPriceOracle deployed to:", await priceOracle.getAddress());

  // Set up roles and permissions
  console.log("\n👥 Setting up roles and permissions...");

  // Grant roles to different addresses
  await collateralManager.grantRole(
    ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE")),
    ROLE_ADMIN
  );
  console.log("✅ Admin role granted to:", ROLE_ADMIN);

  await collateralManager.grantRole(
    ethers.keccak256(ethers.toUtf8Bytes("PARAMETER_ROLE")),
    ROLE_PARAMETER
  );
  console.log("✅ Parameter role granted to:", ROLE_PARAMETER);

  await collateralManager.grantRole(
    ethers.keccak256(ethers.toUtf8Bytes("EMERGENCY_ROLE")),
    ROLE_EMERGENCY
  );
  console.log("✅ Emergency role granted to:", ROLE_EMERGENCY);

  // Set timelock controller
  await collateralManager.setTimelockController(await timelockController.getAddress());
  console.log("✅ Timelock controller set");

  // Set oracle
  await collateralManager.connect(deployer).setOracle(await priceOracle.getAddress());
  console.log("✅ Price oracle set");

  // Seed initial oracle prices
  const collateralOraclePrice = ethers.parseEther("2000"); // $2000 per WETH
  const debtOraclePrice = ethers.parseEther("1"); // $1 per USDC
  await priceOracle.connect(deployer).setPrice(await collateralToken.getAddress(), collateralOraclePrice);
  await priceOracle.connect(deployer).setPrice(await debtToken.getAddress(), debtOraclePrice);
  console.log("✅ Initial prices set in oracle");

  // Mint initial liquidity
  console.log("\n💰 Setting up initial liquidity...");
  await debtToken.mint(await collateralManager.getAddress(), ethers.parseEther("1000000"));
  console.log("✅ Initial liquidity minted: 1,000,000 tokens");

  // Mint tokens for testing
  await collateralToken.mint(deployer.address, ethers.parseEther("10000"));
  await debtToken.mint(deployer.address, ethers.parseEther("10000"));
  console.log("✅ Test tokens minted for deployer");

  // Display deployment summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("📋 Contract Addresses:");
  console.log("  CollateralManager:", await collateralManager.getAddress());
  console.log("  RiskBounds:", await riskBounds.getAddress());
  console.log("  TimelockController:", await timelockController.getAddress());
  console.log("  CollateralToken:", await collateralToken.getAddress());
  console.log("  DebtToken:", await debtToken.getAddress());
  console.log("  PriceOracle:", await priceOracle.getAddress());

  console.log("\n👥 Role Assignments:");
  console.log("  Owner:", deployer.address);
  console.log("  Admin:", ROLE_ADMIN);
  console.log("  Parameter Manager:", ROLE_PARAMETER);
  console.log("  Emergency Manager:", ROLE_EMERGENCY);
  console.log("  Timelock Proposer:", ROLE_PROPOSER);
  console.log("  Timelock Executor:", ROLE_EXECUTOR);

  console.log("\n⚙️ Configuration:");
  console.log("  Collateral Factor: 60%");
  console.log("  Liquidation Threshold: 80%");
  console.log("  Timelock Delay: 1 hour");
  console.log("  Initial Liquidity: 1,000,000 tokens");

  console.log("\n🔒 Security Features Enabled:");
  console.log("  ✅ Role-based access control");
  console.log("  ✅ Emergency pause functionality");
  console.log("  ✅ Risk parameter bounds validation");
  console.log("  ✅ Timelock for critical operations");
  console.log("  ✅ Ownership transfer capabilities");

  // Save deployment info
  const net = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: { chainId: Number(net.chainId), name: net.name ?? "unknown" },
    timestamp: new Date().toISOString(),
    contracts: {
      CollateralManager: await collateralManager.getAddress(),
      RiskBounds: await riskBounds.getAddress(),
      TimelockController: await timelockController.getAddress(),
      CollateralToken: await collateralToken.getAddress(),
      DebtToken: await debtToken.getAddress(),
      PriceOracle: await priceOracle.getAddress()
    },
    roles: {
      owner: deployer.address,
      admin: ROLE_ADMIN,
      parameterManager: ROLE_PARAMETER,
      emergencyManager: ROLE_EMERGENCY,
      timelockProposer: ROLE_PROPOSER,
      timelockExecutor: ROLE_EXECUTOR
    },
    configuration: {
      collateralFactor: "60%",
      liquidationThreshold: "80%",
      timelockDelay: "1 hour",
      initialLiquidity: "1,000,000 tokens"
    }
  };

  const fs = require('fs');
  fs.writeFileSync(
    `deployment-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment file");

  console.log("\n🚀 Ready for testing and interaction!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
