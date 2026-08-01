import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Peptide Lab · Research Peptides & Reference Standards",
    template: "%s · Peptide Lab",
  },
  description:
    "Catalogue of research-grade peptides with full specifications, batch photography and certificates of analysis. For laboratory research use only.",
  openGraph: {
    title: "Peptide Lab · Research Peptides & Reference Standards",
    description:
      "Research-grade peptides with full specifications and certificates of analysis.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
