import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; // 1. Import Montserrat
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { AuthProvider } from "@/contexts/auth-context";
import ExtensionCleanup from "@/components/ExtensionCleanup";
import SiteShell from "@/components/SiteShell";
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
    default: "GZV - The Voice of Genzers",
    template: "%s | GZV - The Voice of Genzers",
  },
  description: "GZV - The Voice of Genzers. Kết nối, đào tạo và phát triển thế hệ trẻ bằng trải nghiệm thực tiễn.",
  keywords: "GZV, The Voice of Genzers, đào tạo, coaching, mentoring, kỹ năng mềm, phát triển bản thân",
  authors: [{ name: "GZV - The Voice of Genzers", url: "https://www.gzv.one" }],
  creator: "GZV - The Voice of Genzers",
  publisher: "GZV - The Voice of Genzers",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.gzv.one"),
  openGraph: {
    title: "GZV - The Voice of Genzers",
    description: "GZV - The Voice of Genzers. Kết nối, đào tạo và phát triển thế hệ trẻ bằng trải nghiệm thực tiễn.",
    url: "https://www.gzv.one",
    siteName: "GZV LTD",
    images: [
      {
        url: "/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "GZV - The Voice of Genzers",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GZV - The Voice of Genzers",
    description: "GZV - The Voice of Genzers. Kết nối, đào tạo và phát triển thế hệ trẻ bằng trải nghiệm thực tiễn.",
    images: ["/og-cover.jpg"],
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
    icon: "/logo/favicon.ico",
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
              <SiteShell>{children}</SiteShell>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
