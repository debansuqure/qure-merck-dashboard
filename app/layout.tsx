import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Qure–Merck Partnership Dashboard",
  description: "Programme tracking dashboard for the Qure.ai–Merck partnership",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
