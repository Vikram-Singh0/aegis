const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockPriceOracle", function () {
  let owner, user, otherUser;
  let weth, usdc, oracle;

  beforeEach(async () => {
    [owner, user, otherUser] = await ethers.getSigners();

    // Deploy mock WETH
    const WETH = await ethers.getContractFactory("WETHTest");
    weth = await WETH.deploy(ethers.parseEther("1000000"));
    await weth.waitForDeployment();

    // Deploy mock USDC
    const USDC = await ethers.getContractFactory("USDCTest");
    usdc = await USDC.deploy(ethers.parseEther("100000000"));
    await usdc.waitForDeployment();

    // Deploy MockPriceOracle
    const Oracle = await ethers.getContractFactory("MockPriceOracle");
    oracle = await Oracle.deploy();
    await oracle.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the correct owner", async () => {
      expect(await oracle.owner()).to.equal(owner.address);
    });

    it("should initialize with correct default values", async () => {
      expect(await oracle.paused()).to.be.false;
      expect(await oracle.maxPriceAge()).to.equal(24 * 60 * 60); // 24 hours
    });
  });

  describe("Price Management", function () {
    it("should allow owner to set price for a token", async () => {
      const wethPrice = ethers.parseEther("2000"); // $2000

      await expect(oracle.connect(owner).setPrice(await weth.getAddress(), wethPrice))
        .to.emit(oracle, "PriceUpdated");

      expect(await oracle.getPrice(await weth.getAddress())).to.equal(wethPrice);
    });

    it("should allow owner to set prices for multiple tokens", async () => {
      const wethPrice = ethers.parseEther("2000");
      const usdcPrice = ethers.parseEther("1");

      const tokens = [await weth.getAddress(), await usdc.getAddress()];
      const prices = [wethPrice, usdcPrice];

      await expect(oracle.connect(owner).setPrices(tokens, prices))
        .to.emit(oracle, "PriceUpdated");

      expect(await oracle.getPrice(await weth.getAddress())).to.equal(wethPrice);
      expect(await oracle.getPrice(await usdc.getAddress())).to.equal(usdcPrice);
    });

    it("should update existing price and emit event", async () => {
      const initialPrice = ethers.parseEther("2000");
      const newPrice = ethers.parseEther("2500");

      // Set initial price
      await oracle.connect(owner).setPrice(await weth.getAddress(), initialPrice);

      // Update price
      await expect(oracle.connect(owner).setPrice(await weth.getAddress(), newPrice))
        .to.emit(oracle, "PriceUpdated");

      expect(await oracle.getPrice(await weth.getAddress())).to.equal(newPrice);
    });

    it("should revert if non-owner tries to set price", async () => {
      const price = ethers.parseEther("2000");

      await expect(
        oracle.connect(user).setPrice(await weth.getAddress(), price)
      ).to.be.revertedWith("NOT_OWNER");
    });

    it("should revert if setting price for zero address", async () => {
      const price = ethers.parseEther("2000");

      await expect(
        oracle.connect(owner).setPrice(ethers.ZeroAddress, price)
      ).to.be.revertedWith("INVALID_TOKEN");
    });

    it("should revert if setting zero price", async () => {
      await expect(
        oracle.connect(owner).setPrice(await weth.getAddress(), 0)
      ).to.be.revertedWith("INVALID_PRICE");
    });
  });

  describe("Price Queries", function () {
    beforeEach(async () => {
      // Set up prices for testing
      await oracle.connect(owner).setPrice(await weth.getAddress(), ethers.parseEther("2000"));
      await oracle.connect(owner).setPrice(await usdc.getAddress(), ethers.parseEther("1"));
    });

    it("should return correct price", async () => {
      expect(await oracle.getPrice(await weth.getAddress())).to.equal(ethers.parseEther("2000"));
      expect(await oracle.getPrice(await usdc.getAddress())).to.equal(ethers.parseEther("1"));
    });

    it("should return price with timestamp", async () => {
      const [price, timestamp] = await oracle.getPriceWithTimestamp(await weth.getAddress());
      expect(price).to.equal(ethers.parseEther("2000"));
      expect(timestamp).to.be.greaterThan(0);
    });

    it("should return valid price status", async () => {
      expect(await oracle.isValidPrice(await weth.getAddress())).to.be.true;
      expect(await oracle.isValidPrice(await usdc.getAddress())).to.be.true;
    });

    it("should return false for token without price", async () => {
      const newToken = ethers.Wallet.createRandom();
      expect(await oracle.isValidPrice(newToken.address)).to.be.false;
    });

    it("should return last update time", async () => {
      const timestamp = await oracle.getLastUpdateTime(await weth.getAddress());
      expect(timestamp).to.be.greaterThan(0);
    });

    it("should check if token has price", async () => {
      expect(await oracle.hasPrice(await weth.getAddress())).to.be.true;
      expect(await oracle.hasPrice(await usdc.getAddress())).to.be.true;

      const newToken = ethers.Wallet.createRandom();
      expect(await oracle.hasPrice(newToken.address)).to.be.false;
    });
  });

  describe("Oracle Status Management", function () {
    it("should allow owner to pause oracle", async () => {
      await expect(oracle.connect(owner).pause())
        .to.emit(oracle, "OracleStatusChanged");

      expect(await oracle.isPaused()).to.be.true;
    });

    it("should allow owner to unpause oracle", async () => {
      // First pause
      await oracle.connect(owner).pause();

      // Then unpause
      await expect(oracle.connect(owner).unpause())
        .to.emit(oracle, "OracleStatusChanged");

      expect(await oracle.isPaused()).to.be.false;
    });

    it("should revert if non-owner tries to pause", async () => {
      await expect(
        oracle.connect(user).pause()
      ).to.be.revertedWith("NOT_OWNER");
    });

    it("should revert if trying to pause when already paused", async () => {
      await oracle.connect(owner).pause();

      await expect(
        oracle.connect(owner).pause()
      ).to.be.revertedWith("ALREADY_PAUSED");
    });

    it("should revert if trying to unpause when not paused", async () => {
      await expect(
        oracle.connect(owner).unpause()
      ).to.be.revertedWith("NOT_PAUSED");
    });

    it("should not allow price queries when paused", async () => {
      await oracle.connect(owner).setPrice(await weth.getAddress(), ethers.parseEther("2000"));
      await oracle.connect(owner).pause();

      await expect(
        oracle.getPrice(await weth.getAddress())
      ).to.be.revertedWith("ORACLE_PAUSED");
    });

    it("should not allow price setting when paused", async () => {
      await oracle.connect(owner).pause();

      await expect(
        oracle.connect(owner).setPrice(await weth.getAddress(), ethers.parseEther("2000"))
      ).to.be.revertedWith("ORACLE_PAUSED");
    });
  });

  describe("Price Age Management", function () {
    it("should allow owner to set max price age", async () => {
      const newMaxAge = 12 * 60 * 60; // 12 hours

      await oracle.connect(owner).setMaxPriceAge(newMaxAge);
      expect(await oracle.getMaxPriceAge()).to.equal(newMaxAge);
    });

    it("should revert if non-owner tries to set max price age", async () => {
      const newMaxAge = 12 * 60 * 60;

      await expect(
        oracle.connect(user).setMaxPriceAge(newMaxAge)
      ).to.be.revertedWith("NOT_OWNER");
    });

    it("should revert if setting zero max price age", async () => {
      await expect(
        oracle.connect(owner).setMaxPriceAge(0)
      ).to.be.revertedWith("INVALID_MAX_AGE");
    });
  });

  describe("Error Handling", function () {
    it("should revert when querying price for zero address", async () => {
      await expect(
        oracle.getPrice(ethers.ZeroAddress)
      ).to.be.revertedWith("INVALID_TOKEN");
    });

    it("should revert when querying price for token without price set", async () => {
      await expect(
        oracle.getPrice(await weth.getAddress())
      ).to.be.revertedWith("PRICE_NOT_SET");
    });

    it("should revert when setting prices with mismatched array lengths", async () => {
      const tokens = [await weth.getAddress(), await usdc.getAddress()];
      const prices = [ethers.parseEther("2000")]; // Only one price

      await expect(
        oracle.connect(owner).setPrices(tokens, prices)
      ).to.be.revertedWith("ARRAY_LENGTH_MISMATCH");
    });

    it("should revert when setting prices with empty arrays", async () => {
      await expect(
        oracle.connect(owner).setPrices([], [])
      ).to.be.revertedWith("EMPTY_ARRAY");
    });
  });

  describe("Integration with CollateralManager", function () {
    let manager;

    beforeEach(async () => {
      // Deploy CollateralManager
      const Manager = await ethers.getContractFactory("CollateralManager");
      manager = await Manager.deploy(
        await weth.getAddress(),
        await usdc.getAddress(),
        ethers.parseEther("2000"), // fallback collateral price
        ethers.parseEther("1"),    // fallback debt price
        ethers.parseEther("0.6"),  // collateral factor
        ethers.parseEther("0.8")   // liquidation threshold
      );
      await manager.waitForDeployment();

      // Set oracle in CollateralManager
      await manager.connect(owner).setOracle(await oracle.getAddress());
    });

    it("should use oracle prices when available", async () => {
      const oracleWethPrice = ethers.parseEther("2500");
      const oracleUsdcPrice = ethers.parseEther("1.1");

      // Set oracle prices
      await oracle.connect(owner).setPrice(await weth.getAddress(), oracleWethPrice);
      await oracle.connect(owner).setPrice(await usdc.getAddress(), oracleUsdcPrice);

      // Check that CollateralManager uses oracle prices
      expect(await manager.getCurrentCollateralPrice()).to.equal(oracleWethPrice);
      expect(await manager.getCurrentDebtPrice()).to.equal(oracleUsdcPrice);
    });

    it("should fallback to fixed prices when oracle is unavailable", async () => {
      // Don't set oracle prices - should use fallback
      expect(await manager.getCurrentCollateralPrice()).to.equal(ethers.parseEther("2000"));
      expect(await manager.getCurrentDebtPrice()).to.equal(ethers.parseEther("1"));
    });

    it("should fallback to fixed prices when oracle is paused", async () => {
      const oracleWethPrice = ethers.parseEther("2500");

      // Set oracle price and then pause
      await oracle.connect(owner).setPrice(await weth.getAddress(), oracleWethPrice);
      await oracle.connect(owner).pause();

      // Should fallback to fixed price
      expect(await manager.getCurrentCollateralPrice()).to.equal(ethers.parseEther("2000"));
    });

    it("should allow toggling oracle usage", async () => {
      const oracleWethPrice = ethers.parseEther("2500");

      // Set oracle price
      await oracle.connect(owner).setPrice(await weth.getAddress(), oracleWethPrice);

      // Should use oracle price
      expect(await manager.getCurrentCollateralPrice()).to.equal(oracleWethPrice);

      // Disable oracle usage
      await manager.connect(owner).setUseOracle(false);

      // Should use fallback price
      expect(await manager.getCurrentCollateralPrice()).to.equal(ethers.parseEther("2000"));
    });
  });

  // Helper function to get current block timestamp
  async function getBlockTimestamp() {
    const block = await ethers.provider.getBlock('latest');
    return block.timestamp;
  }
});
