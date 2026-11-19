import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Arjatala — Peta Digital & Monitoring Titik Sampah Liar",
  description: "Temukan titik sampah liar di sekitar Anda. Laporkan kondisinya, lalu pantau sampai ditangani.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-[#F8FAFC] text-gray-900 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}