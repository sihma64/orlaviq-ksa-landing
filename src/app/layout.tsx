import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "ORLAVIQ — إضاءة دافئة ورذاذ ناعم لغرفتك",",
  description: "description:
  "موزع روائح بإضاءة دافئة ورذاذ ناعم لإضافة لمسة هادئة داخل الغرفة.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#f7f2ea] text-[#191613]">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}