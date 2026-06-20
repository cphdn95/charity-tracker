import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Charity Pledge",
  description:
    "Pledge a donation to one of three charities and watch the giving roll in live.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-gray-950 text-white">{children}</body>
    </html>
  );
}
