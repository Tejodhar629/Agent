import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { ApolloWrapper } from "@/providers/ApolloProvider";

export const metadata: Metadata = {
  title: "सेवासेतू AI (SevaSetu AI) - Government Services Portal",
  description: "AI-powered public welfare schemes, tax, and registration portal for India, GIGW 3.0 and WCAG 2.2 AA compliant.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mr">
      <body className="antialiased bg-[#FAFAF5] text-[#1C1C1C]">
        <AuthProvider>
          <ApolloWrapper>
            {children}
          </ApolloWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
