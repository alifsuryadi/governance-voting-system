import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "../../components/navbar";

export const metadata: Metadata = {
  title: "DAO Governance System",
  description: "Decentralized governance platform on Stacks blockchain",
  keywords: [
    "DAO",
    "governance",
    "blockchain",
    "Stacks",
    "voting",
    "proposals",
  ],
  authors: [{ name: "DAO Governance Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <main className="relative">{children}</main>
        </div>
      </body>
    </html>
  );
}
