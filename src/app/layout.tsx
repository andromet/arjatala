import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arjatala — Peta Digital & Monitoring Sampah Liar",
  description:
    "Temukan titik sampah liar dan TPS resmi di sekitar Anda. Laporkan kondisinya, lalu pantau sampai ditangani.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
}
