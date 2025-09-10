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
    <ConnectButton
      client={client}
      connectButton={{ label: "Connect wallet" }}
      connectModal={{
        showThirdwebBranding: false,
        size: "wide",
      }}
      theme={darkTheme({
        colors: {
          borderColor: "hsl(229, 13%, 17%)",
          modalBg: "hsl(228, 12%, 8%)",
          skeletonBg: "hsl(233, 12%, 15%)",
        },
      })}
      wallets={wallets}
    />
  );
}
