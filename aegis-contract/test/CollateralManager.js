const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CollateralManager MVP", function () {
  let owner, user;
  let weth, usdc, manager;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    // Deploy mock WETH
    const WETH = await ethers.getContractFactory("WETHTest");
    weth = await WETH.deploy(ethers.parseEther("1000000"));
    await weth.waitForDeployment();

    // Deploy mock USDC
    const USDC = await ethers.getContractFactory("USDCTest");
    usdc = await USDC.deploy(ethers.parseEther("100000000"));
    await usdc.waitForDeployment();

    // Deploy CollateralManager with both tokens
    const Manager = await ethers.getContractFactory("CollateralManager");
    // Prices and risk params (1e18 scaled): WETH=$3000, USDC=$1, CF=60%, LT=80%
    manager = await Manager.deploy(
      await weth.getAddress(),
      await usdc.getAddress(),
      ethers.parseEther("3000"),
      ethers.parseEther("1"),
      ethers.parseEther("0.6"),
      ethers.parseEther("0.8")
    );
    await manager.waitForDeployment();
  });

  it("should let a user deposit WETH as collateral", async () => {
    const depositAmount = ethers.parseEther("10");

    // fund user with WETH
    await weth.transfer(user.address, depositAmount);

    // approve and deposit
    await weth.connect(user).approve(await manager.getAddress(), depositAmount);
    await manager.connect(user).depositCollateral(depositAmount);

    const collateral = await manager.userCollateral(user.address);
    expect(collateral).to.equal(depositAmount);
  });

  it("should mint USDC debt when user borrows", async () => {
    const depositAmount = ethers.parseEther("10");
    const borrowAmount = ethers.parseEther("5000");

    // fund user with WETH
    await weth.transfer(user.address, depositAmount);

    // approve and deposit
    await weth.connect(user).approve(await manager.getAddress(), depositAmount);
    await manager.connect(user).depositCollateral(depositAmount);

    // fund pool with USDC
    await usdc.transfer(await manager.getAddress(), ethers.parseEther("100000"));

    // borrow
    await manager.connect(user).borrow(borrowAmount);

    const debt = await manager.userDebt(user.address);
    expect(debt).to.equal(borrowAmount);
  });

  it("should allow user to repay borrowed USDC", async () => {
    const depositAmount = ethers.parseEther("10");
    const borrowAmount = ethers.parseEther("5000");

    // fund user with WETH
    await weth.transfer(user.address, depositAmount);

    // deposit
    await weth.connect(user).approve(await manager.getAddress(), depositAmount);
    await manager.connect(user).depositCollateral(depositAmount);

    // fund pool with USDC
    await usdc.transfer(await manager.getAddress(), ethers.parseEther("100000"));

    // borrow
    await manager.connect(user).borrow(borrowAmount);

    // repay
    await usdc.connect(user).approve(await manager.getAddress(), borrowAmount);
    await manager.connect(user).repay(borrowAmount);

    const debt = await manager.userDebt(user.address);
    expect(debt).to.equal(0n);
  });

  it("should block over-withdraw that would break health factor", async () => {
    const depositAmount = ethers.parseEther("10");
    const borrowAmount = ethers.parseEther("8000"); // within CF at start

    // fund user with WETH
    await weth.transfer(user.address, depositAmount);

    // deposit
    await weth.connect(user).approve(await manager.getAddress(), depositAmount);
    await manager.connect(user).depositCollateral(depositAmount);

    // fund pool with USDC and borrow
    await usdc.transfer(await manager.getAddress(), ethers.parseEther("100000"));
    await manager.connect(user).borrow(borrowAmount);

    // Simulate price drop by owner: WETH from $3000 -> $1000 (HF ~ 1)
    await manager.connect(owner).setPrices(ethers.parseEther("1000"), ethers.parseEther("1"));

    // Now try withdrawing a small amount; LTV breaks first, expect revert
    await expect(
      manager.connect(user).withdrawCollateral(ethers.parseEther("1"))
    ).to.be.revertedWith("WOULD_BREAK_LTV");
  });
});
