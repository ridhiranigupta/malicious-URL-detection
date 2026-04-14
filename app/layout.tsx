import type { Metadata } from "next";
import { Oxanium, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const headingFont = Oxanium({
  variable: "--font-heading",
  subsets: ["latin"],
});

const bodyFont = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CyberShield AI | Malicious URL Detection",
  description: "Detect phishing and malicious URLs with explainable AI and threat intelligence",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    title: "CyberShield AI",
    description: "Enterprise-grade malicious URL detection with explainable AI.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberShield AI",
    description: "Detect malicious links with explainable threat intelligence.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}>
      <body className="aurora-bg min-h-full flex flex-col font-body text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
