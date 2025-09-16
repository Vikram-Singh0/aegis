"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAccountData, useTokenBalances, usePrices, useContractActions, useUsdcDecimals, formatTokenAmount } from "@/hooks/useContract"
import { CONTRACT_ADDRESSES } from "@/lib/contracts"
import { verifyContractDeployment, testContractInteraction } from "@/utils/contract-verification"
import { useActiveAccount } from "thirdweb/react"
import { getContract, prepareContractCall } from "thirdweb"
import { client } from "@/app/client"
import { USDC_TEST_ABI } from "@/lib/contracts"

export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [contractStatus, setContractStatus] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  
  const account = useActiveAccount()
  const { accountData, hasAccount, isLoading, error } = useAccountData()
  const { wethBalance, usdcBalance } = useTokenBalances()
  const { collateralPrice, debtPrice } = usePrices()
  const { depositCollateral, borrow, repay, withdrawCollateral } = useContractActions()
  const usdcDecimals = useUsdcDecimals() || 6

  const handleVerifyContracts = async () => {
    setIsVerifying(true)
    try {
      const status = await verifyContractDeployment()
      setContractStatus(status)
    } catch (error) {
      console.error("Contract verification failed:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleTestInteraction = async () => {
    if (!account?.address) return
    try {
      const result = await testContractInteraction(account.address)
      console.log("Contract interaction test result:", result)
    } catch (error) {
      console.error("Contract interaction test failed:", error)
    }
  }

  const handleMintUSDC = async () => {
    if (!account?.address) return
    try {
      const usdcTest = getContract({ client, chain: { id: 50312, name: "Somnia Testnet", rpc: "https://dream-rpc.somnia.network" }, address: CONTRACT_ADDRESSES.USDC, abi: USDC_TEST_ABI })
      const mintCall = prepareContractCall({ contract: usdcTest, method: "mint", params: [account.address, BigInt(1_000_000_000)] }) // 1,000 USDC (6 decimals)
      // Note: uses wallet confirmation
      // This uses the same sendTransaction hook as actions; to keep panel self-contained, rely on wallet provider
      // If needed, we could import useSendTransaction here
      // For simplicity, let wallet handle it via injected provider
      ;(window as any).thirdweb?.sendTransaction?.(mintCall)
    } catch (error) {
      console.error("USDC mint failed:", error)
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 text-white"
        >
          Debug Panel
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto">
      <Card className="border-2 border-blue-500 bg-white">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Debug Panel</CardTitle>
            <Button 
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
              variant="outline"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div>
            <strong>Wallet Connected:</strong> {hasAccount ? "Yes" : "No"}
          </div>
          
          <div>
            <strong>Contract Addresses:</strong>
            <div className="ml-2 text-xs">
              <div>Manager: {CONTRACT_ADDRESSES.COLLATERAL_MANAGER}</div>
              <div>WETH: {CONTRACT_ADDRESSES.WETH}</div>
              <div>USDC: {CONTRACT_ADDRESSES.USDC}</div>
            </div>
          </div>

          <div>
            <strong>Account Data:</strong>
            {isLoading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-600">Error: {error.message}</div>
            ) : accountData ? (
              <div className="ml-2">
                <div>Collateral: {formatTokenAmount(accountData[0], 18)} WETH</div>
                <div>Debt: {formatTokenAmount(accountData[1], usdcDecimals)} USDC</div>
                <div>Health Factor: {formatTokenAmount(accountData[5], 18)}</div>
              </div>
            ) : (
              <div>No data</div>
            )}
          </div>

          <div>
            <strong>Token Balances:</strong>
            <div className="ml-2">
              <div>WETH: {formatTokenAmount(wethBalance, 18)}</div>
              <div>USDC: {formatTokenAmount(usdcBalance, usdcDecimals)}</div>
            </div>
          </div>

          <div>
            <strong>Prices:</strong>
            <div className="ml-2">
              <div>WETH: ${formatTokenAmount(collateralPrice, 18)}</div>
              <div>USDC: ${formatTokenAmount(debtPrice, 6)}</div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <strong>Contract Verification:</strong>
            <div className="space-y-1 mt-1">
              <Button 
                size="sm" 
                onClick={handleVerifyContracts}
                disabled={isVerifying}
                className="w-full text-xs"
              >
                {isVerifying ? "Verifying..." : "Verify Contracts"}
              </Button>
              <Button 
                size="sm" 
                onClick={handleTestInteraction}
                className="w-full text-xs"
              >
                Test Interaction
              </Button>
            </div>
            {contractStatus && (
              <div className="mt-2 text-xs">
                <div>Manager: {contractStatus.collateralManager.deployed ? "✓" : "✗"}</div>
                <div>WETH: {contractStatus.weth.deployed ? "✓" : "✗"}</div>
                <div>USDC: {contractStatus.usdc.deployed ? "✓" : "✗"}</div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t">
            <strong>Test Functions:</strong>
            <div className="space-y-1 mt-1">
              <Button 
                size="sm" 
                onClick={() => depositCollateral(BigInt(1000000000000000000))} // 1 WETH
                className="w-full text-xs"
              >
                Test Deposit 1 WETH
              </Button>
              <Button 
                size="sm" 
                onClick={() => borrow(BigInt(1000000))} // 1 USDC
                className="w-full text-xs"
              >
                Test Borrow 1 USDC
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
