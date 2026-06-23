import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; // 1. Import Montserrat
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { AuthProvider } from "@/contexts/auth-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import ExtensionCleanup from "@/components/ExtensionCleanup";
// 2. Khởi tạo font Montserrat
const montserrat = Montserrat({
  subsets: ["vietnamese"], // Hỗ trợ tiếng Việt
  weight: ["300", "400", "500", "600", "700", "800", "900"], // Đủ các độ đậm nhạt
  display: "swap",
});
// Metadata này sẽ được tự động đưa vào thẻ <head>
// Nó cũng sẽ được sử dụng để tạo các thẻ OpenGraph và Twitter Card
export const metadata: Metadata = {
  title: {
    default: "GZV - GenZ VietNam Company",
    template: "%s | gzv Center",
  },
  description: "Trung tâm đào tạo và phát triển kỹ năng chuyên nghiệp gzv Center - Học tập và nỗ lực suốt đời",
  keywords: "gzv Center, đào tạo, coaching, mentoring, kỹ năng mềm, phát triển bản thân, life long learning, Viện Đào tạo Kỹ năng cho sinh viên và người đi làm",
  authors: [{ name: "gzv Center", url: "https://gzv.one" }],
  creator: "gzv Center",
  publisher: "gzv Center",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://gzv.one"),
  alternates: {
    canonical: "/",
    languages: {
      "vi-VN": "/vi",
      "en-US": "/en",
    },
  },
  openGraph: {
    title: "gzv Center - Life Long Learning",
    description: "Trung tâm đào tạo và phát triển kỹ năng chuyên nghiệp gzv Center",
    url: "https://gzv.one",
    siteName: "gzv Center",
    images: [
      {
        url: "/gzv/assets/og-image.jpg", // Đổi đường dẫn ảnh phù hợp
        width: 1200,
        height: 630,
        alt: "Viện Đào tạo Kỹ năng cho sinh viên và người đi làm",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "gzv Center - Life Long Learning",
    description: "Trung tâm đào tạo và phát triển kỹ năng chuyên nghiệp gzv Center",
    images: ["/gzv/assets/twitter-card.jpg"], // Đổi đường dẫn ảnh phù hợp
    creator: "@gzvcenter",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo/favicon.ico" },
      { url: "/logo/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/logo/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#0c3c78",
      },
    ],
  },
  manifest: "/logo/site.webmanifest",
  generator: "gzv-IT Department",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
     <body suppressHydrationWarning className={`${montserrat.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <AuthProvider>
              <ExtensionCleanup />
              <div className="min-h-screen bg-background text-foreground">
                <Header />
                <main>{children}</main>
                <Footer />
                <FloatingButtons />
              </div>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
