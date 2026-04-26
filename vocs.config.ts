import { defineConfig } from "vocs";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Load environment variables
dotenv.config();

const websiteIconPath = fileURLToPath(
  new URL("./docs/components/WebsiteIconWarpcast.tsx", import.meta.url),
);

export default defineConfig({
  aiCta: true,
  description: "Bitcoin Native Credit Market. Secure Bitcoin collateral system with Taproot UTXOs, Decentralized Signers, and credit market infrastructure.",
  logoUrl: {
    light: "/logo/logo-light.png",
    dark: "/logo/logo-dark.png",
  },
  ogImageUrl: "/assets/meta_new.png",
  font: {
    google: "Inter",
  },
  theme: {
    // accentColor: "#f56949"
    accentColor: "#f4431b",
    // colorScheme: "dark",
  },
  title: "Surge - Bitcoin-native Credit Market",
  vite: {
    resolve: {
      alias: [
        {
          find: /^\.\/icons\/Warpcast\.js$/,
          replacement: websiteIconPath,
        },
      ],
    },
  },
  sidebar: {
    "/": [
      {
        text: "KNOW THE TECH",
        items: [
          {
            text: "Introduction",
            link: "/",
          },
          {
            text: "Bitcoin-native Credit Infra",
            link: "/credit-infra",
          },
          {
            text: "Tech Overview",
            link: "/tech/overview",
          },
          {
            text: "Taproot Vaults",
            link: "/tech/vaults",
            collapsed: true,
            items: [
              {
                text: "Repayment",
                link: "/tech/payment",
              },
              {
                text: "Liquidation",
                link: "/tech/dvaults-liquidation",
              },
              {
                text: "Unilateral Exit",
                link: "/tech/exit",
              },
              {
                text: "Transfers",
                link: "/tech/transfers",
              },
            ],
          },
          {
            text: "Distributed Custody Network",
            link: "/tech/distributed-custody-network",
            collapsed: true,
            items: [
              {
                text: "Signing Policy",
                link: "/tech/mpc-signing",
              },
              {
                text: "Key Lifecycle",
                link: "/tech/key-lifecycle",
              },
              {
                text: "Key Shard Security",
                link: "/tech/key-shard-security",
              },
              {
                text: "Disaster Recovery",
                link: "/tech/disaster-recovery",
              },
              {
                text: "Reshare & Signer Onboarding",
                link: "/tech/reshare-onboarding",
              },
            ],
          },
          {
            text: "Smart Contracts",
            link: "/tech/contracts",
            collapsed: true,
            items: [
              {
                text: "Credit Markets",
                link: "/tech/credit-markets",
              },
              {
                text: "Oracle System",
                link: "/tech/oracles",
              },
            ],
          },
          {
            text: "Self-Custody User Wallet",
            link: "/tech/self-custody-wallet",
          },
          {
            text: "Relayer & Workers",
            link: "/tech/relayer",
          },
          {
            text: "FAQs",
            link: "/tech/faqs",
          },
        ],
      },
      // {
      //   text: "EARN SDK",
      //   items: [
      //     {
      //       text: "Earn Overview",
      //       link: "/earn/overview",
      //     },
      //     {
      //       text: "Integration Guide",
      //       link: "/earn/integration",
      //     },
      //   ],
      // },
      // {
      //   text: "RESOURCES",
      //   items: [
      //     {
      //       text: "Media Kit",
      //       link: "/resources/media-kit",
      //     },
      //   ],
      // },
    ],
  },
  socials: [
    {
      icon: "github",
      link: "https://github.com/surgecredit/",
    },
    {
      icon: "x",
      link: "https://x.com/surge_credit",
    },
    {
      icon: "warpcast",
      label: "Website",
      link: "https://surge.credit",
    },
  ],
});
