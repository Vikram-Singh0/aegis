"use client"
import { ConnectButton } from "thirdweb/react";
import { darkTheme } from "thirdweb/react";
import {
  inAppWallet,
  createWallet,
} from "thirdweb/wallets";
import { createThirdwebClient } from "thirdweb";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID!,
});


const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "discord",
        "telegram",
        
        "email",
        "x",
        "passkey",
      ],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
  createWallet("com.okex.wallet"),
];

export default function WalletConnection() {
  return (
    <div className="wallet-connection-wrapper">
      <ConnectButton
        client={client}
        connectButton={{ 
          label: "Connect wallet",
          style: {
            backgroundColor: "transparent",
            border: "1px solid rgba(148, 163, 184, 0.3)",
            borderRadius: "0.5rem",
            color: "#f1f5f9",
            fontSize: "0.875rem",
            fontWeight: "500",
            padding: "0.5rem 1rem",
            transition: "all 0.2s ease-in-out",
            minHeight: "2.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }
        }}
        connectModal={{
          showThirdwebBranding: false,
          size: "wide",
        }}
        theme={darkTheme({
          colors: {
            borderColor: "hsl(229, 13%, 17%)",
            modalBg: "hsl(228, 12%, 8%)",
            skeletonBg: "hsl(233, 12%, 15%)",
            accentButtonBg: "hsl(220, 100%, 50%)",
            accentButtonText: "hsl(0, 0%, 100%)",
            primaryButtonBg: "hsl(220, 100%, 50%)",
            primaryButtonText: "hsl(0, 0%, 100%)",
            secondaryButtonBg: "hsl(229, 13%, 17%)",
            secondaryButtonText: "hsl(0, 0%, 100%)",
            primaryText: "hsl(0, 0%, 100%)",
            secondaryText: "hsl(0, 0%, 80%)",
            modalOverlayBg: "rgba(0, 0, 0, 0.8)",
            separatorLine: "hsl(229, 13%, 17%)",
            success: "hsl(142, 76%, 36%)",
            danger: "hsl(0, 84%, 60%)",
          },
        })}
        wallets={wallets}
      />
      
      <style jsx global>{`
        .wallet-connection-wrapper button:hover {
          background-color: rgba(59, 130, 246, 0.1) !important;
          border-color: rgba(59, 130, 246, 0.5) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }
        
        .wallet-connection-wrapper button:active {
          transform: translateY(0);
        }
        
        /* Custom styling for the connect button */
        .wallet-connection-wrapper [data-testid="connect-button"] {
          background: transparent !important;
          border: 1px solid rgba(148, 163, 184, 0.3) !important;
          border-radius: 0.5rem !important;
          color: #f1f5f9 !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          padding: 0.5rem 1rem !important;
          transition: all 0.2s ease-in-out !important;
          min-height: 2.5rem !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
        }
        
        .wallet-connection-wrapper [data-testid="connect-button"]:hover {
          background-color: rgba(59, 130, 246, 0.1) !important;
          border-color: rgba(59, 130, 246, 0.5) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2) !important;
        }
      `}</style>
    </div>
  );
}
