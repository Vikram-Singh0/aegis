const { ethers } = require("hardhat");

async function main() {
  const owner = process.env.OWNER_ADDRESS;
  const manager = process.env.MANAGER_ADDRESS;

  if (!owner || !manager) {
    throw new Error("Missing env: set OWNER_ADDRESS and MANAGER_ADDRESS in .env");
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Owner:", owner);
  console.log("CollateralManager:", manager);

  // 1) Deploy UserVault(owner, manager)
  const UserVault = await ethers.getContractFactory("UserVault");
  const vault = await UserVault.deploy(owner, manager);
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("✅ UserVault deployed at:", vaultAddr);

  // 2) Optionally register in CollateralManager if owner == deployer
  if (owner.toLowerCase() === deployer.address.toLowerCase()) {
    const managerContract = await ethers.getContractAt("CollateralManager", manager);
    const tx = await managerContract.setUserVault(vaultAddr);
    await tx.wait();
    console.log("✅ setUserVault called as owner; vault registered in CollateralManager");
  } else {
    console.log("ℹ️  Skipping setUserVault: only the owner can call this. Use the dApp or have the owner run setUserVault(", vaultAddr, ")");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


