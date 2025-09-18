import { getContract, prepareContractCall } from "thirdweb";
import { client } from "@/app/client";
import { CONTRACT_ADDRESSES, COLLATERAL_MANAGER_ABI, ERC20_ABI } from "@/lib/contracts";
import { defineChain } from "thirdweb";

// Define the chain (Somnia testnet)
const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Testnet",
  rpc: "https://dream-rpc.somnia.network",
  nativeCurrency: {
    name: "Somnia",
    symbol: "SOM",
    decimals: 18,
  },
});

// Contract instances
const collateralManagerContract = getContract({
  client,
  chain: somniaTestnet,
  address: CONTRACT_ADDRESSES.COLLATERAL_MANAGER,
  abi: COLLATERAL_MANAGER_ABI,
});

const wethContract = getContract({
  client,
  chain: somniaTestnet,
  address: CONTRACT_ADDRESSES.WETH,
  abi: ERC20_ABI,
});

const usdcContract = getContract({
  client,
  chain: somniaTestnet,
  address: CONTRACT_ADDRESSES.USDC,
  abi: ERC20_ABI,
});

export async function verifyContractDeployment() {
  const results = {
    collateralManager: { deployed: false, error: null as string | null },
    weth: { deployed: false, error: null as string | null },
    usdc: { deployed: false, error: null as string | null },
  };

  // Test CollateralManager contract
  try {
    const call = prepareContractCall({
      contract: collateralManagerContract,
      method: "isPaused",
      params: [],
    });
    await call;
    results.collateralManager.deployed = true;
  } catch (error: any) {
    results.collateralManager.error = error.message;
  }

  // Test WETH contract
  try {
    const call = prepareContractCall({
      contract: wethContract,
      method: "symbol",
      params: [],
    });
    await call;
    results.weth.deployed = true;
  } catch (error: any) {
    results.weth.error = error.message;
  }

  // Test USDC contract
  try {
    const call = prepareContractCall({
      contract: usdcContract,
      method: "symbol",
      params: [],
    });
    await call;
    results.usdc.deployed = true;
  } catch (error: any) {
    results.usdc.error = error.message;
  }

  return results;
}

export async function testContractInteraction(userAddress: string) {
  try {
    // Test getAccountData
    const accountDataCall = prepareContractCall({
      contract: collateralManagerContract,
      method: "getAccountData",
      params: [userAddress],
    });
    
    const accountData = await accountDataCall;
    // Account data retrieved successfully
    
    return {
      success: true,
      accountData,
      message: "Contract interaction successful"
    };
  } catch (error: any) {
    console.error("Contract interaction failed:", error);
    return {
      success: false,
      error: error.message,
      message: "Contract interaction failed"
    };
  }
}
