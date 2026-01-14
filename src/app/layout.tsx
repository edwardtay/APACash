import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "APACash - Cross-Border Payments on Arbitrum",
  description: "Accept USDC globally, settle in 17 local APAC currencies atomically on Arbitrum.",
  keywords: ["Arbitrum", "USDC", "stablecoin", "payments", "APAC", "Asia-Pacific", "cross-border"],
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "APACash - Cross-Border Payments on Arbitrum",
    description: "Accept USDC globally, settle in local APAC currency atomically.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
