import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { StrategyExecutionProvider } from "@/components/modals/strategy-execution-provider";
import { headers } from "next/headers";
import { AppKitProvider } from "@/context/appkit-provider";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Composa - Composable Yield Strategies",
  description:
    "Build automated yield strategies, mint them as NFTs, and trade proven strategies on the marketplace",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const cookies = headersList.get("cookie");

  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased bg-background text-foreground`}>
        <div className="gradient-mesh fixed inset-0 -z-10 pointer-events-none" />
        <AppKitProvider cookies={cookies}>
          <StrategyExecutionProvider>{children}</StrategyExecutionProvider>
          <Analytics />
        </AppKitProvider>
      </body>
    </html>
  );
}
