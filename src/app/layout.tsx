import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "AntoniHost Shop — Hardware, Akun Game & Jasa IT",
    template: "%s · AntoniHost Shop",
  },
  description:
    "Toko komputer, akun MLBB/HOK, dan jasa IT support. Checkout BCA atau DANA di antonihost.my.id/shop.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${outfit.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
