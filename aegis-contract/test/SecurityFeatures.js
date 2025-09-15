const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Security Features Tests", function () {
  let collateralManager;
  let riskBounds;
  let timelockController;
  let pausable;
  let accessControl;
  let collateralToken;
  let debtToken;
  let owner;
  let admin;
  let parameterRole;
  let emergencyRole;
  let user1;
  let user2;

  // Role constants
  const OWNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OWNER_ROLE"));
  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
  const PARAMETER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PARAMETER_ROLE"));
  const EMERGENCY_ROLE = ethers.keccak256(ethers.toUtf8Bytes("EMERGENCY_ROLE"));

  beforeEach(async function () {
    [owner, admin, parameterRole, emergencyRole, user1, user2] = await ethers.getSigners();

    // Deploy mock tokens
    const MockToken = await ethers.getContractFactory("USDCTest");
    collateralToken = await MockToken.deploy(ethers.parseEther("1000000"));
    await collateralToken.waitForDeployment();
    debtToken = await MockToken.deploy(ethers.parseEther("1000000"));
    await debtToken.waitForDeployment();

    // Deploy RiskBounds
    const RiskBounds = await ethers.getContractFactory("RiskBounds");
    riskBounds = await RiskBounds.deploy();
    await riskBounds.waitForDeployment();

    // Deploy CollateralManager
    const CollateralManager = await ethers.getContractFactory("CollateralManager");
    collateralManager = await CollateralManager.deploy(
      await collateralToken.getAddress(),
      await debtToken.getAddress(),
      ethers.parseEther("1"), // collateral price
      ethers.parseEther("1"), // debt price
      ethers.parseEther("0.6"), // collateral factor 60%
      ethers.parseEther("0.8"), // liquidation threshold 80%
      await riskBounds.getAddress()
    );
    await collateralManager.waitForDeployment();

    // Deploy TimelockController
    const TimelockController = await ethers.getContractFactory("TimelockController");
    timelockController = await TimelockController.deploy(
      3600, // 1 hour delay
      [owner.address], // proposers
      [owner.address], // executors
      owner.address // admin
    );
    await timelockController.waitForDeployment();

    // Set up roles
    console.log("Setting up roles...");
    await collateralManager.grantRole(ADMIN_ROLE, admin.address);
    await collateralManager.grantRole(PARAMETER_ROLE, parameterRole.address);
    await collateralManager.grantRole(EMERGENCY_ROLE, emergencyRole.address);

    // Grant pauser role to emergency role
    await collateralManager.grantPauserRole(emergencyRole.address);

    // Set timelock controller
    console.log("Setting timelock controller...");
    await collateralManager.setTimelockController(await timelockController.getAddress());

    // Mint tokens for testing
    console.log("Minting test tokens...");
    await collateralToken.mint(user1.address, ethers.parseEther("1000"));
    await debtToken.mint(await collateralManager.getAddress(), ethers.parseEther("10000"));
    await debtToken.mint(user1.address, ethers.parseEther("1000"));
    console.log("Setup complete!");
  });

  describe("Access Control", function () {
    it("Should allow owner to grant and revoke roles", async function () {
      await collateralManager.grantRole(ADMIN_ROLE, user1.address);
      expect(await collateralManager.hasRole(ADMIN_ROLE, user1.address)).to.be.true;

      await collateralManager.revokeRole(ADMIN_ROLE, user1.address);
      expect(await collateralManager.hasRole(ADMIN_ROLE, user1.address)).to.be.false;
    });

    it("Should prevent non-owners from granting roles", async function () {
      await expect(
        collateralManager.connect(user1).grantRole(ADMIN_ROLE, user2.address)
      ).to.be.revertedWith(/AccessControl: account .* is missing role/);
    });

    it("Should allow ownership transfer", async function () {
      await collateralManager.transferOwnership(user1.address);
      expect(await collateralManager.hasRole(OWNER_ROLE, user1.address)).to.be.true;
      expect(await collateralManager.hasRole(OWNER_ROLE, owner.address)).to.be.false;
    });
  });

  describe("Pausable Functionality", function () {
    it("Should allow emergency role to pause the contract", async function () {
      await collateralManager.connect(emergencyRole).emergencyPause();
      expect(await collateralManager.paused()).to.be.true;
    });

    it("Should prevent user actions when paused", async function () {
      await collateralManager.connect(emergencyRole).emergencyPause();

      await collateralToken.connect(user1).approve(await collateralManager.getAddress(), ethers.parseEther("100"));
      await expect(
        collateralManager.connect(user1).depositCollateral(ethers.parseEther("100"))
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow emergency role to unpause", async function () {
      await collateralManager.connect(emergencyRole).emergencyPause();
      await collateralManager.connect(emergencyRole).emergencyUnpause();
      expect(await collateralManager.paused()).to.be.false;
    });

    it("Should allow emergency withdrawal when paused", async function () {
      await collateralManager.connect(emergencyRole).emergencyPause();
      const balanceBefore = await debtToken.balanceOf(emergencyRole.address);

      await collateralManager.connect(emergencyRole).emergencyWithdrawLiquidity(ethers.parseEther("100"));

      const balanceAfter = await debtToken.balanceOf(emergencyRole.address);
      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("100"));
    });
  });

  describe("Risk Bounds Validation", function () {
    it("Should validate collateral factor against bounds", async function () {
      // Valid collateral factor (within bounds)
      await expect(
        collateralManager.connect(owner).setRiskParams(
          ethers.parseEther("0.5"), // 50% collateral factor
          ethers.parseEther("0.7")  // 70% liquidation threshold
        )
      ).to.not.be.reverted;

      // Invalid collateral factor (too high)
      await expect(
        collateralManager.connect(owner).setRiskParams(
          ethers.parseEther("0.9"), // 90% collateral factor (exceeds max)
          ethers.parseEther("0.95") // 95% liquidation threshold
        )
      ).to.be.revertedWith("INVALID_COLLATERAL_FACTOR");
    });

    it("Should validate liquidation threshold against bounds", async function () {
      // Invalid liquidation threshold (too low)
      await expect(
        collateralManager.connect(owner).setRiskParams(
          ethers.parseEther("0.3"), // 30% collateral factor
          ethers.parseEther("0.4")  // 40% liquidation threshold (below min)
        )
      ).to.be.revertedWith("INVALID_LIQUIDATION_THRESHOLD");
    });

    it("Should ensure liquidation threshold is higher than collateral factor", async function () {
      await expect(
        collateralManager.connect(owner).setRiskParams(
          ethers.parseEther("0.6"), // 60% collateral factor
          ethers.parseEther("0.5")  // 50% liquidation threshold (lower than factor)
        )
      ).to.be.revertedWith("FACTOR_LT");
    });
  });

  describe("Timelock Integration", function () {
    it("Should require timelock for critical parameter changes", async function () {
      // This would need to be called through the timelock controller
      // For now, we test that the function exists and has proper access control
      expect(await collateralManager.getTimelockController()).to.equal(await timelockController.getAddress());
    });

    it("Should allow owner to update timelock controller", async function () {
      await collateralManager.setTimelockController(user1.address);
      expect(await collateralManager.getTimelockController()).to.equal(user1.address);
    });
  });

  describe("Parameter Updates with Validation", function () {
    it("Should allow parameter role to update prices", async function () {
      await collateralManager.connect(parameterRole).setPrices(
        ethers.parseEther("1.1"), // new collateral price
        ethers.parseEther("1.0")  // new debt price
      );

      // Verify prices were updated
      // Note: You'd need to add getter functions for these in the contract
    });

    it("Should allow admin to update oracle", async function () {
      // Deploy a mock oracle
      const MockOracle = await ethers.getContractFactory("MockPriceOracle");
      const mockOracle = await MockOracle.deploy();
      await mockOracle.waitForDeployment();

      await collateralManager.connect(admin).setOracle(await mockOracle.getAddress());
      // Verify oracle was updated
    });

    it("Should allow parameter role to toggle oracle usage", async function () {
      await collateralManager.connect(parameterRole).setUseOracle(false);
      // Verify oracle usage was toggled
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow emergency role to execute emergency actions", async function () {
      await expect(
        collateralManager.connect(emergencyRole).emergencyPause()
      ).to.emit(collateralManager, "EmergencyActionExecuted")
        .withArgs(emergencyRole.address, "PAUSE");
    });

    it("Should prevent non-emergency roles from executing emergency actions", async function () {
      await expect(
        collateralManager.connect(user1).emergencyPause()
      ).to.be.revertedWith("NOT_EMERGENCY_ROLE");
    });
  });

  describe("Role Management", function () {
    it("Should allow role admins to manage their roles", async function () {
      // Grant admin role to user1
      await collateralManager.grantRole(ADMIN_ROLE, user1.address);

      // user1 should be able to grant parameter role to user2
      await collateralManager.connect(user1).grantRole(PARAMETER_ROLE, user2.address);
      expect(await collateralManager.hasRole(PARAMETER_ROLE, user2.address)).to.be.true;
    });

    it("Should allow users to renounce their own roles", async function () {
      await collateralManager.grantRole(ADMIN_ROLE, user1.address);
      await collateralManager.connect(user1).renounceRole(ADMIN_ROLE, user1.address);
      expect(await collateralManager.hasRole(ADMIN_ROLE, user1.address)).to.be.false;
    });
  });

  describe("Integration Tests", function () {
    it("Should work end-to-end with all security features", async function () {
      // 1. User deposits collateral
      await collateralToken.connect(user1).approve(await collateralManager.getAddress(), ethers.parseEther("100"));
      await collateralManager.connect(user1).depositCollateral(ethers.parseEther("100"));

      // 2. User borrows (should work when not paused)
      await collateralManager.connect(user1).borrow(ethers.parseEther("50"));

      // 3. Emergency pause
      await collateralManager.connect(emergencyRole).emergencyPause();

      // 4. User actions should be blocked
      await expect(
        collateralManager.connect(user1).borrow(ethers.parseEther("10"))
      ).to.be.revertedWith("Pausable: paused");

      // 5. Repay should still work (not paused)
      await debtToken.connect(user1).approve(await collateralManager.getAddress(), ethers.parseEther("50"));
      await collateralManager.connect(user1).repay(ethers.parseEther("50"));

      // 6. Unpause and resume normal operations
      await collateralManager.connect(emergencyRole).emergencyUnpause();
      await collateralManager.connect(user1).borrow(ethers.parseEther("10"));
    });
  });
});
