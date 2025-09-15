const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("UserVault", function () {
  let owner, user, controller, otherUser;
  let weth, usdc, userVault, manager;

  beforeEach(async () => {
    [owner, user, controller, otherUser] = await ethers.getSigners();

    // Deploy mock WETH
    const WETH = await ethers.getContractFactory("WETHTest");
    weth = await WETH.deploy(ethers.parseEther("1000000"));
    await weth.waitForDeployment();

    // Deploy mock USDC
    const USDC = await ethers.getContractFactory("USDCTest");
    usdc = await USDC.deploy(ethers.parseEther("100000000"));
    await usdc.waitForDeployment();

    // Deploy RiskBounds first
    const RiskBounds = await ethers.getContractFactory("RiskBounds");
    const riskBounds = await RiskBounds.deploy();
    await riskBounds.waitForDeployment();

    // Deploy CollateralManager as controller
    const Manager = await ethers.getContractFactory("CollateralManager");
    manager = await Manager.deploy(
      await weth.getAddress(),
      await usdc.getAddress(),
      ethers.parseEther("3000"),
      ethers.parseEther("1"),
      ethers.parseEther("0.6"),
      ethers.parseEther("0.8"),
      await riskBounds.getAddress()
    );
    await manager.waitForDeployment();

    // Deploy UserVault for the user
    const UserVault = await ethers.getContractFactory("UserVault");
    userVault = await UserVault.deploy(user.address, await manager.getAddress());
    await userVault.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the correct owner and controller", async () => {
      expect(await userVault.owner()).to.equal(user.address);
      expect(await userVault.controller()).to.equal(await manager.getAddress());
    });

    it("should revert if owner is zero address", async () => {
      const UserVault = await ethers.getContractFactory("UserVault");
      await expect(
        UserVault.deploy(ethers.ZeroAddress, await manager.getAddress())
      ).to.be.revertedWith("ZERO_ADDR");
    });

    it("should revert if controller is zero address", async () => {
      const UserVault = await ethers.getContractFactory("UserVault");
      await expect(
        UserVault.deploy(user.address, ethers.ZeroAddress)
      ).to.be.revertedWith("ZERO_ADDR");
    });
  });

  describe("Access Control", function () {
    it("should allow controller to call sendToken", async () => {
      const amount = ethers.parseEther("10");

      // Fund the vault with WETH
      await weth.transfer(await userVault.getAddress(), amount);

      // Controller (CollateralManager) should be able to send tokens
      // We need to impersonate the CollateralManager contract to call sendToken
      await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [await manager.getAddress()],
      });

      // Set balance for the CollateralManager contract
      await network.provider.request({
        method: "hardhat_setBalance",
        params: [await manager.getAddress(), "0x1000000000000000000"], // 1 ETH
      });

      const managerSigner = await ethers.getSigner(await manager.getAddress());

      await expect(
        userVault.connect(managerSigner).sendToken(
          await weth.getAddress(),
          otherUser.address,
          amount
        )
      ).to.not.be.reverted;
    });

    it("should revert if non-controller tries to call sendToken", async () => {
      const amount = ethers.parseEther("10");

      // Fund the vault with WETH
      await weth.transfer(await userVault.getAddress(), amount);

      // Non-controller should not be able to send tokens
      await expect(
        userVault.connect(otherUser).sendToken(
          await weth.getAddress(),
          otherUser.address,
          amount
        )
      ).to.be.revertedWith("NOT_CONTROLLER");
    });

    it("should revert if user tries to call sendToken", async () => {
      const amount = ethers.parseEther("10");

      // Fund the vault with WETH
      await weth.transfer(await userVault.getAddress(), amount);

      // Even the owner should not be able to send tokens directly
      await expect(
        userVault.connect(user).sendToken(
          await weth.getAddress(),
          otherUser.address,
          amount
        )
      ).to.be.revertedWith("NOT_CONTROLLER");
    });
  });

  describe("Token Transfers", function () {
    let managerSigner;

    beforeEach(async () => {
      // Impersonate the CollateralManager contract for token transfers
      await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [await manager.getAddress()],
      });

      // Set balance for the CollateralManager contract
      await network.provider.request({
        method: "hardhat_setBalance",
        params: [await manager.getAddress(), "0x1000000000000000000"], // 1 ETH
      });

      managerSigner = await ethers.getSigner(await manager.getAddress());
    });

    it("should successfully transfer WETH tokens", async () => {
      const amount = ethers.parseEther("10");

      // Fund the vault with WETH
      await weth.transfer(await userVault.getAddress(), amount);

      // Check initial balances
      expect(await weth.balanceOf(await userVault.getAddress())).to.equal(amount);
      expect(await weth.balanceOf(otherUser.address)).to.equal(0);

      // Send tokens via controller
      await userVault.connect(managerSigner).sendToken(
        await weth.getAddress(),
        otherUser.address,
        amount
      );

      // Check final balances
      expect(await weth.balanceOf(await userVault.getAddress())).to.equal(0);
      expect(await weth.balanceOf(otherUser.address)).to.equal(amount);
    });

    it("should successfully transfer USDC tokens", async () => {
      const amount = ethers.parseEther("1000");

      // Fund the vault with USDC
      await usdc.transfer(await userVault.getAddress(), amount);

      // Check initial balances
      expect(await usdc.balanceOf(await userVault.getAddress())).to.equal(amount);
      expect(await usdc.balanceOf(otherUser.address)).to.equal(0);

      // Send tokens via controller
      await userVault.connect(managerSigner).sendToken(
        await usdc.getAddress(),
        otherUser.address,
        amount
      );

      // Check final balances
      expect(await usdc.balanceOf(await userVault.getAddress())).to.equal(0);
      expect(await usdc.balanceOf(otherUser.address)).to.equal(amount);
    });

    it("should revert if trying to send to zero address", async () => {
      const amount = ethers.parseEther("10");

      // Fund the vault with WETH
      await weth.transfer(await userVault.getAddress(), amount);

      // Should revert when sending to zero address
      await expect(
        userVault.connect(managerSigner).sendToken(
          await weth.getAddress(),
          ethers.ZeroAddress,
          amount
        )
      ).to.be.revertedWith("BAD_TO");
    });

    it("should revert if token transfer fails", async () => {
      const amount = ethers.parseEther("10");

      // Don't fund the vault - should fail when trying to transfer
      await expect(
        userVault.connect(managerSigner).sendToken(
          await weth.getAddress(),
          otherUser.address,
          amount
        )
      ).to.be.reverted;
    });

    it("should handle partial token transfers", async () => {
      const totalAmount = ethers.parseEther("10");
      const transferAmount = ethers.parseEther("3");

      // Fund the vault with WETH
      await weth.transfer(await userVault.getAddress(), totalAmount);

      // Send partial amount
      await userVault.connect(managerSigner).sendToken(
        await weth.getAddress(),
        otherUser.address,
        transferAmount
      );

      // Check balances
      expect(await weth.balanceOf(await userVault.getAddress())).to.equal(
        totalAmount - transferAmount
      );
      expect(await weth.balanceOf(otherUser.address)).to.equal(transferAmount);
    });
  });

  describe("Integration with CollateralManager", function () {
    it("should work with CollateralManager vault integration", async () => {
      const depositAmount = ethers.parseEther("10");

      // Set up user vault in CollateralManager
      await manager.connect(user).setUserVault(await userVault.getAddress());

      // Fund user with WETH
      await weth.transfer(user.address, depositAmount);

      // Approve and deposit collateral (should go to vault)
      await weth.connect(user).approve(await manager.getAddress(), depositAmount);
      await manager.connect(user).depositCollateral(depositAmount);

      // Check that tokens are in the vault, not the manager
      expect(await weth.balanceOf(await userVault.getAddress())).to.equal(depositAmount);
      expect(await weth.balanceOf(await manager.getAddress())).to.equal(0);

      // Check collateral is recorded in manager
      expect(await manager.userCollateral(user.address)).to.equal(depositAmount);
    });

    it("should allow withdrawal through vault", async () => {
      const depositAmount = ethers.parseEther("10");
      const withdrawAmount = ethers.parseEther("3");

      // Set up user vault in CollateralManager
      await manager.connect(user).setUserVault(await userVault.getAddress());

      // Fund user with WETH and deposit
      await weth.transfer(user.address, depositAmount);
      await weth.connect(user).approve(await manager.getAddress(), depositAmount);
      await manager.connect(user).depositCollateral(depositAmount);

      // Withdraw collateral (should come from vault)
      await manager.connect(user).withdrawCollateral(withdrawAmount);

      // Check balances
      expect(await weth.balanceOf(await userVault.getAddress())).to.equal(
        depositAmount - withdrawAmount
      );
      expect(await weth.balanceOf(user.address)).to.equal(withdrawAmount);
      expect(await manager.userCollateral(user.address)).to.equal(
        depositAmount - withdrawAmount
      );
    });
  });

  describe("Edge Cases", function () {
    let managerSigner;

    beforeEach(async () => {
      // Impersonate the CollateralManager contract for edge case tests
      await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [await manager.getAddress()],
      });

      // Set balance for the CollateralManager contract
      await network.provider.request({
        method: "hardhat_setBalance",
        params: [await manager.getAddress(), "0x1000000000000000000"], // 1 ETH
      });

      managerSigner = await ethers.getSigner(await manager.getAddress());
    });

    it("should handle zero amount transfers", async () => {
      const amount = ethers.parseEther("10");

      // Fund the vault with WETH
      await weth.transfer(await userVault.getAddress(), amount);

      // Zero amount transfer should succeed
      await expect(
        userVault.connect(managerSigner).sendToken(
          await weth.getAddress(),
          otherUser.address,
          0
        )
      ).to.not.be.reverted;
    });

    it("should handle transfers to self", async () => {
      const amount = ethers.parseEther("10");

      // Fund the vault with WETH
      await weth.transfer(await userVault.getAddress(), amount);

      // Transfer to vault's own address should succeed
      await expect(
        userVault.connect(managerSigner).sendToken(
          await weth.getAddress(),
          await userVault.getAddress(),
          amount
        )
      ).to.not.be.reverted;
    });
  });
});
