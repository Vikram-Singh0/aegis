const { ethers } = require("hardhat");

async function main() {
  if (!process.env.PRIVATE_KEY) {
    console.warn("Warning: PRIVATE_KEY is not set. Using empty accounts array may fail on network.");
  }

  console.log("Deploying MyContract to Somnia network...");
  const ContractFactory = await ethers.getContractFactory("MyContract");
  const contract = await ContractFactory.deploy();
  await contract.waitForDeployment();
  console.log("MyContract deployed to:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


