import { defineConfig } from "vocs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default defineConfig({
  aiCta: true,
  description: "Bitcoin Native Credit Market. Secure Bitcoin collateral system with Taproot UTXOs, Decentralized Signers, and credit market infrastructure.",
  logoUrl: {
    light: "/logo/surge-icon-rec-light.svg",
    dark: "/logo/surge-icon-rec-dark.svg",
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
  sidebar: {
    "/": [
      {
        text: "OVERVIEW",
        items: [
          {
            text: "Introduction",
            link: "/",
          },
          {
            text: "Market Landscape",
            link: "/overview/bitcoin-lending-landscape",
          },
          {
            text: "Stablecoin Adoption",
            link: "/overview/stablecoins",
          },
        ],
      },
      {
        text: "KNOW THE PRODUCT",
        items: [
          {
            text: "Our Thesis",
            link: "/product/our-thesis",
          },
          {
            text: "Product Overview",
            link: "/product/overview",
            collapsed: false,
            items: [
              {
                text: "For Bitcoiners",
                link: "/product/for-bitcoiners",
              },
              {
                text: "For Liquidity Providers",
                link: "/product/for-liquidity-providers",
              },
              {
                text: "For Distribution Partners",
                link: "/product/for-distribution-partners",
              },
              {
                text: "For Everyone",
                link: "/product/for-everyone",
              },
            ],
          },
        ],
      },
      {
        text: "KNOW THE TECH",
        items: [
          {
            text: "Overview",
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
            text: "Self Custody User Wallet",
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
      {
        text: "RESOURCES",
        items: [
          {
            text: "Media Kit",
            link: "/resources/media-kit",
          },
        ],
      },
    ],
  },
  socials: [
    {
      icon: "github",
      link: "https://github.com/surgebuild/",
    },
    {
      icon: "x",
      link: "https://x.com/surge_credit",
    },
  ],
});
