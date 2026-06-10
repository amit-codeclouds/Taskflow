import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ShellNav from "@/components/ShellNav";
import ShellSidebar from "@/components/ShellSidebar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Taskflow Shell",
  description: "Taskflow MFE host",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: '#121215', color: '#F4F3F0', margin: 0, fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <ShellNav />
        <div style={{ display: 'flex' }}>
          <ShellSidebar />
          <main style={{ flex: 1, padding: '32px 40px' }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
